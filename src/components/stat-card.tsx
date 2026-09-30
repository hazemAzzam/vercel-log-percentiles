import type * as React from 'react'
import { cn } from '@/lib/utils'

export function StatCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 rounded-[14px] border border-line bg-surface px-4 py-3.5 whitespace-nowrap', className)}
      {...props}
    />
  )
}

export function StatCardLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('text-xs text-muted-text', className)} {...props} />
}

export function StatCardValue({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('font-mono text-xl', className)} {...props} />
}

export function StatCardUnit({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('text-[13px] text-muted-text', className)} {...props} />
}

export function StatGrid({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid gap-3', className)} {...props} />
}
