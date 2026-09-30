import { useCallback, useEffect, useState } from 'react'

export type View =
  | { name: 'overview' }
  | { name: 'diagnostics' }
  | { name: 'endpoint'; groupKey: string }

/** Tiny state-based navigation; no router needed for three views. */
export function useNavigation() {
  const [view, setView] = useState<View>({ name: 'overview' })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  const goOverview = useCallback(() => setView({ name: 'overview' }), [])
  const goDiagnostics = useCallback(() => setView({ name: 'diagnostics' }), [])
  const openEndpoint = useCallback((groupKey: string) => setView({ name: 'endpoint', groupKey }), [])

  /** Which sidebar item is highlighted (endpoint pages belong to Overview). */
  const section: 'overview' | 'diagnostics' = view.name === 'diagnostics' ? 'diagnostics' : 'overview'

  return { view, section, goOverview, goDiagnostics, openEndpoint }
}
