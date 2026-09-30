/// <reference lib="webworker" />
import { createParser } from '@/application/parsePipeline'
import { detectFormat } from './detectFormat'
import { iterRecords, type ReadProgress } from './readers'
import type { WorkerRequest, WorkerResponse } from './workerProtocol'

const post = (msg: WorkerResponse) => self.postMessage(msg)
const PROGRESS_EVERY = 5000

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const { file } = e.data
    const format = detectFormat(await file.slice(0, 4096).text())
    const parser = createParser(format)
    const progress: ReadProgress = { fraction: 0 }
    let n = 0
    post({ type: 'progress', format, fraction: 0, recordsRead: 0, samplesExtracted: 0, linesSkipped: 0 })
    for await (const item of iterRecords(file, format, progress)) {
      parser.add(item)
      if (++n % PROGRESS_EVERY === 0) {
        post({ type: 'progress', format, fraction: progress.fraction, ...parser.counters() })
      }
    }
    post({ type: 'result', result: parser.finish() })
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
