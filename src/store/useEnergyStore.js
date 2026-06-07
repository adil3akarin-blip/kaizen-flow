import { create } from 'zustand'
import { getPresetAxisDefaults } from '../lib/energyUtils'
import { pruneHeavyCompletions } from '../lib/willpowerGuard'

export const useEnergyStore = create((set) => ({
  preset: 'medium',
  axes: getPresetAxisDefaults('medium'),
  fineTuneOpen: false,
  heavyCompletions: [],
  pauseDismissed: false,

  setPreset: (preset) =>
    set({
      preset,
      axes: getPresetAxisDefaults(preset),
      fineTuneOpen: false,
    }),

  setAxis: (axisId, value) =>
    set((state) => ({
      axes: { ...state.axes, [axisId]: value },
    })),

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
