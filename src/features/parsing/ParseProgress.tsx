import { createContext, useContext } from 'react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCount } from '@/lib/format'
import type { ParseProgress as Data } from '@/infrastructure/workerProtocol'

const Ctx = createContext<Data | null>(null)
const useProgress = () => useContext(Ctx)
const pctOf = (p: Data | null) => Math.round((p?.fraction ?? 0) * 100)

export function ParseProgress({ progress, className, ...props }: { progress: Data | null } & React.ComponentProps<'div'>) {
  return (
    <Ctx.Provider value={progress}>
      <div
        className={cn('flex w-full max-w-[600px] flex-col gap-7 rounded-[20px] border border-line bg-surface p-9', className)}
        {...props}
      />
    </Ctx.Provider>
  )
}

export function ParseProgressHeader({ className, children = 'Progress', ...props }: React.ComponentProps<'div'>) {
  const p = useProgress()
  return (
    <div className={cn('flex items-baseline justify-between whitespace-nowrap', className)} {...props}>
      <span className="font-heading text-xl font-semibold">{children}</span>
      <span className="font-mono text-[40px] font-medium">{pctOf(p)}%</span>
    </div>
  )
}

export function ParseProgressBar({ className, ...props }: Omit<React.ComponentProps<typeof Progress>, "value">) {
  const p = useProgress()
  return (
    <Progress
      value={pctOf(p)}
      aria-label="Parsing progress"
      className={cn(
        '[&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:bg-track [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-p95',
        className,
      )}
      {...props}
    />
  )
}

export function ParseProgressStats({ className, ...props }: React.ComponentProps<'dl'>) {
  return <dl className={cn('m-0 flex flex-col', className)} {...props} />
}

export function ParseProgressStat({
  label,
  field,
  className,
  ...props
}: { label: string; field: 'recordsRead' | 'samplesExtracted' | 'linesSkipped' } & React.ComponentProps<'div'>) {
  const p = useProgress()
  return (
    <div
      className={cn('flex justify-between border-b border-divider py-3 text-sm whitespace-nowrap last:border-b-0', className)}
      {...props}
    >
      <dt className="text-muted-text">{label}</dt>
      <dd className="m-0 font-mono">{formatCount(p?.[field] ?? 0)}</dd>
    </div>
  )
}

export function ParseProgressActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex justify-start', className)} {...props} />
}

export function ParseProgressCancel({ className, children = 'Cancel', ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" className={cn('h-11 rounded-xl border-control px-[18px] text-sm', className)} {...props}>
      {children}
    </Button>
  )
}
