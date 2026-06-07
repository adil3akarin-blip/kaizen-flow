import { create } from 'zustand'

const MISSION_KEY = 'kaizenflow-mission'

function loadMission() {
  try {
    return localStorage.getItem(MISSION_KEY) || ''
  } catch {
    return ''
  }
}

export const useSettingsStore = create((set) => ({
  personalMission: loadMission(),

  setPersonalMission: (mission) => {
    localStorage.setItem(MISSION_KEY, mission)
    set({ personalMission: mission })
  },
}))
