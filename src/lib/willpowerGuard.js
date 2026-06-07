export const HEAVY_COMPLETION_THRESHOLD = 3
export const HEAVY_COMPLETION_WINDOW_MS = 2 * 60 * 60 * 1000

export function shouldShowDepletedHeavyDialog(energyPreset, card) {
  return energyPreset === 'depleted' && card.energyCost === 'heavy'
}

export function countRecentHeavyCompletions(completions, now = Date.now()) {
  return completions.filter(
    (entry) => now - entry.timestamp < HEAVY_COMPLETION_WINDOW_MS,
  ).length
}

export function pruneHeavyCompletions(completions, now = Date.now()) {
  return completions.filter(
    (entry) => now - entry.timestamp < HEAVY_COMPLETION_WINDOW_MS,
  )
}

export function shouldShowPauseScreen(completions, pauseDismissed, now = Date.now()) {
  if (pauseDismissed) return false
  return (
    countRecentHeavyCompletions(completions, now) >= HEAVY_COMPLETION_THRESHOLD
  )
}
