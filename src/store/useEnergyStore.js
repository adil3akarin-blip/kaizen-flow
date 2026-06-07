import { create } from 'zustand'
import { derivePresetFromAxes, getPresetAxisDefaults } from '../lib/energyUtils'
import { pruneHeavyCompletions } from '../lib/willpowerGuard'

function withBriskPauseDismissed(preset, patch = {}) {
  return preset === 'brisk' ? { ...patch, pauseDismissed: true } : patch
}

const STANDALONE_RESULT_KEY = 'kaizenflow-standalone-result-effort'

function loadStandaloneResult() {
  try {
    const raw = localStorage.getItem(STANDALONE_RESULT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useEnergyStore = create((set) => ({
  preset: 'medium',
  axes: getPresetAxisDefaults('medium'),
  fineTuneOpen: false,
  heavyCompletions: [],
  pauseDismissed: false,
  standaloneResultEffort: loadStandaloneResult(),

  setPreset: (preset) =>
    set(
      withBriskPauseDismissed(preset, {
        preset,
        axes: getPresetAxisDefaults(preset),
        fineTuneOpen: false,
      }),
    ),

  setAxis: (axisId, value) =>
    set((state) => {
      const axes = { ...state.axes, [axisId]: value }
      const preset = derivePresetFromAxes(axes)
      return withBriskPauseDismissed(preset, { axes, preset })
    }),

  setFineTuneOpen: (open) => set({ fineTuneOpen: open }),

  recordHeavyCompletion: (cardId) => {
    const entry = { cardId, timestamp: Date.now() }
    set((state) => ({
      heavyCompletions: pruneHeavyCompletions([
        ...state.heavyCompletions,
        entry,
      ]),
      pauseDismissed: false,
    }))
  },

  dismissPause: () => set({ pauseDismissed: true }),

  resetPauseDismissed: () => set({ pauseDismissed: false }),

  setStandaloneResultEffort: (result) => {
    if (result) {
      localStorage.setItem(STANDALONE_RESULT_KEY, JSON.stringify(result))
    } else {
      localStorage.removeItem(STANDALONE_RESULT_KEY)
    }
    set({ standaloneResultEffort: result })
  },
}))
