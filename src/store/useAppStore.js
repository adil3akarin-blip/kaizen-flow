import { create } from 'zustand'

export const TABS = {
  flow: 'flow',
  review: 'review',
  kanban: 'kanban',
  settings: 'settings',
}

export const useAppStore = create((set) => ({
  activeTab: TABS.flow,
  dumpOpen: false,
  onboardingComplete: localStorage.getItem('kaizenflow-onboarding') === '1',
  silenceWeek: localStorage.getItem('kaizenflow-silence-week') === '1',
  missionScreenOpen: false,
  elephantsPending:
    localStorage.getItem('kaizenflow-elephants-pending') === '1' ||
    (localStorage.getItem('kaizenflow-onboarding') === '1' &&
      localStorage.getItem('kaizenflow-elephants-pending') !== '0'),

  setTab: (tab) => set({ activeTab: tab }),
  openSettings: () => set({ activeTab: TABS.settings }),
  openDump: () => set({ dumpOpen: true }),
  closeDump: () => set({ dumpOpen: false }),
  completeOnboarding: () => {
    localStorage.setItem('kaizenflow-onboarding', '1')
    localStorage.setItem('kaizenflow-silence-week', '1')
    set({
      onboardingComplete: true,
      activeTab: TABS.review,
      silenceWeek: true,
    })
  },
  openMissionScreen: () => set({ missionScreenOpen: true }),
  exitSilenceWeek: () => {
    localStorage.removeItem('kaizenflow-silence-week')
    set({ silenceWeek: false, missionScreenOpen: false })
  },
  setSilenceWeek: (v) => {
    if (v) {
      localStorage.setItem('kaizenflow-silence-week', '1')
    } else {
      localStorage.removeItem('kaizenflow-silence-week')
    }
    set({ silenceWeek: v })
  },
  setElephantsPending: (v) => {
    if (v) {
      localStorage.setItem('kaizenflow-elephants-pending', '1')
    } else {
      localStorage.removeItem('kaizenflow-elephants-pending')
    }
    set({ elephantsPending: v })
  },
}))
