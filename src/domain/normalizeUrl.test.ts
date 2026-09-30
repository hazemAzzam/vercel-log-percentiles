import { describe, expect, it } from 'vitest'
import { normalizeUrl } from './normalizeUrl'

describe('normalizeUrl', () => {
  it('strips origin and masks numeric query values', () => {
    expect(normalizeUrl('https://roma2go.com/wp-json/custom-api/v1/products/?product_id=93')).toBe(
      '/wp-json/custom-api/v1/products/?product_id=:id',
    )
  })
  it('masks non-numeric values by key and sorts keys', () => {
    expect(normalizeUrl('https://x.com/product-detail/v1/by-slug?slug=margherita')).toBe(
      '/product-detail/v1/by-slug?slug=:slug',
    )
    expect(normalizeUrl('/a?z=1&b=foo')).toBe('/a?b=:b&z=:id')
  })
  it('replaces uuid, digits and long hex segments', () => {
    expect(normalizeUrl('/orders/123/items/3f2b8c1e-1a2b-4c3d-8e9f-0123456789ab')).toBe('/orders/:id/items/:id')
    expect(normalizeUrl('/blob/0123456789abcdef0123')).toBe('/blob/:id')
  })
  it('keeps plain paths and drops hash', () => {
    expect(normalizeUrl('/en/menu#top')).toBe('/en/menu')
    expect(normalizeUrl('https://a.com')).toBe('/')
  })
})

describe('normalizeUrl protocol-relative', () => {
  it('strips //host', () => {
    expect(normalizeUrl('//cdn.example.com/a/5?x=1')).toBe('/a/:id?x=:id')
  })
})
