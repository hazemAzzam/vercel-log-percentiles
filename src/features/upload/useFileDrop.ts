import { useCallback, useRef, useState } from 'react'
import type * as React from 'react'

/** Drag-and-drop + file-picker behaviour for a drop zone. */
export function useFileDrop(onFile: (file: File) => void) {
  const [isDragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = useCallback(
    (files: FileList | null) => {
      const f = files?.[0]
      if (f) onFile(f)
    },
    [onFile],
  )

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
      setDragging(false)
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      pick(e.dataTransfer.files)
    },
  }

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept: '.json,.ndjson,.jsonl,.csv,.log,.txt',
    className: 'sr-only',
    tabIndex: -1,
    'aria-label': 'Choose a log export',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      pick(e.target.files)
      e.target.value = ''
    },
  }

  const openPicker = useCallback(() => inputRef.current?.click(), [])

  return { isDragging, dropProps, inputProps, openPicker }
}
