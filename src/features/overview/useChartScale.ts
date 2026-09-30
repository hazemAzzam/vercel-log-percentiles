import { useMemo } from 'react'
import type { GroupStats } from '@/domain/types'

export const MIN_RELIABLE_SAMPLES = 20
const STEPS = [50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000]

/** Reliable endpoints sorted by p99 (desc), capped for readability. */
export function useSpreadGroups(groups: readonly GroupStats[], limit = 20) {
  return useMemo(
    () => groups.filter((g) => g.count >= MIN_RELIABLE_SAMPLES).sort((a, b) => b.p99 - a.p99).slice(0, limit),
    [groups, limit],
  )
}

/** Linear ms -> % scale with "nice" gridline ticks. */
export function useChartScale(groups: readonly GroupStats[]) {
  return useMemo(() => {
    const top = Math.max(1, ...groups.map((g) => g.p99).filter(Number.isFinite))
    const axisMax = top * 1.1
    const step = STEPS.find((s) => axisMax / s <= 4) ?? STEPS[STEPS.length - 1]
    const ticks: { ms: number; pct: number; label: string }[] = []
    for (let ms = 0; ms <= axisMax; ms += step) {
      ticks.push({ ms, pct: (ms / axisMax) * 100, label: ms === 0 ? '0' : ms >= 1000 ? `${ms / 1000}s` : `${ms}ms` })
    }
    const pos = (ms: number) => Math.min(100, Math.max(0, (ms / axisMax) * 100))
    return { axisMax, ticks, pos }
  }, [groups])
}

export type ChartScale = ReturnType<typeof useChartScale>
