import { useCallback, useEffect, useRef, useState } from 'react'
import type { ParseResult } from '@/domain/types'
import type { ParseProgress } from '@/infrastructure/workerProtocol'
import { parseFile, type ParseHandle } from '@/infrastructure/workerClient'

export type LogFileState =
  | { status: 'idle' }
  | { status: 'parsing'; fileName: string; fileSize: number; progress: ParseProgress | null }
  | { status: 'done'; fileName: string; isSample: boolean; result: ParseResult }
  | { status: 'error'; fileName: string; message: string }

/** Owns the worker lifecycle and the idle -> parsing -> done | error state machine. */
export function useLogFile() {
  const [state, setState] = useState<LogFileState>({ status: 'idle' })
  const handle = useRef<ParseHandle | null>(null)
  const sampleFetch = useRef<AbortController | null>(null)

  const stopAll = useCallback(() => {
    handle.current?.cancel()
    handle.current = null
    sampleFetch.current?.abort()
    sampleFetch.current = null
  }, [])

  const cancel = useCallback(() => {
    stopAll()
    setState({ status: 'idle' })
  }, [stopAll])

  const openFile = useCallback(
    (file: File, isSample = false) => {
      stopAll()
      setState({ status: 'parsing', fileName: file.name, fileSize: file.size, progress: null })
      const h = parseFile(file, (progress) =>
        setState((s) => (s.status === 'parsing' ? { ...s, progress } : s)),
      )
      handle.current = h
      h.result
        .then((result) => {
          if (handle.current !== h) return
          handle.current = null
          setState({ status: 'done', fileName: file.name, isSample, result })
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          if (handle.current !== h) return
          handle.current = null
          setState({ status: 'error', fileName: file.name, message: err instanceof Error ? err.message : String(err) })
        })
    },
    [stopAll],
  )

  const loadSample = useCallback(async () => {
    stopAll()
    const name = 'sample-logs.ndjson'
    const ctrl = new AbortController()
    sampleFetch.current = ctrl
    setState({ status: 'parsing', fileName: name, fileSize: 0, progress: null })
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}${name}`, { signal: ctrl.signal })
      if (!res.ok) throw new Error(`Could not load the sample (HTTP ${res.status})`)
      const blob = await res.blob()
      if (ctrl.signal.aborted) return
      sampleFetch.current = null
      openFile(new File([blob], name), true)
    } catch (err) {
      if (ctrl.signal.aborted) return
      sampleFetch.current = null
      setState({ status: 'error', fileName: name, message: err instanceof Error ? err.message : 'Could not load the sample' })
    }
  }, [openFile, stopAll])

  useEffect(() => stopAll, [stopAll])

  return { state, openFile, loadSample, cancel }
}
