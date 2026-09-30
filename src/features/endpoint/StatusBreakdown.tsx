import type * as React from 'react'
import { cn } from '@/lib/utils'
import { formatPct } from '@/lib/format'

export function StatusBreakdown({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('m-0 flex list-none flex-col gap-3.5 p-0', className)} {...props} />
}

export function StatusBreakdownRow({ code, share, error, className, ...props }: { code: string; share: number; error: boolean } & React.ComponentProps<'li'>) {
  return (
    <li className={cn('flex items-center gap-2.5 text-[13px] whitespace-nowrap', className)} {...props}>
      <span className="w-9 font-mono">{code}</span>
      <div className="h-2 grow rounded bg-track" role="presentation">
        <div className={cn('h-full rounded', error ? 'bg-error' : 'bg-p95')} style={{ width: `${Math.max(share * 100, 2)}%` }} />
      </div>
      <span className="w-12 text-right font-mono">{formatPct(share)}</span>
    </li>
  )
}
