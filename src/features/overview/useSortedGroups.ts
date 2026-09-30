import { useCallback, useMemo, useState } from 'react'
import type { GroupStats } from '@/domain/types'

export type SortKey = 'endpoint' | 'count' | 'errorRate' | 'p50' | 'p75' | 'p90' | 'p95' | 'p99' | 'max'
export type SortDir = 'asc' | 'desc'

const value = (g: GroupStats, k: SortKey): number | string => (k === 'endpoint' ? g.groupKey : k === 'count' ? g.count : g[k])

/** Click-to-sort state + sorted rows. Default: p99 descending. */
export function useSortedGroups(groups: readonly GroupStats[]) {
  const [key, setKey] = useState<SortKey>('p99')
  const [dir, setDir] = useState<SortDir>('desc')

  const toggle = useCallback(
    (next: SortKey) => {
      if (next === key) setDir((d) => (d === 'desc' ? 'asc' : 'desc'))
      else {
        setKey(next)
        setDir(next === 'endpoint' ? 'asc' : 'desc')
      }
    },
    [key],
  )

  const sorted = useMemo(() => {
    const sign = dir === 'asc' ? 1 : -1
    return [...groups].sort((a, b) => {
      const x = value(a, key)
      const y = value(b, key)
      return (x < y ? -1 : x > y ? 1 : 0) * sign
    })
  }, [groups, key, dir])

  const ariaSort = useCallback(
    (k: SortKey): 'ascending' | 'descending' | 'none' => (k !== key ? 'none' : dir === 'asc' ? 'ascending' : 'descending'),
    [key, dir],
  )

  return { sorted, sortKey: key, dir, toggle, ariaSort }
}

export type SortState = Pick<ReturnType<typeof useSortedGroups>, 'sortKey' | 'dir' | 'toggle' | 'ariaSort'>
