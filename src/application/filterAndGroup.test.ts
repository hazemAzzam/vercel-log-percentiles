import { describe, expect, it } from 'vitest'
import { emptyFilters, filterAndGroup } from './filterAndGroup'
import type { Sample } from '@/domain/types'

const mk = (path: string, d: number, o: Partial<Sample> = {}): Sample => ({
  groupKey: `${o.source ?? 'app'}:GET ${path}`, method: 'GET', path, ns: 'http', source: 'app', durationMs: d, ts: 1000, isError: false, ...o,
})
const samples = [
  mk('/a', 10), mk('/a', 20, { isError: true }), mk('/a', 30), mk('/a', 40),
  mk('/b', 5, { source: 'vercel', ns: 'vercel-request', ts: 5000 }),
]

describe('filterAndGroup', () => {
  it('groups and computes error rate', () => {
    const { overall, groups } = filterAndGroup(samples, emptyFilters())
    expect(groups).toHaveLength(2)
    expect(overall.count).toBe(5)
    expect(groups.find((g) => g.path === '/a')?.errorRate).toBeCloseTo(0.25)
  })
  it('filters by source, namespace, search and time', () => {
    const f = emptyFilters()
    expect(filterAndGroup(samples, { ...f, source: 'vercel' }).groups.map((g) => g.path)).toEqual(['/b'])
    expect(filterAndGroup(samples, { ...f, namespaces: new Set(['http']) }).overall.count).toBe(4)
    expect(filterAndGroup(samples, { ...f, search: 'B' }).groups).toHaveLength(1)
    expect(filterAndGroup(samples, { ...f, from: 2000 }).overall.count).toBe(1)
  })
})
