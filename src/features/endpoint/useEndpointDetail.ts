import { useMemo } from 'react'
import { binIndex, histogram } from '@/domain/histogram'
import { summarize } from '@/domain/stats'
import type { Sample } from '@/domain/types'

export type Marker = 'p50' | 'p95' | 'p99'

const statusLabel = (s?: number) => (s === undefined ? 'n/a' : s >= 400 ? `${Math.floor(s / 100)}xx` : String(s))

/** Everything the endpoint page renders, derived once per (samples, group). */
export function useEndpointDetail(samples: readonly Sample[], groupKey: string) {
  return useMemo(() => {
    const own = samples.filter((s) => s.groupKey === groupKey)
    const stats = summarize(own)
    const durations = own.map((s) => s.durationMs)
    const bins = histogram(durations)
    const peak = Math.max(1, ...bins.map((b) => b.count))
    const markers = new Map<number, Marker[]>()
    if (bins.length) {
      for (const [m, v] of [['p50', stats.p50], ['p95', stats.p95], ['p99', stats.p99]] as const) {
        const i = binIndex(bins, v)
        markers.set(i, [...(markers.get(i) ?? []), m])
      }
    }
    const counts = new Map<string, { n: number; error: boolean }>()
    for (const s of own) {
      const k = statusLabel(s.status)
      const c = counts.get(k) ?? { n: 0, error: s.status !== undefined && s.status >= 400 }
      c.n++
      counts.set(k, c)
    }
    const statuses = [...counts.entries()]
      .map(([code, c]) => ({ code, share: c.n / own.length, error: c.error }))
      .sort((a, b) => b.share - a.share)
    const slowest = [...own].sort((a, b) => b.durationMs - a.durationMs).slice(0, 10)
    const ladder: [string, number][] = [
      ['p50', stats.p50], ['p75', stats.p75], ['p90', stats.p90], ['p95', stats.p95],
      ['p99', stats.p99], ['p99.9', stats.p999], ['max', stats.max],
    ]
    return {
      found: own.length > 0,
      stats,
      bins,
      peak,
      markers,
      statuses,
      slowest,
      ladder,
      namespace: own[0]?.ns ?? '',
    }
  }, [samples, groupKey])
}

export type EndpointDetail = ReturnType<typeof useEndpointDetail>
