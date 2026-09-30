import type * as React from 'react'
import { cn } from '@/lib/utils'
import { formatMs, formatTime } from '@/lib/format'
import type { Sample } from '@/domain/types'

export function SlowestRequests({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol className={cn('m-0 list-none p-0', className)} {...props} />
}

export function SlowestRequestRow({ sample, className, ...props }: { sample: Sample } & React.ComponentProps<'li'>) {
  return (
    <li
      className={cn('grid grid-cols-[124px_minmax(0,1fr)_36px_76px] items-start gap-3 border-b border-divider px-5 py-2.5 font-mono text-xs', className)}
      {...props}
    >
      <span className="whitespace-nowrap text-muted-text">{formatTime(sample.ts)}</span>
      <span className="url-wrap min-w-0">{sample.rawUrl ?? sample.path}</span>
      <span className={cn(sample.isError && 'font-medium text-error')}>{sample.status ?? '–'}</span>
      <span className="text-right font-medium whitespace-nowrap">{formatMs(sample.durationMs)} ms</span>
    </li>
  )
}
