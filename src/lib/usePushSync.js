import { useEffect } from 'react'
import { useCardsStore } from '../store/useCardsStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { selectStuckCards } from './stuckDetector'
import { recordLastActive } from './pushActivity'
import { registerPushAfterPermission, syncPushRegistration } from './pushClient'
import { LOCAL_PUSH_INTERVAL_MS, runLocalPushChecks } from './pushLocal'
import { safeSetItem } from './persistStorage'
import { canUseRemotePush } from './pushUtils'
import { useAppStore, TABS } from '../store/useAppStore'

function applyDeepLinkFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  const open = params.get('open')
  const elephants = params.get('elephants')

  if (tab && TABS[tab]) {
    useAppStore.getState().setTab(tab)
  }
  if (open === 'dump') {
    useAppStore.getState().openDump()
  }
  if (elephants === '1') {
    useAppStore.getState().setTab(TABS.kanban)
    useAppStore.getState().setElephantsPending(true)
    safeSetItem('kaizenflow-open-elephants', '1')
  }

  if (params.has('tab') || params.has('open') || params.has('elephants')) {
    const clean = window.location.pathname + window.location.hash
    window.history.replaceState({}, '', clean)
  }
}

async function syncRemotePush(stuckCount) {
  const prefs = useSettingsStore.getState().notificationPrefs
  const anyEnabled = Object.values(prefs).some(Boolean)

  if (!anyEnabled || Notification.permission !== 'granted') return
  if (!canUseRemotePush()) return

  await syncPushRegistration({ prefs, stuckCount })
}

async function resubscribeIfNeeded() {
  const prefs = useSettingsStore.getState().notificationPrefs
  const anyEnabled = Object.values(prefs).some(Boolean)
  if (!anyEnabled || Notification.permission !== 'granted') return
  if (!canUseRemotePush()) return

  const cards = useCardsStore.getState().cards
  const stuckCount = selectStuckCards(cards).length
  await registerPushAfterPermission({ prefs, stuckCount })
}

function runChecks(includeInactive) {
  const cards = useCardsStore.getState().cards
  const stuckCount = selectStuckCards(cards).length
  runLocalPushChecks(stuckCount, { includeInactive })
  syncRemotePush(stuckCount)
}

export default function usePushSync() {
  useEffect(() => {
    applyDeepLinkFromUrl()

    const cards = useCardsStore.getState().cards
    const stuckCount = selectStuckCards(cards).length

    runLocalPushChecks(stuckCount, { includeInactive: true })
    recordLastActive()
    syncRemotePush(stuckCount)

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      runChecks(true)
      recordLastActive()
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      runChecks(false)
    }, LOCAL_PUSH_INTERVAL_MS)

    const onMessage = (event) => {
      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        resubscribeIfNeeded()
      }
    }

    document.addEventListener('visibilitychange', onVisible)
    navigator.serviceWorker?.addEventListener('message', onMessage)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      navigator.serviceWorker?.removeEventListener('message', onMessage)
      window.clearInterval(intervalId)
    }
  }, [])
}

export function isNotificationPrefEnabled(id) {
  return useSettingsStore.getState().notificationPrefs[id] === true
}
