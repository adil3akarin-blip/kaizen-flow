import { create } from 'zustand'
import {
  createDebouncedPersist,
  loadJsonPersisted,
  saveJsonPersisted,
} from '../lib/persistStorage'

const ACHIEVEMENTS_KEY = 'kaizenflow-achievements'

function loadInitial() {
  const persisted = loadJsonPersisted(ACHIEVEMENTS_KEY)
  const elephants =
    persisted?.elephants && typeof persisted.elephants === 'object'
      ? persisted.elephants
      : {}
  return { elephants }
}

const initial = loadInitial()

export const useAchievementsStore = create((set) => ({
  // { [monthKey: 'YYYY-M']: string } — the "elephant" (main win) of each month.
  elephants: initial.elephants,

  setElephant: (monthKey, text) => {
    const trimmed = (text ?? '').trim()
    set((state) => {
      const elephants = { ...state.elephants }
      if (trimmed) elephants[monthKey] = trimmed
      else delete elephants[monthKey]
      return { elephants }
    })
  },
}))

const debouncedPersist = createDebouncedPersist((elephants) => {
  saveJsonPersisted(ACHIEVEMENTS_KEY, { elephants })
})

useAchievementsStore.subscribe((state, prev) => {
  if (state.elephants !== prev.elephants) {
    debouncedPersist(state.elephants)
  }
})
