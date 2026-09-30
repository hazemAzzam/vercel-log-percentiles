export type LogFormat = 'json' | 'ndjson' | 'csv'
export type SampleSource = 'app' | 'vercel'

export interface Sample {
  groupKey: string
  method: string
  path: string
  ns: string
  source: SampleSource
  durationMs: number
  /** epoch ms, NaN if unknown */
  ts: number
  isError: boolean
  status?: number
  /** origin-stripped URL with real ids/query values (used by "slowest requests") */
  rawUrl?: string
}

export interface GroupStats {
  groupKey: string
  method: string
  path: string
  source: SampleSource | 'all'
  count: number
  errorRate: number
  min: number
  p50: number
  p75: number
  p90: number
  p95: number
  p99: number
  p999: number
  max: number
}

export interface SkippedExample {
  reason: string
  line: string
}

export interface ParseStats {
  format: LogFormat
  recordsRead: number
  samplesExtracted: number
  /** malformed lines/rows plus records without a usable timing */
  linesSkipped: number
  messagesNonJson: number
  recordsWithoutDuration: number
  malformed: number
  unknownColumns: string[]
  timeRange: [number, number]
  namespaces: string[]
  skippedExamples: SkippedExample[]
  fromApp: number
  fromVercel: number
}

export interface ParseResult {
  samples: Sample[]
  stats: ParseStats
}

export interface Filters {
  search: string
  source: 'all' | 'app' | 'vercel'
  namespaces: Set<string> | null
  from?: number
  to?: number
}

export type RawItem =
  | { kind: 'record'; value: Record<string, unknown> }
  | { kind: 'malformed'; line: string }
