import type { GroupStats, Sample } from './types'

/** Percentile (0..100) of an ascending-sorted array, linear interpolation (Hyndman-Fan type 7 / PERCENTILE.INC). */
export function percentile(sorted: ArrayLike<number>, p: number): number {
  const n = sorted.length
  if (n === 0) return NaN
  if (n === 1) return sorted[0]
  const h = ((n - 1) * p) / 100
  const lo = Math.floor(h)
  const hi = Math.ceil(h)
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo])
}

export function sortedDurations(samples: readonly Sample[]): Float64Array {
  const arr = new Float64Array(samples.length)
  for (let i = 0; i < samples.length; i++) arr[i] = samples[i].durationMs
  return arr.sort()
}

/** The shared source of the samples, or 'all' when they are mixed/empty. */
function commonSource(samples: readonly Sample[]): GroupStats['source'] {
  const first = samples[0]?.source
  return first && samples.every((s) => s.source === first) ? first : 'all'
}

export function summarize(
  samples: readonly Sample[],
  identity: Partial<Pick<GroupStats, 'groupKey' | 'method' | 'path' | 'source'>> = {},
): GroupStats {
  const first = samples[0]
  const sorted = sortedDurations(samples)
  const n = sorted.length
  let errors = 0
  for (const s of samples) if (s.isError) errors++
  return {
    groupKey: identity.groupKey ?? first?.groupKey ?? '',
    method: identity.method ?? first?.method ?? '',
    path: identity.path ?? first?.path ?? '',
    source: identity.source ?? commonSource(samples),
    count: n,
    errorRate: n ? errors / n : 0,
    min: n ? sorted[0] : NaN,
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    p999: percentile(sorted, 99.9),
    max: n ? sorted[n - 1] : NaN,
  }
}
