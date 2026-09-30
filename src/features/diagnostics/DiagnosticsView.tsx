import { Panel, PanelBody, PanelHeader, PanelTitle } from '@/components/panel'
import { StatCard, StatCardLabel, StatCardValue, StatGrid } from '@/components/stat-card'
import type { ParseStats } from '@/domain/types'
import { formatCount } from '@/lib/format'
import { PageSubtitle, PageTitle } from '@/features/layout'
import { ColumnChip, DiagnosticsRow, SkippedExample } from './DiagnosticsParts'
import { useDiagnostics } from './useDiagnostics'

export function DiagnosticsView({ stats }: { stats: ParseStats }) {
  const d = useDiagnostics(stats)
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <PageTitle>Diagnostics</PageTitle>
        <PageSubtitle>What was read and what was skipped. Check this before trusting the numbers.</PageSubtitle>
      </div>
      <StatGrid className="grid-cols-2 lg:grid-cols-4">
        <StatCard className="border-ink bg-ink text-on-ink"><StatCardLabel className="text-lime">Format</StatCardLabel><StatCardValue>{d.format}</StatCardValue></StatCard>
        <StatCard><StatCardLabel>Records read</StatCardLabel><StatCardValue>{formatCount(stats.recordsRead)}</StatCardValue></StatCard>
        <StatCard><StatCardLabel>Timing samples</StatCardLabel><StatCardValue>{formatCount(stats.samplesExtracted)}</StatCardValue></StatCard>
        <StatCard><StatCardLabel>Malformed lines</StatCardLabel><StatCardValue className={stats.malformed ? 'text-error' : undefined}>{formatCount(stats.malformed)}</StatCardValue></StatCard>
      </StatGrid>
      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-4">
        <Panel aria-labelledby="d1">
          <PanelBody className="flex flex-col py-[18px]">
            <PanelTitle id="d1" className="mb-2">Where samples came from</PanelTitle>
            <dl className="m-0">
              {d.provenance.map(([k, v]) => <DiagnosticsRow key={k} label={k} value={v} />)}
            </dl>
            <PanelTitle className="mt-5 mb-2.5">Unused columns</PanelTitle>
            {d.unusedColumns.length ? (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {d.unusedColumns.map((c) => <ColumnChip key={c}>{c}</ColumnChip>)}
              </ul>
            ) : (
              <p className="m-0 text-sm text-muted-text">None.</p>
            )}
          </PanelBody>
        </Panel>
        <Panel aria-labelledby="d3" className="min-w-0 overflow-hidden">
          <PanelHeader><PanelTitle id="d3">Examples of skipped records</PanelTitle></PanelHeader>
          {d.examples.length ? (
            <ul className="m-0 list-none p-0">
              {d.examples.map((e) => <SkippedExample key={`${e.reason}|${e.line}`} reason={e.reason} line={e.line} />)}
            </ul>
          ) : (
            <p className="m-0 px-5 py-4 text-sm text-muted-text">Nothing was skipped.</p>
          )}
        </Panel>
      </div>
    </>
  )
}
