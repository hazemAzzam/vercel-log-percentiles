import Papa from 'papaparse'
import type { LogFormat, RawItem } from '@/domain/types'

/** Mutable progress the reader updates; the worker polls `fraction` (0..1). */
export interface ReadProgress {
  fraction: number
}

const asRecord = (v: unknown): RawItem =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? { kind: 'record', value: v as Record<string, unknown> }
    : { kind: 'malformed', line: String(JSON.stringify(v)).slice(0, 300) }

function parseLine(line: string): RawItem {
  try {
    return asRecord(JSON.parse(line))
  } catch {
    return { kind: 'malformed', line: line.slice(0, 300) }
  }
}

/**
 * Splits a byte stream into lines. Progress counts raw bytes (not decoded characters); the decoder runs
 * in streaming mode so multi-byte characters and lines split across chunks survive, and a leading BOM is
 * dropped. Handles CRLF and a final line without a trailing newline.
 */
export async function* readLines(
  stream: ReadableStream<Uint8Array>,
  totalBytes: number,
  progress: ReadProgress,
): AsyncGenerator<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  const total = Math.max(1, totalBytes)
  let buffer = ''
  let seen = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    seen += value.byteLength
    progress.fraction = Math.min(0.99, seen / total)
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (t) yield t
    }
  }
  buffer += decoder.decode()
  const t = buffer.trim()
  if (t) yield t
  progress.fraction = 1
}

async function* readJsonText(file: Blob, progress: ReadProgress): AsyncGenerator<RawItem> {
  const text = (await file.text()).replace(/^﻿/, '')
  const data: unknown = JSON.parse(text)
  const arr = Array.isArray(data) ? data : [data]
  for (let i = 0; i < arr.length; i++) {
    if (i % 1000 === 0) progress.fraction = i / arr.length
    yield asRecord(arr[i])
  }
  progress.fraction = 1
}

/**
 * NDJSON, with a fallback: if the very first line is not valid JSON (e.g. a pretty-printed multi-line
 * object), try parsing the whole file as one JSON document before giving up.
 */
async function* readNdjson(file: Blob, progress: ReadProgress): AsyncGenerator<RawItem> {
  let first = true
  for await (const line of readLines(file.stream(), file.size, progress)) {
    const item = parseLine(line)
    if (first) {
      first = false
      if (item.kind === 'malformed') {
        try {
          yield* readJsonText(file, progress)
          return
        } catch {
          /* genuinely malformed: fall through and keep reading lines */
        }
      }
    }
    yield item
  }
}

/** Streams CSV in chunks (flat memory); the parser is paused until the consumer drains each chunk. */
async function* readCsv(file: Blob, progress: ReadProgress): AsyncGenerator<RawItem> {
  const queue: Record<string, unknown>[][] = []
  let finished = false
  let failure: unknown
  let wake: (() => void) | null = null
  let parser: Papa.Parser | undefined
  const notify = () => {
    wake?.()
    wake = null
  }
  const total = Math.max(1, file.size)

  Papa.parse<Record<string, unknown>>(file as File, {
    header: true,
    skipEmptyLines: true,
    chunkSize: 1 << 20,
    chunk: (res, p) => {
      parser = p
      progress.fraction = Math.min(0.99, res.meta.cursor / total)
      queue.push(res.data)
      p.pause()
      notify()
    },
    complete: () => {
      finished = true
      notify()
    },
    error: (err) => {
      failure = err
      finished = true
      notify()
    },
  })

  for (;;) {
    const rows = queue.shift()
    if (rows) {
      for (const row of rows) yield asRecord(row)
      parser?.resume()
      continue
    }
    if (failure) throw failure instanceof Error ? failure : new Error(String((failure as { message?: string }).message ?? failure))
    if (finished) break
    await new Promise<void>((r) => (wake = r))
  }
  progress.fraction = 1
}

export function iterRecords(file: Blob, format: LogFormat, progress: ReadProgress): AsyncGenerator<RawItem> {
  if (format === 'ndjson') return readNdjson(file, progress)
  if (format === 'json') return readJsonText(file, progress)
  return readCsv(file, progress)
}
