import { createContext, useContext } from 'react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useFileDrop } from './useFileDrop'

type Drop = ReturnType<typeof useFileDrop>
const Ctx = createContext<Drop | null>(null)
function useDrop() {
  const c = useContext(Ctx)
  if (!c) throw new Error('DropZone parts must be used inside <DropZone>')
  return c
}

export function DropZone({ onFile, className, children, ...props }: { onFile: (f: File) => void } & React.ComponentProps<'div'>) {
  const drop = useFileDrop(onFile)
  return (
    <Ctx.Provider value={drop}>
      <div
        data-dragging={drop.isDragging || undefined}
        className={cn(
          'flex min-h-[420px] w-full max-w-[600px] flex-col items-center justify-center gap-[18px] rounded-[20px] px-6 py-8 text-center border-2 border-dashed border-dash bg-surface transition-colors data-dragging:border-p95 data-dragging:bg-lime-soft',
          className,
        )}
        {...drop.dropProps}
        {...props}
      >
        <input {...drop.inputProps} />
        {children}
      </div>
    </Ctx.Provider>
  )
}

export function DropZoneIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex size-16 items-center justify-center rounded-2xl bg-lime-soft', className)} {...props}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 16V4" />
        <path d="M7 9l5-5 5 5" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
    </div>
  )
}

export function DropZoneTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-heading text-[22px] font-semibold', className)} {...props} />
}

export function DropZoneHint({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm text-muted-text', className)} {...props} />
}

export function DropZoneButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { openPicker } = useDrop()
  return (
    <Button
      onClick={openPicker}
      className={cn('mt-1.5 h-[46px] rounded-xl bg-lime px-6 text-[15px] font-semibold text-ink hover:bg-lime/85', className)}
      {...props}
    />
  )
}
