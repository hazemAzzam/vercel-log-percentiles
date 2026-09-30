import { describe, expect, it } from 'vitest'
import { extractSample } from './extractSample'

const inner = {
  time: '2026-09-30T13:58:49.074Z', level: 'info', ns: 'http', msg: 'response ok', method: 'GET',
  url: 'https://roma2go.com/wp-json/custom-api/v1/products/?product_id=93', status: 200, duration_ms: 685,
}

describe('extractSample', () => {
  it('extracts an app sample', () => {
    const r = extractSample({ Message: JSON.stringify(inner) })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.sample).toMatchObject({
      groupKey: 'app:GET /wp-json/custom-api/v1/products/?product_id=:id', source: 'app', ns: 'http',
      durationMs: 685, status: 200, isError: false,
    })
    expect(r.sample.ts).toBe(Date.parse(inner.time))
  })
  it('flags errors by level or status', () => {
    const r = extractSample({ message: JSON.stringify({ ...inner, status: '504' }) })
    expect(r.ok && r.sample.isError && r.sample.status).toBe(504)
  })
  it('extracts a vercel row', () => {
    const r = extractSample({ requestPath: '/en/menu/12', duration: 210, statusCode: 200, requestMethod: 'get' })
    expect(r.ok && r.sample).toMatchObject({ source: 'vercel', ns: 'vercel-request', path: '/en/menu/:id', method: 'GET' })
  })
  it('skips stack traces', () => {
    const r = extractSample({ message: 'TypeError: a.map is not a function\n at x' })
    expect(r).toMatchObject({ ok: false, reason: 'Non-JSON message' })
  })
  it('skips json without duration', () => {
    const r = extractSample({ message: JSON.stringify({ level: 'error', ns: 'products' }) })
    expect(r).toMatchObject({ ok: false, reason: 'No duration field' })
  })
})

describe('group keys', () => {
  it('keeps app and vercel samples of the same route apart', () => {
    const a = extractSample({ message: JSON.stringify({ method: 'GET', url: '/en/menu', duration_ms: 5 }) })
    const v = extractSample({ requestPath: '/en/menu', requestMethod: 'GET', duration: 5 })
    expect(a.ok && v.ok && a.sample.groupKey !== v.sample.groupKey).toBe(true)
  })
})
