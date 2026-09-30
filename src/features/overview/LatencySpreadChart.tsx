import { createContext, useContext } from 'react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { formatMs } from '@/lib/format'
import type { GroupStats } from '@/domain/types'
import type { ChartScale } from './useChartScale'

const ScaleCtx = createContext<ChartScale | null>(null)
const GroupCtx = createContext<GroupStats | null>(null)

function useScale() {
  const s = useContext(ScaleCtx)
  if (!s) throw new Error('Spread chart parts must be inside <LatencySpreadChart>')
  return s
}
function useGroup() {
  const g = useContext(GroupCtx)
  if (!g) throw new Error('Spread row parts must be inside <SpreadRow>')
  return g
}

const COLS = 'grid grid-cols-[minmax(0,1fr)_190px] gap-x-5'

export function LatencySpreadChart({ scale, className, ...props }: { scale: ChartScale } & React.ComponentProps<'div'>) {
  return (
    <ScaleCtx.Provider value={scale}>
      <div className={cn('flex flex-col gap-3', className)} {...props} />
    </ScaleCtx.Provider>
  )
}

export function SpreadLegend({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-[18px] text-xs whitespace-nowrap text-muted-text', className)} {...props}>
      <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border-2 border-p95 bg-surface" />p50</span>
      <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-p95" />p95</span>
      <span className="flex items-center gap-1.5"><span className="size-3.5 rounded-full bg-p99" />p99</span>
    </div>
  )
}

export function SpreadAxis({ className, ...props }: React.ComponentProps<'div'>) {
  const { ticks } = useScale()
  return (
    <div className={cn(COLS, 'border-b border-grid pb-0.5 text-[11px] whitespace-nowrap text-muted-text', className)} {...props}>
      <div className="relative h-4">
        {ticks.map((t) => (
          <span key={t.ms} className="absolute top-0" style={{ left: `${t.pct}%`, transform: t.ms === 0 ? undefined : 'translateX(-50%)' }}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 text-right font-medium">
        <span>p50</span>
        <span>p95</span>
        <span className="text-ink">p99</span>
      </div>
    </div>
  )
}

export function SpreadRow({ group, className, ...props }: { group: GroupStats } & React.ComponentProps<'div'>) {
  return (
    <GroupCtx.Provider value={group}>
      <div className={cn('flex flex-col gap-0.5 border-b border-divider pt-2 pb-1', className)} {...props} />
    </GroupCtx.Provider>
  )
}

export function SpreadLabel({ className, ...props }: React.ComponentProps<'span'>) {
  const g = useGroup()
  return (
    <span className={cn('url-wrap font-mono text-[13px]', className)} {...props}>
      <span className="font-medium text-muted-text">{g.method}</span> {g.path}
    </span>
  )
}

export function SpreadRowBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn(COLS, 'items-center', className)} {...props} />
}

export function SpreadTrack({ className, ...props }: React.ComponentProps<'div'>) {
  const { ticks, pos } = useScale()
  const g = useGroup()
  const dot = 'absolute top-1/2 box-border -translate-x-1/2 -translate-y-1/2 rounded-full'
  return (
    <div className={cn('relative h-[26px]', className)} {...props}>
      {ticks.map((t) => (
        <span key={t.ms} className="absolute top-0 bottom-0 w-px bg-grid" style={{ left: `${t.pct}%` }} />
      ))}
      <span
        className="absolute top-1/2 -mt-[3px] h-1.5 rounded-[3px] bg-range"
        style={{ left: `${pos(g.p50)}%`, width: `${pos(g.p99) - pos(g.p50)}%` }}
      />
      <span className={cn(dot, 'size-3 border-2 border-p95 bg-surface')} style={{ left: `${pos(g.p50)}%` }} />
      <span className={cn(dot, 'size-3 border-2 border-surface bg-p95')} style={{ left: `${pos(g.p95)}%` }} />
      <span className={cn(dot, 'size-4 border-2 border-surface bg-p99')} style={{ left: `${pos(g.p99)}%` }} />
    </div>
  )
}

export function SpreadValues({ className, ...props }: React.ComponentProps<'div'>) {
  const g = useGroup()
  return (
    <div className={cn('grid grid-cols-3 text-right font-mono text-[13px] whitespace-nowrap', className)} {...props}>
      <span className="text-muted-text">{formatMs(g.p50)}</span>
      <span className="text-muted-text">{formatMs(g.p95)}</span>
      <span className="font-semibold">{formatMs(g.p99)}</span>
    </div>
  )
}
