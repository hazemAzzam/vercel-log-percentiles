import { describe, expect, it } from 'vitest'
import { percentile, summarize } from './stats'
import type { Sample } from './types'

const mk = (durationMs: number, isError = false): Sample => ({
  groupKey: 'GET /x', method: 'GET', path: '/x', ns: 'http', source: 'app', durationMs, ts: NaN, isError,
})

describe('percentile', () => {
  it('handles empty and single', () => {
    expect(percentile([], 50)).toBeNaN()
    expect(percentile([7], 99)).toBe(7)
  })
  it('interpolates n=2', () => {
    expect(percentile([10, 20], 50)).toBe(15)
    expect(percentile([10, 20], 99)).toBeCloseTo(19.9)
  })
  it('matches NumPy for 1..10', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(percentile(a, 50)).toBeCloseTo(5.5)
    expect(percentile(a, 90)).toBeCloseTo(9.1)
    expect(percentile(a, 99)).toBeCloseTo(9.91)
  })
})

describe('summarize', () => {
  it('sorts unsorted input and computes error rate', () => {
    const s = summarize([5, 1, 10, 3, 2, 9, 4, 8, 7, 6].map((d) => mk(d, d === 10)))
    expect(s.count).toBe(10)
    expect(s.p50).toBeCloseTo(5.5)
    expect(s.max).toBe(10)
    expect(s.min).toBe(1)
    expect(s.errorRate).toBeCloseTo(0.1)
  })
  it('handles empty', () => {
    const s = summarize([])
    expect(s.count).toBe(0)
    expect(s.p99).toBeNaN()
    expect(s.errorRate).toBe(0)
  })
})

describe('summarize source', () => {
  it('reports mixed samples as all', () => {
    expect(summarize([mk(1), { ...mk(2), source: 'vercel' }]).source).toBe('all')
    expect(summarize([mk(1)]).source).toBe('app')
  })
})
