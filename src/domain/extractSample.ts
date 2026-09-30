import { normalizeUrl, stripOrigin } from './normalizeUrl'
import type { Sample } from './types'

export type SkipReason = 'Non-JSON message' | 'No duration field'

export type ExtractResult =
  | { ok: true; sample: Sample }
  | { ok: false; reason: SkipReason; line: string }

const DURATION_KEYS = ['duration', 'durationms', 'duration_ms', 'requestduration', 'elapsed']
const PATH_KEYS = ['requestpath', 'path']
const TIME_KEYS = ['timestampinms', 'timestamp', 'time']
const STATUS_KEYS = ['statuscode', 'status']
const METHOD_KEYS = ['requestmethod', 'method']

/** Outer column names this module understands; everything else is reported as "unused". */
export const KNOWN_COLUMNS = new Set([
  'message',
  'level',
  'ns',
  ...DURATION_KEYS,
  ...PATH_KEYS,
  ...TIME_KEYS,
  ...STATUS_KEYS,
  ...METHOD_KEYS,
])

function toNum(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') return Number(v)
  return NaN
}

function toTs(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? (v < 1e11 ? v * 1000 : v) : NaN
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n < 1e11 ? n * 1000 : n
    return Date.parse(v)
  }
  return NaN
}

export function lowerKeys(rec: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(rec)) out[k.toLowerCase()] = rec[k]
  return out
}

function firstFinite(rec: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const n = toNum(rec[k])
    if (Number.isFinite(n)) return n
  }
  return NaN
}

function firstString(rec: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'string' && v !== '') return v
  }
  return undefined
}

/** Source is part of the key so app and Vercel samples for the same route never merge. */
export const groupKeyOf = (source: Sample['source'], method: string, path: string) =>
  `${source}:${`${method} ${path}`.trim()}`

const clip = (s: string) => (s.length > 300 ? `${s.slice(0, 300)}…` : s)

/** Never throws. */
export function extractSample(record: Record<string, unknown>): ExtractResult {
  const outer = lowerKeys(record)
  const message = outer.message
  let messageIsJson = false

  if (typeof message === 'string' && message.trimStart().startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(message)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        messageIsJson = true
        const inner = lowerKeys(parsed as Record<string, unknown>)
        const durationMs = toNum(inner.duration_ms)
        if (Number.isFinite(durationMs)) {
          const method = typeof inner.method === 'string' ? inner.method.toUpperCase() : ''
          const url = typeof inner.url === 'string' ? inner.url : ''
          const statusN = toNum(inner.status)
          const status = Number.isFinite(statusN) ? statusN : undefined
          const level = typeof inner.level === 'string' ? inner.level : undefined
          const path = normalizeUrl(url)
          return {
            ok: true,
            sample: {
              groupKey: groupKeyOf('app', method, path),
              method,
              path,
              ns: typeof inner.ns === 'string' && inner.ns ? inner.ns : 'app',
              source: 'app',
              durationMs,
              ts: toTs(inner.time ?? outer.timestampinms ?? outer.timestamp),
              isError: (status !== undefined && status >= 400) || level === 'error',
              status,
              rawUrl: stripOrigin(url),
            },
          }
        }
      }
    } catch {
      /* fall through to vercel-row handling */
    }
  }

  const durationMs = firstFinite(outer, DURATION_KEYS)
  const rawPath = firstString(outer, PATH_KEYS)
  if (Number.isFinite(durationMs) && rawPath) {
    const method = (firstString(outer, METHOD_KEYS) ?? '').toUpperCase()
    const path = normalizeUrl(rawPath)
    const statusN = firstFinite(outer, STATUS_KEYS)
    const status = Number.isFinite(statusN) ? statusN : undefined
    return {
      ok: true,
      sample: {
        groupKey: groupKeyOf('vercel', method, path),
        method,
        path,
        ns: 'vercel-request',
        source: 'vercel',
        durationMs,
        ts: toTs(TIME_KEYS.map((k) => outer[k]).find((v) => v !== undefined && v !== '')),
        isError: (status !== undefined && status >= 400) || outer.level === 'error',
        status,
        rawUrl: stripOrigin(rawPath),
      },
    }
  }

  const line = clip(typeof message === 'string' ? message : JSON.stringify(record))
  const reason: SkipReason =
    typeof message === 'string' && !messageIsJson && !Number.isFinite(durationMs)
      ? 'Non-JSON message'
      : 'No duration field'
  return { ok: false, reason, line }
}
