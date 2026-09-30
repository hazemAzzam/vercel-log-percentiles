import { summarize } from '@/domain/stats'
import type { Filters, GroupStats, Sample } from '@/domain/types'

export const ALL_KEY = '__all__'

export const emptyFilters = (): Filters => ({ search: '', source: 'all', namespaces: null })

export function applyFilters(samples: readonly Sample[], f: Filters): Sample[] {
  const q = f.search.trim().toLowerCase()
  const timed = f.from !== undefined || f.to !== undefined
  return samples.filter((s) => {
    if (f.source !== 'all' && s.source !== f.source) return false
    if (f.namespaces && !f.namespaces.has(s.ns)) return false
    if (q && !`${s.method} ${s.path}`.toLowerCase().includes(q)) return false
    if (timed) {
      if (!Number.isFinite(s.ts)) return false
      if (f.from !== undefined && s.ts < f.from) return false
      if (f.to !== undefined && s.ts > f.to) return false
    }
    return true
  })
}

export function groupSamples(samples: readonly Sample[]): Map<string, Sample[]> {
  const map = new Map<string, Sample[]>()
  for (const s of samples) {
    const arr = map.get(s.groupKey)
    if (arr) arr.push(s)
    else map.set(s.groupKey, [s])
  }
  return map
}

/** Summarizes already-filtered samples: per-group stats plus the pinned "All endpoints" aggregate. */
export function summarizeGroups(
  filtered: readonly Sample[],
  source: Filters['source'] = 'all',
): { overall: GroupStats; groups: GroupStats[] } {
  const groups = [...groupSamples(filtered).values()].map((g) => summarize(g))
  const overall = summarize(filtered, { groupKey: ALL_KEY, method: '', path: 'All endpoints', source })
  return { overall, groups }
}

export function filterAndGroup(samples: readonly Sample[], filters: Filters) {
  return summarizeGroups(applyFilters(samples, filters), filters.source)
}
