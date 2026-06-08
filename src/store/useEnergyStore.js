import { create } from 'zustand'
import { derivePresetFromAxes, getPresetAxisDefaults } from '../lib/energyUtils'
import {
  createDebouncedPersist,
  loadEnergyPersisted,
  saveEnergyPersisted,
} from '../lib/persistStorage'
import { pruneHeavyCompletions } from '../lib/willpowerGuard'

const VALID_PRESETS = new Set(['brisk', 'medium', 'depleted'])

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

function loadInitialEnergyState() {
  const persisted = loadEnergyPersisted()
  const preset = VALID_PRESETS.has(persisted?.preset)
    ? persisted.preset
    : 'medium'

  return {
    preset,
    axes:
      persisted?.axes && typeof persisted.axes === 'object'
        ? { ...getPresetAxisDefaults(preset), ...persisted.axes }
        : getPresetAxisDefaults(preset),
    heavyCompletions: Array.isArray(persisted?.heavyCompletions)
      ? pruneHeavyCompletions(persisted.heavyCompletions)
      : [],
    pauseDismissed: Boolean(persisted?.pauseDismissed),
  }
}

const initialEnergy = loadInitialEnergyState()

export const useEnergyStore = create((set) => ({
  preset: initialEnergy.preset,
  axes: initialEnergy.axes,
  fineTuneOpen: false,
  heavyCompletions: initialEnergy.heavyCompletions,
  pauseDismissed: initialEnergy.pauseDismissed,
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

const debouncedPersistEnergy = createDebouncedPersist((state) => {
  saveEnergyPersisted({
    preset: state.preset,
    axes: state.axes,
    heavyCompletions: state.heavyCompletions,
    pauseDismissed: state.pauseDismissed,
  })
})

useEnergyStore.subscribe((state, prev) => {
  if (
    state.preset !== prev.preset ||
    state.axes !== prev.axes ||
    state.heavyCompletions !== prev.heavyCompletions ||
    state.pauseDismissed !== prev.pauseDismissed
  ) {
    debouncedPersistEnergy(state)
  }
})
