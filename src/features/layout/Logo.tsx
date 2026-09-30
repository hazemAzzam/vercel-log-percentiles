import type * as React from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-3 whitespace-nowrap', className)} {...props} />
}

export function LogoMark({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex size-9 items-center justify-center rounded-[9px] bg-lime text-ink', className)} {...props}>
      <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
        <path d="M5 20V12" />
        <path d="M10 20V6" />
        <path d="M15 20V14" />
        <path d="M20 20V4" />
      </svg>
    </div>
  )
}

export function LogoText({ className, children = 'Log Percentiles', ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('font-heading text-[19px] font-semibold', className)} {...props}>
      {children}
    </span>
  )
}
