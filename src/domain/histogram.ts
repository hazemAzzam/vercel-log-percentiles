export interface Bin {
  from: number
  to: number
  count: number
}

/** Log-spaced histogram. Values <= 0 are clamped into the first bin; the floor is the smallest positive value. */
export function histogram(values: ArrayLike<number>, binCount = 12): Bin[] {
  const n = values.length
  if (n === 0) return []
  let minPos = Infinity
  let max = -Infinity
  for (let i = 0; i < n; i++) {
    const v = values[i]
    if (v > 0 && v < minPos) minPos = v
    if (v > max) max = v
  }
  // Smallest positive value is the log floor (sub-millisecond data must not collapse to "1-1").
  const lo = Number.isFinite(minPos) ? minPos : 1
  const hi = Math.max(lo, max)
  if (hi === lo) return [{ from: lo, to: hi, count: n }]
  const ratio = Math.log(hi / lo)
  const bins: Bin[] = Array.from({ length: binCount }, (_, i) => ({
    from: lo * Math.exp((ratio * i) / binCount),
    to: lo * Math.exp((ratio * (i + 1)) / binCount),
    count: 0,
  }))
  for (let i = 0; i < n; i++) bins[binIndex(bins, values[i])].count++
  return bins
}

export function binIndex(bins: readonly Bin[], v: number): number {
  if (bins.length <= 1) return 0
  const lo = bins[0].from
  const hi = bins[bins.length - 1].to
  if (v <= lo) return 0
  if (v >= hi) return bins.length - 1
  const i = Math.floor((Math.log(v / lo) / Math.log(hi / lo)) * bins.length)
  return Math.min(bins.length - 1, Math.max(0, i))
}
