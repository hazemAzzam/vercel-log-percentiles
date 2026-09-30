import { ParsingScreen, useLogFile } from '@/features/parsing'
import { UploadScreen } from '@/features/upload'
import { ResultsApp } from './ResultsApp'

export default function App() {
  const log = useLogFile()
  const { state } = log
  if (state.status === 'parsing') return <ParsingScreen state={state} onCancel={log.cancel} />
  if (state.status === 'done') {
    return <ResultsApp data={state.result} fileName={state.fileName} isSample={state.isSample} onNewFile={log.cancel} />
  }
  return (
    <UploadScreen
      error={state.status === 'error' ? state.message : undefined}
      onFile={log.openFile}
      onSample={log.loadSample}
    />
  )
}
