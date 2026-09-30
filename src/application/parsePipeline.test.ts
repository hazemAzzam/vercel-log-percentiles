import { describe, expect, it } from 'vitest'
import { parseRecords } from './parsePipeline'

describe('parsePipeline', () => {
  it('counts samples, skips and unknown columns', () => {
    const r = parseRecords(
      [
        { kind: 'record', value: { message: JSON.stringify({ method: 'GET', url: '/a?x=1', duration_ms: 5, ns: 'http' }), region: 'iad1' } },
        { kind: 'record', value: { message: 'boom' } },
        { kind: 'malformed', line: '{"x' },
      ],
      'ndjson',
    )
    expect(r.stats).toMatchObject({ recordsRead: 3, samplesExtracted: 1, linesSkipped: 2, malformed: 1, messagesNonJson: 1, fromApp: 1 })
    expect(r.stats.unknownColumns).toEqual(['region'])
    expect(r.stats.namespaces).toEqual(['http'])
  })
})
