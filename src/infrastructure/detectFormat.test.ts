import { describe, expect, it } from 'vitest'
import { detectFormat } from './detectFormat'

describe('detectFormat', () => {
  it('detects formats', () => {
    expect(detectFormat('  [{"a":1}]')).toBe('json')
    expect(detectFormat('{"a":1}\n{"a":2}')).toBe('ndjson')
    expect(detectFormat('﻿{"a":1}')).toBe('ndjson')
    expect(detectFormat('timestamp,message\n1,x')).toBe('csv')
  })
})
