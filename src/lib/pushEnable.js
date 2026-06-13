import { registerPushAfterPermission, ensureServiceWorkerReady } from './pushClient'
import { runLocalPushChecks } from './pushLocal'
import { canUseRemotePush } from './pushUtils'
import { useSettingsStore } from '../store/useSettingsStore'

export async function enableNotificationsAfterPermission({
  stuckCount = 0,
  includeInactive = false,
} = {}) {
  await ensureServiceWorkerReady()

  if (canUseRemotePush() && Notification.permission === 'granted') {
    const prefs = useSettingsStore.getState().notificationPrefs
    await registerPushAfterPermission({ prefs, stuckCount })
  }

  await runLocalPushChecks(stuckCount, { includeInactive })
}
