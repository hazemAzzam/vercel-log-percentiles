import type * as React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function Sidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-[232px] shrink-0 flex-col gap-7 bg-ink px-4 py-6 whitespace-nowrap text-sidebar-text',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarNav({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="Sections" className={cn('flex flex-col gap-1', className)} {...props} />
}

/** Nav button. Pass `aria-current="page"` on the active one; the dot and background follow it. */
export function SidebarNavItem({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'group flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-left text-sm font-medium text-sidebar-muted outline-none hover:text-on-ink focus-visible:ring-2 focus-visible:ring-lime aria-[current=page]:bg-sidebar-active aria-[current=page]:text-on-ink',
        className,
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-transparent group-aria-[current=page]:bg-lime" />
      {children}
    </button>
  )
}

export function SidebarSpacer({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grow', className)} {...props} />
}

export function SidebarFileCard({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2.5 rounded-xl bg-sidebar-surface p-3.5', className)} {...props} />
}

export function SidebarFileLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('text-xs text-sidebar-muted', className)} {...props} />
}

export function SidebarFileName({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('url-wrap font-mono text-xs', className)} {...props} />
}

export function SidebarFileTag({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('self-start rounded-md bg-lime px-2 py-0.5 text-[11px] font-semibold text-ink', className)}
      {...props}
    />
  )
}

export function SidebarAction({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-[42px] w-full rounded-[10px] border-sidebar-line bg-transparent text-sm text-sidebar-text hover:bg-sidebar-active hover:text-on-ink',
        className,
      )}
      {...props}
    />
  )
}
