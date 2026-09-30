import { useMemo } from 'react'
import { Panel, PanelBody, PanelHeader, PanelNote, PanelTitle } from '@/components/panel'
import { StatCard, StatCardLabel, StatCardValue, StatGrid } from '@/components/stat-card'
import { summarizeGroups } from '@/application/filterAndGroup'
import type { ParseStats, Sample } from '@/domain/types'
import { formatCount, formatTimeRange } from '@/lib/format'
import { PageTitle } from '@/features/layout'
import { FiltersBar, FiltersNamespace, FiltersSearch, FiltersSource, FiltersWindow } from './FiltersBar'
import {
  LatencySpreadChart, SpreadAxis, SpreadLabel, SpreadLegend, SpreadRow, SpreadRowBody, SpreadTrack, SpreadValues,
} from './LatencySpreadChart'
import {
  StatsTable, StatsTableBody, StatsTableColumn, StatsTableHeader, StatsTableHeaderRow, StatsTableNote, StatsTableRow,
  StatsTableSummaryRow,
} from './StatsTable'
import { useChartScale, useSpreadGroups } from './useChartScale'
import type { FiltersState } from './useFilters'
import { useSortedGroups, type SortKey } from './useSortedGroups'

const COLUMNS: [SortKey, string, string][] = [
  ['count', 'n', 'w-[68px]'],
  ['errorRate', 'Errors', 'w-[60px]'],
  ['p50', 'p50', 'w-[54px]'],
  ['p75', 'p75', 'w-[54px]'],
  ['p90', 'p90', 'w-[54px]'],
  ['p95', 'p95', 'w-[54px]'],
  ['p99', 'p99', 'w-[62px]'],
  ['max', 'max', 'w-[70px]'],
]

export function OverviewView({
  stats, filteredSamples, filters, onOpenEndpoint, onOpenDiagnostics,
}: { stats: ParseStats; filteredSamples: readonly Sample[]; filters: FiltersState; onOpenEndpoint: (k: string) => void; onOpenDiagnostics: () => void }) {
  const { overall, groups } = useMemo(
    () => summarizeGroups(filteredSamples, filters.filters.source),
    [filteredSamples, filters.filters.source],
  )
  const sort = useSortedGroups(groups)
  const spread = useSpreadGroups(groups)
  const scale = useChartScale(spread)

  return (
    <>
      <div className="flex items-baseline justify-between whitespace-nowrap">
        <PageTitle>Overview</PageTitle>
        <span className="text-[13px] text-muted-text">All times in ms</span>
      </div>
      <StatGrid className="grid-cols-2 lg:grid-cols-4">
        <StatCard><StatCardLabel>Records read</StatCardLabel><StatCardValue>{formatCount(stats.recordsRead)}</StatCardValue></StatCard>
        <StatCard><StatCardLabel>Timing samples</StatCardLabel><StatCardValue>{formatCount(overall.count)}</StatCardValue></StatCard>
        <StatCard>
          <StatCardLabel>Skipped lines</StatCardLabel>
          <span className="flex items-baseline gap-2">
            <StatCardValue>{formatCount(stats.linesSkipped)}</StatCardValue>
            <button type="button" onClick={onOpenDiagnostics} className="text-[13px] text-link hover:text-link-hover hover:underline">Why?</button>
          </span>
        </StatCard>
        <StatCard><StatCardLabel>Time range (UTC)</StatCardLabel><StatCardValue className="pt-1 text-[15px]">{formatTimeRange(stats.timeRange)}</StatCardValue></StatCard>
      </StatGrid>

      <Panel aria-labelledby="t1" className="overflow-hidden">
        <PanelHeader>
          <PanelTitle id="t1" className="grow">Percentiles by endpoint</PanelTitle>
          <FiltersBar>
            <FiltersSearch value={filters.search} onChange={filters.setSearch} />
            <FiltersSource value={filters.source} onChange={filters.setSource} />
            <FiltersNamespace value={filters.namespace} namespaces={stats.namespaces} onChange={filters.setNamespace} />
            <FiltersWindow value={filters.timeWindow} onChange={filters.setTimeWindow} />
          </FiltersBar>
        </PanelHeader>
        <StatsTable sort={sort}>
          <StatsTableHeader>
            <StatsTableHeaderRow>
              <StatsTableColumn sortKey="endpoint" className="pl-5 text-left">Endpoint</StatsTableColumn>
              {COLUMNS.map(([key, label, width]) => (
                <StatsTableColumn key={key} sortKey={key} className={width}>{label}</StatsTableColumn>
              ))}
            </StatsTableHeaderRow>
          </StatsTableHeader>
          <StatsTableBody>
            <StatsTableSummaryRow group={overall} />
            {sort.sorted.map((g) => (
              <StatsTableRow key={g.groupKey} group={g} onOpen={onOpenEndpoint} />
            ))}
          </StatsTableBody>
        </StatsTable>
        {groups.length === 0 && <StatsTableNote>No endpoints match these filters.</StatsTableNote>}
        <StatsTableNote>Rows with fewer than 20 samples are greyed: their high percentiles are unreliable.</StatsTableNote>
      </Panel>

      <Panel aria-labelledby="t2">
        <PanelBody className="flex flex-col gap-3 pb-[18px]">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
            <div className="flex grow flex-col gap-0.5">
              <PanelTitle id="t2">Latency spread by endpoint</PanelTitle>
              <PanelNote>Each line runs from p50 to p99, so a longer line means a slower tail. Sorted by p99.</PanelNote>
            </div>
            <SpreadLegend />
          </div>
          <LatencySpreadChart scale={scale}>
            <SpreadAxis />
            {spread.map((g) => (
              <SpreadRow key={g.groupKey} group={g}>
                <SpreadLabel />
                <SpreadRowBody>
                  <SpreadTrack />
                  <SpreadValues />
                </SpreadRowBody>
              </SpreadRow>
            ))}
          </LatencySpreadChart>
        </PanelBody>
      </Panel>
    </>
  )
}
