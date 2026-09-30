import type * as React from 'react'
import { cn } from '@/lib/utils'

/** Method pill; POST/PUT/PATCH/DELETE get the lime tint, everything else teal. */
export function MethodBadge({ method, className, ...props }: { method: string } & React.ComponentProps<'span'>) {
  const write = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-[5px] px-2 py-0.5 text-center font-mono text-[10px] font-semibold not-italic',
        write ? 'bg-lime-soft text-lime-deep' : 'bg-teal-soft text-p99',
        className,
      )}
      {...props}
    >
      {method}
    </span>
  )
}
