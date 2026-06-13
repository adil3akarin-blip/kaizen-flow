import { detectMobilePlatform, isStandalone } from './pwaInstall'

export function canUseLocalNotifications() {
  return (
    typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
  )
}

export function isPushApiAvailable() {
  return canUseLocalNotifications() && 'PushManager' in window
}

export function isIosPwa() {
  return detectMobilePlatform() === 'ios' && isStandalone()
}

export function canShowNotificationsNow() {
  if (!canUseLocalNotifications()) return false
  if (Notification.permission !== 'granted') return false
  if (detectMobilePlatform() === 'ios' && !isStandalone()) return false
  return true
}

export function isPushConfigured() {
  return Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY)
}

export function getPushApiUrl() {
  const url = import.meta.env.VITE_PUSH_API_URL
  return url ? url.replace(/\/$/, '') : ''
}

export function canUseRemotePush() {
  return isPushApiAvailable() && isPushConfigured() && Boolean(getPushApiUrl())
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function getAppBasePath() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function buildDeepLink(query) {
  const base = getAppBasePath()
  const params = new URLSearchParams(query)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
