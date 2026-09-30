import { formatBytes } from '@/lib/format'
import {
  Logo, LogoMark, LogoText, SplitScreen, SplitScreenAside, SplitScreenLead, SplitScreenMain, SplitScreenTitle,
  SidebarFileCard, SidebarFileLabel, SidebarFileName,
} from '@/features/layout'
import type { LogFileState } from './useLogFile'
import {
  ParseProgress, ParseProgressActions, ParseProgressBar, ParseProgressCancel, ParseProgressHeader,
  ParseProgressStat, ParseProgressStats,
} from './ParseProgress'

export function ParsingScreen({ state, onCancel }: { state: Extract<LogFileState, { status: 'parsing' }>; onCancel: () => void }) {
  const format = state.progress?.format
  return (
    <SplitScreen>
      <SplitScreenAside>
        <Logo>
          <LogoMark />
          <LogoText />
        </Logo>
        <div className="flex flex-col gap-4">
          <SplitScreenTitle>Reading your logs…</SplitScreenTitle>
          <SplitScreenLead>Parsing runs in a background worker, so the page stays responsive.</SplitScreenLead>
        </div>
        <div className="grow" />
        <SidebarFileCard className="gap-1.5 p-[18px]">
          <SidebarFileLabel>File</SidebarFileLabel>
          <SidebarFileName className="text-sm">{state.fileName}</SidebarFileName>
          <SidebarFileLabel className="text-[13px]">
            {format ? `${format.toUpperCase()} detected · ` : ''}
            {formatBytes(state.fileSize)}
          </SidebarFileLabel>
        </SidebarFileCard>
      </SplitScreenAside>
      <SplitScreenMain>
        <ParseProgress progress={state.progress}>
          <ParseProgressHeader />
          <ParseProgressBar />
          <ParseProgressStats>
            <ParseProgressStat label="Records read" field="recordsRead" />
            <ParseProgressStat label="Timing samples" field="samplesExtracted" />
            <ParseProgressStat label="Skipped lines" field="linesSkipped" />
          </ParseProgressStats>
          <ParseProgressActions>
            <ParseProgressCancel onClick={onCancel} />
          </ParseProgressActions>
        </ParseProgress>
      </SplitScreenMain>
    </SplitScreen>
  )
}
