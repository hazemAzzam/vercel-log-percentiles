const int = new Intl.NumberFormat('en-US')

export function formatCount(n: number): string {
  return Number.isFinite(n) ? int.format(n) : '–'
}

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return '–'
  if (ms < 10) return ms.toFixed(1).replace(/\.0$/, '')
  return int.format(Math.round(ms))
}

export function formatPct(ratio: number, digits = 1): string {
  return Number.isFinite(ratio) ? `${(ratio * 100).toFixed(digits)}%` : '–'
}

/** Compact axis/bucket label: 850, 1.2k, 3k. */
export function formatEdge(ms: number): string {
  if (ms >= 1000) return `${+(ms / 1000).toFixed(ms >= 10000 ? 0 : 1)}k`
  if (ms < 1) return String(+ms.toFixed(2))
  if (ms < 10) return String(+ms.toFixed(1))
  return String(Math.round(ms))
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const p2 = (n: number) => String(n).padStart(2, '0')

/** "30 Sep 13:58:49" in UTC. */
export function formatTime(ts: number): string {
  if (!Number.isFinite(ts)) return '–'
  const d = new Date(ts)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`
}

export function formatTimeRange([from, to]: [number, number]): string {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return '–'
  const a = new Date(from)
  const b = new Date(to)
  const day = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
  const hm = (d: Date) => `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`
  return day(a) === day(b) ? `${day(a)} ${hm(a)}–${hm(b)}` : `${day(a)} ${hm(a)} – ${day(b)} ${hm(b)}`
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 ** 2).toFixed(1)} MB`
}
