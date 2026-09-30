import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/** White rounded surface with a hairline border. Compose with PanelHeader / PanelTitle / PanelBody. */
export function Panel({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('gap-0 rounded-2xl border border-line bg-surface py-0 ring-0', className)}
      {...props}
    />
  )
}

export function PanelHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5', className)}
      {...props}
    />
  )
}

export function PanelTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2 className={cn('m-0 font-heading text-base font-semibold whitespace-nowrap', className)} {...props} />
  )
}

export function PanelBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function PanelNote({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('m-0 text-xs text-muted-text', className)} {...props} />
}
