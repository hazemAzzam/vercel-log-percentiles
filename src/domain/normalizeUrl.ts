const ORIGIN = /^(?:[a-z][a-z0-9+.-]*:)?\/\/[^/?#]*/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DIGITS = /^\d+$/
const LONG_HEX = /^[0-9a-f]{16,}$/i
const NUMERIC = /^-?\d+(\.\d+)?$/

const isIdSegment = (s: string) => DIGITS.test(s) || UUID.test(s) || LONG_HEX.test(s)

/** Drops origin and hash, replaces id-like path segments with :id, sorts query keys and masks values. */
export function normalizeUrl(input: string): string {
  let rest = input.trim().replace(ORIGIN, '')
  const hash = rest.indexOf('#')
  if (hash >= 0) rest = rest.slice(0, hash)
  const q = rest.indexOf('?')
  const rawPath = q >= 0 ? rest.slice(0, q) : rest
  const rawQuery = q >= 0 ? rest.slice(q + 1) : ''

  const path =
    (rawPath.startsWith('/') ? '' : '/') +
    rawPath
      .split('/')
      .map((seg) => (isIdSegment(seg) ? ':id' : seg))
      .join('/')

  const pairs = rawQuery
    .split('&')
    .filter(Boolean)
    .map((p) => {
      const eq = p.indexOf('=')
      const key = eq >= 0 ? p.slice(0, eq) : p
      const value = eq >= 0 ? p.slice(eq + 1) : ''
      return [key, value] as const
    })
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([key, value]) => {
      if (value === '') return key
      const masked = NUMERIC.test(value) || isIdSegment(value) ? ':id' : `:${key}`
      return `${key}=${masked}`
    })

  return pairs.length ? `${path}?${pairs.join('&')}` : path
}

/** Origin-stripped URL, keeping real ids and query values. */
export function stripOrigin(input: string): string {
  return input.trim().replace(ORIGIN, '') || '/'
}
