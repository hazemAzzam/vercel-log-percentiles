import { describe, expect, it } from 'vitest'
import { histogram } from './histogram'

describe('histogram', () => {
  it('spreads sub-millisecond values over several bins', () => {
    const bins = histogram([0.1, 0.2, 0.4, 0.8], 4)
    expect(bins).toHaveLength(4)
    expect(bins[0].from).toBeCloseTo(0.1)
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(4)
  })
  it('returns one bin for identical values and none for empty', () => {
    expect(histogram([5, 5])).toHaveLength(1)
    expect(histogram([])).toEqual([])
  })
})
