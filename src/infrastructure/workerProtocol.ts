import type { LogFormat, ParseResult } from '@/domain/types'

export interface ParseProgress {
  format: LogFormat
  /** 0..1 */
  fraction: number
  recordsRead: number
  samplesExtracted: number
  linesSkipped: number
}

export interface WorkerRequest {
  file: File
}

export type WorkerResponse =
  | ({ type: 'progress' } & ParseProgress)
  | { type: 'result'; result: ParseResult }
  | { type: 'error'; message: string }
