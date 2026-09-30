import { createContext, useContext } from 'react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { formatCount, formatEdge } from '@/lib/format'
import type { Bin } from '@/domain/histogram'
import type { Marker } from './useEndpointDetail'

const Ctx = createContext<{ bins: readonly Bin[]; markers: ReadonlyMap<number, Marker[]>; peak: number } | null>(null)

function summarizeBins(bins: readonly Bin[]) {
  if (!bins.length) return 'Latency distribution: no data'
  const top = bins.reduce((a, b) => (b.count > a.count ? b : a))
  const total = bins.reduce((a, b) => a + b.count, 0)
  return `Latency distribution of ${formatCount(total)} samples in ${bins.length} log-spaced buckets from ${formatEdge(bins[0].from)} to ${formatEdge(bins[bins.length - 1].to)} ms; the fullest bucket is ${formatEdge(top.from)} to ${formatEdge(top.to)} ms with ${formatCount(top.count)} samples`
}
const useHist = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('Histogram parts must be inside <Histogram>')
  return c
}

const SHADE: Record<Marker, string> = { p50: 'bg-p50', p95: 'bg-p95', p99: 'bg-p99' }
const ORDER: Marker[] = ['p99', 'p95', 'p50']

export function Histogram({ bins, markers, peak, className, ...props }: { bins: readonly Bin[]; markers: ReadonlyMap<number, Marker[]>; peak: number } & React.ComponentProps<'div'>) {
  return (
    <Ctx.Provider value={{ bins, markers, peak }}>
      <div role="img" aria-label={summarizeBins(bins)} className={cn('flex flex-col gap-3.5', className)} {...props} />
    </Ctx.Provider>
  )
}

export function HistogramBars({ className, ...props }: React.ComponentProps<'div'>) {
  const { bins, markers, peak } = useHist()
  return (
    <div className={cn('flex h-[290px] items-end gap-1.5 border-b border-control', className)} {...props}>
      {bins.map((b, i) => {
        const hit = ORDER.find((m) => markers.get(i)?.includes(m))
        return (
          <div key={i} className="flex h-full min-w-0 grow basis-0 flex-col items-center justify-end gap-1.5">
            <span className="font-mono text-[10px] whitespace-nowrap text-muted-text">{formatCount(b.count)}</span>
            <div
              title={hit ? `${markers.get(i)!.join(', ')} falls here` : undefined}
              className={cn('min-h-[3px] w-full rounded-t-md', hit ? SHADE[hit] : 'bg-bar-idle')}
              style={{ height: `${(b.count / peak) * 84}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

export function HistogramLabels({ className, ...props }: React.ComponentProps<'div'>) {
  const { bins } = useHist()
  return (
    <div className={cn('flex gap-1.5', className)} {...props}>
      {bins.map((b, i) => (
        <span key={i} className="min-w-0 grow basis-0 text-center font-mono text-[10px] whitespace-nowrap text-muted-text">
          {formatEdge(b.from)}
        </span>
      ))}
    </div>
  )
}
