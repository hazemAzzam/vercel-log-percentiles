import { useMemo } from 'react'
import type { ParseStats } from '@/domain/types'
import { formatCount } from '@/lib/format'

/** Derives display rows for the diagnostics page from ParseStats. */
export function useDiagnostics(stats: ParseStats) {
  return useMemo(
    () => ({
      format: stats.format.toUpperCase(),
      provenance: [
        ['From app logs', formatCount(stats.fromApp)],
        ['From Vercel requests', formatCount(stats.fromVercel)],
        ['Non-JSON messages', formatCount(stats.messagesNonJson)],
        ['No duration field', formatCount(stats.recordsWithoutDuration)],
        ['Malformed lines', formatCount(stats.malformed)],
      ] as [string, string][],
      unusedColumns: stats.unknownColumns,
      // de-duplicated so reason+line is a stable React key
      examples: [...new Map(stats.skippedExamples.map((e) => [`${e.reason}|${e.line}`, e])).values()],
    }),
    [stats],
  )
}
