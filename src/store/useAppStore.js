import { create } from 'zustand'
import { safeGetItem, safeRemoveItem, safeSetItem } from '../lib/persistStorage'
import {
 loadReviewView,
 REVIEW_VIEWS,
 saveReviewView,
} from '../lib/reviewUtils'

export const TABS = {
 today: 'today',
 review: 'review',
 kanban: 'kanban',
 progress: 'progress',
 settings: 'settings',
}

export const useAppStore = create((set) => ({
 activeTab: TABS.today,
 dumpOpen: false,
 onboardingComplete: safeGetItem('kaizenflow-onboarding') === '1',
 silenceWeek: safeGetItem('kaizenflow-silence-week') === '1',
 missionScreenOpen: false,
 reviewView: loadReviewView(),
 elephantsPending:
 safeGetItem('kaizenflow-elephants-pending') === '1' ||
 (safeGetItem('kaizenflow-onboarding') === '1' &&
 safeGetItem('kaizenflow-elephants-pending') !== '0'),

 setTab: (tab) => set({ activeTab: tab }),
 openSettings: () => set({ activeTab: TABS.settings }),
 openDump: () => set({ dumpOpen: true }),
 closeDump: () => set({ dumpOpen: false }),
 completeOnboarding: () => {
 safeSetItem('kaizenflow-onboarding', '1')
 safeSetItem('kaizenflow-silence-week', '1')
 saveReviewView(REVIEW_VIEWS.canvas)
 set({
 onboardingComplete: true,
 activeTab: TABS.review,
 silenceWeek: true,
 reviewView: REVIEW_VIEWS.canvas,
 })
 },
 setReviewView: (view) => {
 saveReviewView(view)
 set({ reviewView: view })
 },
 openMissionScreen: () => set({ missionScreenOpen: true }),
 exitSilenceWeek: () => {
 safeRemoveItem('kaizenflow-silence-week')
 saveReviewView(REVIEW_VIEWS.inbox)
 set({
 silenceWeek: false,
 missionScreenOpen: false,
 reviewView: REVIEW_VIEWS.inbox,
 })
 },
 setSilenceWeek: (v) => {
 if (v) {
 safeSetItem('kaizenflow-silence-week', '1')
 } else {
 safeRemoveItem('kaizenflow-silence-week')
 }
 set({ silenceWeek: v })
 },
 setElephantsPending: (v) => {
 if (v) {
 safeSetItem('kaizenflow-elephants-pending', '1')
 } else {
 safeRemoveItem('kaizenflow-elephants-pending')
 }
 set({ elephantsPending: v })
 },
}))
