import type * as React from 'react'
import { cn } from '@/lib/utils'

export function SplitScreen({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-h-screen bg-ground', className)} {...props} />
}

export function SplitScreenAside({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn('flex w-[520px] shrink-0 flex-col gap-10 bg-ink p-12 text-sidebar-text', className)}
      {...props}
    />
  )
}

export function SplitScreenMain({ className, ...props }: React.ComponentProps<'main'>) {
  return <main className={cn('flex min-w-0 grow items-center justify-center p-12', className)} {...props} />
}

export function SplitScreenTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn('m-0 font-heading text-[44px] leading-[1.08] font-semibold tracking-[-0.02em]', className)}
      {...props}
    />
  )
}

export function SplitScreenLead({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('m-0 text-base leading-[1.55] text-sidebar-muted', className)} {...props} />
}
