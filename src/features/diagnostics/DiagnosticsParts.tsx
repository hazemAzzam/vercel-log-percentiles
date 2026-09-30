import type * as React from 'react'
import { cn } from '@/lib/utils'

export function DiagnosticsRow({ label, value, className, ...props }: { label: string; value: string } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex justify-between gap-3 border-b border-divider py-2.5 text-sm whitespace-nowrap', className)} {...props}>
      <dt className="text-muted-text">{label}</dt>
      <dd className="m-0 font-mono">{value}</dd>
    </div>
  )
}

export function ColumnChip({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('rounded-[7px] bg-track px-[9px] py-1 font-mono text-xs whitespace-nowrap', className)} {...props} />
}

export function SkippedExample({ reason, line, className, ...props }: { reason: string; line: string } & React.ComponentProps<'li'>) {
  return (
    <li className={cn('flex min-w-0 flex-col gap-2 border-b border-divider px-5 py-3.5', className)} {...props}>
      <span className="self-start rounded-md bg-error-soft px-2 py-0.5 text-xs font-medium whitespace-nowrap text-error-fg">{reason}</span>
      <code className="url-wrap font-mono text-xs text-code">{line}</code>
    </li>
  )
}
