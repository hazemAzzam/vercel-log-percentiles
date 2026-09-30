import type * as React from 'react'
import { cn } from '@/lib/utils'

export function PercentileLadder({ className, ...props }: React.ComponentProps<'dl'>) {
  return <dl className={cn('m-0 flex flex-col', className)} {...props} />
}

export function PercentileLadderStep({ label, value, className, ...props }: { label: string; value: string } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex justify-between border-b border-divider py-[9px] font-mono text-sm whitespace-nowrap', className)} {...props}>
      <dt className="text-muted-text">{label}</dt>
      <dd className="m-0">{value} ms</dd>
    </div>
  )
}
