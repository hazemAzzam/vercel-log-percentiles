import { extractSample, KNOWN_COLUMNS, lowerKeys } from '@/domain/extractSample'
import type { LogFormat, ParseResult, RawItem, Sample, SkippedExample } from '@/domain/types'

const MAX_EXAMPLES = 20
const MAX_COLUMNS = 60

export interface ParseCounters {
  recordsRead: number
  samplesExtracted: number
  linesSkipped: number
}

/** Incremental, pure accumulator: feed it items, read counters any time, call finish() once. */
export function createParser(format: LogFormat) {
  const samples: Sample[] = []
  const unknown = new Set<string>()
  const namespaces = new Set<string>()
  const examples: SkippedExample[] = []
  let recordsRead = 0
  let malformed = 0
  let nonJson = 0
  let noDuration = 0
  let fromApp = 0
  let fromVercel = 0
  let minTs = Infinity
  let maxTs = -Infinity

  const addExample = (reason: string, line: string) => {
    if (examples.length < MAX_EXAMPLES) examples.push({ reason, line })
  }

  return {
    add(item: RawItem) {
      recordsRead++
      if (item.kind === 'malformed') {
        malformed++
        addExample('Malformed line', item.line)
        return
      }
      const lowered = lowerKeys(item.value)
      if (unknown.size < MAX_COLUMNS) {
        for (const k of Object.keys(lowered)) if (!KNOWN_COLUMNS.has(k)) unknown.add(k)
      }
      const res = extractSample(item.value)
      if (!res.ok) {
        if (res.reason === 'Non-JSON message') nonJson++
        else noDuration++
        addExample(res.reason, res.line)
        return
      }
      const s = res.sample
      samples.push(s)
      namespaces.add(s.ns)
      if (s.source === 'app') fromApp++
      else fromVercel++
      if (Number.isFinite(s.ts)) {
        if (s.ts < minTs) minTs = s.ts
        if (s.ts > maxTs) maxTs = s.ts
      }
    },
    counters(): ParseCounters {
      return {
        recordsRead,
        samplesExtracted: samples.length,
        linesSkipped: malformed + nonJson + noDuration,
      }
    },
    finish(): ParseResult {
      return {
        samples,
        stats: {
          format,
          recordsRead,
          samplesExtracted: samples.length,
          linesSkipped: malformed + nonJson + noDuration,
          messagesNonJson: nonJson,
          recordsWithoutDuration: noDuration,
          malformed,
          unknownColumns: [...unknown].sort(),
          timeRange: Number.isFinite(minTs) ? [minTs, maxTs] : [NaN, NaN],
          namespaces: [...namespaces].sort(),
          skippedExamples: examples,
          fromApp,
          fromVercel,
        },
      }
    },
  }
}

export function parseRecords(items: Iterable<RawItem>, format: LogFormat): ParseResult {
  const p = createParser(format)
  for (const item of items) p.add(item)
  return p.finish()
}
