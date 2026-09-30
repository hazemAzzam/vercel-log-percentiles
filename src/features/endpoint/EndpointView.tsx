import { MethodBadge } from '@/components/method-badge'
import { Panel, PanelBody, PanelHeader, PanelNote, PanelTitle } from '@/components/panel'
import { StatCard, StatCardLabel, StatCardUnit, StatCardValue, StatGrid } from '@/components/stat-card'
import { formatCount, formatMs, formatPct } from '@/lib/format'
import type { Sample } from '@/domain/types'
import { EndpointBackLink, EndpointHeader, EndpointMeta, EndpointPath, EndpointTitle } from './EndpointHeader'
import { Histogram, HistogramBars, HistogramLabels } from './Histogram'
import { PercentileLadder, PercentileLadderStep } from './PercentileLadder'
import { SlowestRequestRow, SlowestRequests } from './SlowestRequests'
import { StatusBreakdown, StatusBreakdownRow } from './StatusBreakdown'
import { useEndpointDetail } from './useEndpointDetail'

function Ms({ value }: { value: number }) {
  return (
    <StatCardValue className="text-[22px]">
      {formatMs(value)}
      <StatCardUnit> ms</StatCardUnit>
    </StatCardValue>
  )
}

export function EndpointView({ samples, groupKey, onBack }: { samples: readonly Sample[]; groupKey: string; onBack: () => void }) {
  const d = useEndpointDetail(samples, groupKey)
  const { stats } = d
  if (!d.found) {
    return (
      <EndpointHeader>
        <EndpointBackLink onClick={onBack} />
        <p className="text-sm">No samples for this endpoint.</p>
      </EndpointHeader>
    )
  }
  return (
    <>
      <EndpointHeader>
        <EndpointBackLink onClick={onBack} />
        <EndpointTitle>
          {stats.method && <MethodBadge method={stats.method} className="mt-px px-2 py-[3px] text-[13px]" />}
          <EndpointPath>{stats.path}</EndpointPath>
        </EndpointTitle>
        <EndpointMeta>
          {stats.source === 'vercel' ? 'Vercel requests' : 'App logs'} · namespace {d.namespace}
        </EndpointMeta>
      </EndpointHeader>

      <StatGrid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard className="p-4"><StatCardLabel>Samples</StatCardLabel><StatCardValue className="text-[22px]">{formatCount(stats.count)}</StatCardValue></StatCard>
        <StatCard className="p-4"><StatCardLabel>p50</StatCardLabel><Ms value={stats.p50} /></StatCard>
        <StatCard className="p-4"><StatCardLabel>p95</StatCardLabel><Ms value={stats.p95} /></StatCard>
        <StatCard className="border-ink bg-ink p-4 text-on-ink">
          <StatCardLabel className="text-lime">p99</StatCardLabel>
          <StatCardValue className="text-[22px]">{formatMs(stats.p99)}<StatCardUnit className="text-sidebar-muted"> ms</StatCardUnit></StatCardValue>
        </StatCard>
        <StatCard className="p-4"><StatCardLabel>Error rate</StatCardLabel><StatCardValue className="text-[22px]">{formatPct(stats.errorRate)}</StatCardValue></StatCard>
      </StatGrid>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4">
        <Panel aria-labelledby="h1">
          <PanelBody className="flex flex-col gap-3.5 py-[18px]">
            <div className="flex items-center">
              <PanelTitle id="h1" className="grow">Latency distribution</PanelTitle>
              <PanelNote>Highlighted: p50, p95, p99 buckets</PanelNote>
            </div>
            <Histogram bins={d.bins} peak={d.peak} markers={d.markers}>
              <HistogramBars />
              <HistogramLabels />
            </Histogram>
            <PanelNote className="whitespace-nowrap">Bucket lower edges in ms, log-spaced</PanelNote>
          </PanelBody>
        </Panel>
        <Panel aria-labelledby="h2">
          <PanelBody className="flex flex-col py-[18px]">
            <PanelTitle id="h2" className="mb-2">Percentile ladder</PanelTitle>
            <PercentileLadder>
              {d.ladder.map(([k, v]) => <PercentileLadderStep key={k} label={k} value={formatMs(v)} />)}
            </PercentileLadder>
            <PanelNote className="mt-2.5 whitespace-nowrap">Linear interpolation (PERCENTILE.INC)</PanelNote>
          </PanelBody>
        </Panel>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-4">
        <Panel aria-labelledby="h3">
          <PanelBody className="flex flex-col gap-3.5 py-[18px]">
            <PanelTitle id="h3">Status codes</PanelTitle>
            <StatusBreakdown>
              {d.statuses.map((s) => <StatusBreakdownRow key={s.code} {...s} />)}
            </StatusBreakdown>
          </PanelBody>
        </Panel>
        <Panel aria-labelledby="h4" className="overflow-hidden">
          <PanelHeader><PanelTitle id="h4">Slowest requests</PanelTitle></PanelHeader>
          <SlowestRequests>
            {d.slowest.map((s) => <SlowestRequestRow key={`${s.ts}|${s.rawUrl}|${s.durationMs}`} sample={s} />)}
          </SlowestRequests>
        </Panel>
      </div>
    </>
  )
}
