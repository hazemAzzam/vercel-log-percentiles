import type * as React from 'react'
import { cn } from '@/lib/utils'

export function AppShell({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-h-screen bg-ground', className)} {...props} />
}

export function AppShellMain({ className, ...props }: React.ComponentProps<'main'>) {
  return <main className={cn('flex min-w-0 grow flex-col gap-5 px-8 py-7', className)} {...props} />
}

export function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return <h1 className={cn('m-0 font-heading text-[28px] font-semibold tracking-[-0.01em]', className)} {...props} />
}

export function PageSubtitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('m-0 text-sm text-muted-text', className)} {...props} />
}
