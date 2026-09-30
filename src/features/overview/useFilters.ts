import { useMemo, useState } from 'react'
import type { Filters } from '@/domain/types'

/** Sentinel for "no namespace filter"; cannot collide with a real namespace name. */
export const ALL_NAMESPACES = '__all__'

export type TimeWindow = 'all' | '15m' | '1h' | '24h'
export const WINDOW_LABELS: Record<TimeWindow, string> = {
  all: 'Whole file',
  '15m': 'Last 15 minutes',
  '1h': 'Last hour',
  '24h': 'Last 24 hours',
}
const WINDOW_MS: Record<Exclude<TimeWindow, 'all'>, number> = { '15m': 9e5, '1h': 36e5, '24h': 864e5 }

/** Filter state for the overview; windows are relative to the newest sample in the file. */
export function useFilters(timeRangeEnd: number) {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<Filters['source']>('all')
  const [namespace, setNamespace] = useState(ALL_NAMESPACES)
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all')

  const filters = useMemo<Filters>(
    () => ({
      search,
      source,
      namespaces: namespace === ALL_NAMESPACES ? null : new Set([namespace]),
      from: timeWindow !== 'all' && Number.isFinite(timeRangeEnd) ? timeRangeEnd - WINDOW_MS[timeWindow] : undefined,
      to: undefined,
    }),
    [search, source, namespace, timeWindow, timeRangeEnd],
  )

  return { filters, search, source, namespace, timeWindow, setSearch, setSource, setNamespace, setTimeWindow }
}

export type FiltersState = ReturnType<typeof useFilters>
