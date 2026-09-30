import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Logo, LogoMark, LogoText, SplitScreen, SplitScreenAside, SplitScreenLead, SplitScreenMain, SplitScreenTitle,
} from '@/features/layout'
import { DropZone, DropZoneButton, DropZoneHint, DropZoneIcon, DropZoneTitle } from './DropZone'

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-[7px] size-2 shrink-0 rounded-full bg-lime" />
      <div className="flex flex-col gap-[3px] text-sm">
        <span className="font-semibold">{title}</span>
        <span className="text-sidebar-muted">{children}</span>
      </div>
    </li>
  )
}

const code = 'font-mono text-[13px] text-sidebar-text'

export function UploadScreen({ error, onFile, onSample }: { error?: string; onFile: (f: File) => void; onSample: () => void }) {
  return (
    <SplitScreen>
      <SplitScreenAside>
        <Logo>
          <LogoMark />
          <LogoText />
        </Logo>
        <div className="flex flex-col gap-4">
          <SplitScreenTitle>Latency percentiles from your Vercel logs</SplitScreenTitle>
          <SplitScreenLead>p50 to p99 for every endpoint, computed in your browser. Nothing is uploaded.</SplitScreenLead>
        </div>
        <div className="grow" />
        <ul className="m-0 flex list-none flex-col gap-[18px] p-0">
          <Point title="App log lines">
            Reads <span className={code}>duration_ms</span>, grouped by method and URL
          </Point>
          <Point title="Vercel requests">Falls back to request duration, grouped by path</Point>
          <Point title="Same math as Excel">Linear interpolation, like PERCENTILE.INC</Point>
        </ul>
      </SplitScreenAside>
      <SplitScreenMain className="flex-col gap-4">
        {error && (
          <Alert variant="destructive" className="w-full max-w-[600px]">
            <TriangleAlert />
            <AlertTitle>Could not read that file</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DropZone onFile={onFile}>
          <DropZoneIcon />
          <DropZoneTitle>Drop your log export here</DropZoneTitle>
          <DropZoneHint>JSON, NDJSON or CSV · up to about 100 MB</DropZoneHint>
          <DropZoneButton>Choose file</DropZoneButton>
        </DropZone>
        <Button variant="link" onClick={onSample} className="text-link">
          Try with sample data
        </Button>
      </SplitScreenMain>
    </SplitScreen>
  )
}
