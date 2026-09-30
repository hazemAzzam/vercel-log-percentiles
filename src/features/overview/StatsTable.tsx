import { createContext, useContext } from 'react'
import type * as React from 'react'
import { cn } from '@/lib/utils'
import { MethodBadge } from '@/components/method-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCount, formatMs, formatPct } from '@/lib/format'
import type { GroupStats } from '@/domain/types'
import { MIN_RELIABLE_SAMPLES } from './useChartScale'
import type { SortKey, SortState } from './useSortedGroups'

const Ctx = createContext<SortState | null>(null)

export function StatsTable({ sort, className, ...props }: { sort: SortState } & React.ComponentProps<typeof Table>) {
  return (
    <Ctx.Provider value={sort}>
      <Table className={cn('table-fixed', className)} {...props} />
    </Ctx.Provider>
  )
}

export function StatsTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader className={cn('bg-field [&_tr]:border-divider', className)} {...props} />
}

export function StatsTableHeaderRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return <TableRow className={cn('hover:bg-transparent', className)} {...props} />
}

/** Sortable column header: a real button inside a `th` carrying aria-sort. */
export function StatsTableColumn({ sortKey, className, children, ...props }: { sortKey: SortKey } & React.ComponentProps<typeof TableHead>) {
  const sort = useContext(Ctx)
  if (!sort) throw new Error('StatsTableColumn must be used inside <StatsTable>')
  const active = sort.sortKey === sortKey
  return (
    <TableHead
      aria-sort={sort.ariaSort(sortKey)}
      className={cn('h-10 px-1 text-right text-xs font-medium text-muted-text first:pl-5 last:pr-5', active && 'text-ink', className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => sort.toggle(sortKey)}
        className="inline-flex items-center gap-0.5 rounded px-0.5 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
        {active && <span aria-hidden="true">{sort.dir === 'desc' ? '↓' : '↑'}</span>}
      </button>
    </TableHead>
  )
}

export function StatsTableBody(props: React.ComponentProps<typeof TableBody>) {
  return <TableBody {...props} />
}

const num = 'px-1 text-right font-mono text-[13px] last:pr-5'

function Numbers({ group }: { group: GroupStats }) {
  return (
    <>
      <TableCell className={num}>{formatCount(group.count)}</TableCell>
      <TableCell className={cn(num, group.errorRate >= 0.01 && 'font-medium text-error')}>{formatPct(group.errorRate)}</TableCell>
      <TableCell className={num}>{formatMs(group.p50)}</TableCell>
      <TableCell className={num}>{formatMs(group.p75)}</TableCell>
      <TableCell className={num}>{formatMs(group.p90)}</TableCell>
      <TableCell className={num}>{formatMs(group.p95)}</TableCell>
      <TableCell className={cn(num, 'font-medium')}>{formatMs(group.p99)}</TableCell>
      <TableCell className={num}>{formatMs(group.max)}</TableCell>
    </>
  )
}

/** Pinned aggregate row. */
export function StatsTableSummaryRow({ group }: { group: GroupStats }) {
  return (
    <TableRow className="border-divider font-medium">
      <TableCell className="pl-5 text-sm font-semibold">{group.path}</TableCell>
      <Numbers group={group} />
    </TableRow>
  )
}

export function StatsTableRow({ group, onOpen, className, ...props }: { group: GroupStats; onOpen: (groupKey: string) => void } & Omit<React.ComponentProps<typeof TableRow>, 'onClick'>) {
  const low = group.count < MIN_RELIABLE_SAMPLES
  return (
    <TableRow data-low-confidence={low || undefined} className={cn('border-divider data-low-confidence:text-low data-low-confidence:italic', className)} {...props}>
      <TableCell className="py-2.5 pl-5 align-top whitespace-normal">
        <button
          type="button"
          onClick={() => onOpen(group.groupKey)}
          className="flex w-full items-start gap-2 rounded text-left text-inherit outline-none hover:text-link-hover focus-visible:ring-2 focus-visible:ring-ring"
        >
          {group.method && <MethodBadge method={group.method} className="w-10" />}
          <span className="url-wrap min-w-0 font-mono text-xs leading-[1.4]">{group.path}</span>
        </button>
      </TableCell>
      <Numbers group={group} />
    </TableRow>
  )
}

export function StatsTableNote({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('m-0 px-5 py-2.5 text-xs text-muted-text', className)} {...props} />
}
