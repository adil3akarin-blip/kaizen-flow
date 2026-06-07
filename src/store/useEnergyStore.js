import { create } from 'zustand'
import { derivePresetFromAxes, getPresetAxisDefaults } from '../lib/energyUtils'
import { pruneHeavyCompletions } from '../lib/willpowerGuard'

function withBriskPauseDismissed(preset, patch = {}) {
  return preset === 'brisk' ? { ...patch, pauseDismissed: true } : patch
}

export const useEnergyStore = create((set) => ({
  preset: 'medium',
  axes: getPresetAxisDefaults('medium'),
  fineTuneOpen: false,
  heavyCompletions: [],
  pauseDismissed: false,

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
}))
