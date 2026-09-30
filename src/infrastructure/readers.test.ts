import { describe, expect, it } from 'vitest'
import { iterRecords, readLines, type ReadProgress } from './readers'

const enc = new TextEncoder()
const streamOf = (...chunks: (string | Uint8Array)[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(typeof ch === 'string' ? enc.encode(ch) : ch)
      c.close()
    },
  })
async function collect<T>(g: AsyncGenerator<T>) {
  const out: T[] = []
  for await (const x of g) out.push(x)
  return out
}

describe('readLines', () => {
  it('joins a line split across chunks', async () => {
    const p: ReadProgress = { fraction: 0 }
    expect(await collect(readLines(streamOf('{"a":', '1}\n{"b"', ':2}\n'), 20, p))).toEqual(['{"a":1}', '{"b":2}'])
  })
  it('yields a last line without trailing newline', async () => {
    expect(await collect(readLines(streamOf('a\nb'), 3, { fraction: 0 }))).toEqual(['a', 'b'])
  })
  it('handles CRLF', async () => {
    expect(await collect(readLines(streamOf('a\r\nb\r\n'), 6, { fraction: 0 }))).toEqual(['a', 'b'])
  })
  it('strips a UTF-8 BOM', async () => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf])
    expect(await collect(readLines(streamOf(bom, '{"a":1}\n'), 10, { fraction: 0 }))).toEqual(['{"a":1}'])
  })
  it('does not split multi-byte characters across chunks and counts bytes', async () => {
    const bytes = enc.encode('é\n') // 0xC3 0xA9 0x0A
    const p: ReadProgress = { fraction: 0 }
    const lines = await collect(readLines(streamOf(bytes.slice(0, 1), bytes.slice(1)), bytes.length, p))
    expect(lines).toEqual(['é'])
    expect(p.fraction).toBe(1)
  })
})

describe('iterRecords', () => {
  it('falls back to whole-file JSON for a pretty-printed object', async () => {
    const file = new Blob(['{\n  "message": "x",\n  "duration": 5\n}\n'])
    const items = await collect(iterRecords(file, 'ndjson', { fraction: 0 }))
    expect(items).toEqual([{ kind: 'record', value: { message: 'x', duration: 5 } }])
  })
  it('keeps malformed lines after a valid first line', async () => {
    const items = await collect(iterRecords(new Blob(['{"a":1}\n{"b\n']), 'ndjson', { fraction: 0 }))
    expect(items.map((i) => i.kind)).toEqual(['record', 'malformed'])
  })
  it('reads a json array', async () => {
    const items = await collect(iterRecords(new Blob(['[{"a":1},{"a":2}]']), 'json', { fraction: 0 }))
    expect(items).toHaveLength(2)
  })
})
