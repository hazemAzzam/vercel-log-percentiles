import { AppShell, AppShellMain, Logo, LogoMark, LogoText, Sidebar, SidebarAction, SidebarFileCard, SidebarFileLabel, SidebarFileName, SidebarFileTag, SidebarNav, SidebarNavItem, SidebarSpacer, useNavigation } from '@/features/layout'
import { OverviewView, useFilters } from '@/features/overview'
import { EndpointView } from '@/features/endpoint'
import { DiagnosticsView } from '@/features/diagnostics'
import { useMemo } from 'react'
import { applyFilters } from '@/application/filterAndGroup'
import type { ParseResult } from '@/domain/types'

export function ResultsApp({ data, fileName, isSample, onNewFile }: { data: ParseResult; fileName: string; isSample: boolean; onNewFile: () => void }) {
  const nav = useNavigation()
  // Lives here (not in OverviewView) so filters survive visiting an endpoint and coming back.
  const filters = useFilters(data.stats.timeRange[1])
  // One filtered sample set feeds both the overview and the endpoint page, so n and percentiles always agree.
  const filtered = useMemo(() => applyFilters(data.samples, filters.filters), [data.samples, filters.filters])
  const current = (s: 'overview' | 'diagnostics') => (nav.section === s ? 'page' : undefined)
  return (
    <AppShell>
      <Sidebar>
        <Logo className="gap-2.5 px-2">
          <LogoMark className="size-[30px] rounded-lg" />
          <LogoText className="text-base" />
        </Logo>
        <SidebarNav>
          <SidebarNavItem aria-current={current('overview')} onClick={nav.goOverview}>Overview</SidebarNavItem>
          <SidebarNavItem aria-current={current('diagnostics')} onClick={nav.goDiagnostics}>Diagnostics</SidebarNavItem>
        </SidebarNav>
        <SidebarSpacer />
        <SidebarFileCard>
          <SidebarFileLabel>Current file</SidebarFileLabel>
          <SidebarFileName title={fileName}>{fileName}</SidebarFileName>
          {isSample && <SidebarFileTag>Sample data</SidebarFileTag>}
        </SidebarFileCard>
        <SidebarAction onClick={onNewFile}>New file</SidebarAction>
      </Sidebar>
      <AppShellMain>
        {nav.view.name === 'overview' && (
          <OverviewView stats={data.stats} filteredSamples={filtered} filters={filters} onOpenEndpoint={nav.openEndpoint} onOpenDiagnostics={nav.goDiagnostics} />
        )}
        {nav.view.name === 'endpoint' && <EndpointView samples={filtered} groupKey={nav.view.groupKey} onBack={nav.goOverview} />}
        {nav.view.name === 'diagnostics' && <DiagnosticsView stats={data.stats} />}
      </AppShellMain>
    </AppShell>
  )
}
