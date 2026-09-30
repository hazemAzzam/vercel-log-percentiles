import type { ParseResult } from '@/domain/types'
import type { ParseProgress, WorkerResponse } from './workerProtocol'

export interface ParseHandle {
  result: Promise<ParseResult>
  /** Terminates the worker; `result` rejects with an AbortError. */
  cancel: () => void
}

export function parseFile(file: File, onProgress?: (p: ParseProgress) => void): ParseHandle {
  const worker = new Worker(new URL('./parse.worker.ts', import.meta.url), { type: 'module' })
  let rejectFn: (e: unknown) => void = () => {}
  const result = new Promise<ParseResult>((resolve, reject) => {
    rejectFn = reject
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data
      if (msg.type === 'progress') {
        const { type: _t, ...p } = msg
        onProgress?.(p)
      } else if (msg.type === 'result') {
        worker.terminate()
        resolve(msg.result)
      } else {
        worker.terminate()
        reject(new Error(msg.message))
      }
    }
    worker.onmessageerror = () => {
      worker.terminate()
      reject(new Error('Could not read the worker response'))
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(new Error(e.message || 'Worker failed'))
    }
    worker.postMessage({ file })
  })
  return {
    result,
    cancel: () => {
      worker.terminate()
      rejectFn(new DOMException('Parsing cancelled', 'AbortError'))
    },
  }
}
