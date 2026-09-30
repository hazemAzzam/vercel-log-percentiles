import type * as React from 'react'
import { cn } from '@/lib/utils'

export function EndpointHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

export function EndpointBackLink({ className, children = '← All endpoints', ...props }: React.ComponentProps<'button'>) {
  return (
    <button type="button" className={cn('self-start text-[13px] text-link outline-none hover:text-link-hover focus-visible:ring-2 focus-visible:ring-ring', className)} {...props}>
      {children}
    </button>
  )
}

export function EndpointTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return <h1 className={cn('m-0 flex items-start gap-3 font-mono text-xl font-medium', className)} {...props} />
}

export function EndpointPath({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('url-wrap min-w-0', className)} {...props} />
}

export function EndpointMeta({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-[13px] text-muted-text', className)} {...props} />
}
