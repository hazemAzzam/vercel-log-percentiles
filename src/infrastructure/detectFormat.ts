import type { LogFormat } from '@/domain/types'

/** Sniffs the first 4KB: '[' -> json, '{' -> ndjson, anything else -> csv. */
export function detectFormat(head: string): LogFormat {
  const text = head.slice(0, 4096).replace(/^﻿/, '').trimStart()
  if (text.startsWith('[')) return 'json'
  if (text.startsWith('{')) return 'ndjson'
  return 'csv'
}
