import { safeGetItem, safeSetItem } from './persistStorage'

const DISMISSED_KEY = 'kaizenflow-pwa-install-dismissed'

export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  )
}

export function detectMobilePlatform() {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export function isMobileBrowser() {
  if (isStandalone()) return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod|Android/.test(ua)) return true
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

export function isInstallPromptDismissed() {
  return safeGetItem(DISMISSED_KEY) === '1'
}

export function dismissInstallPrompt() {
  safeSetItem(DISMISSED_KEY, '1')
}

export function platformLabel(platform) {
  if (platform === 'ios') return 'iPhone / iPad'
  if (platform === 'android') return 'Android'
  return 'телефон'
}

export const INSTALL_STEPS = {
  ios: [
    'Откройте KaizenFlow в Safari (не во встроенном браузере других приложений).',
    'Нажмите «Поделиться» — квадрат со стрелкой вверх внизу экрана.',
    'Выберите «На экран „Домой“».',
    'Нажмите «Добавить» — приложение появится на главном экране.',
  ],
  android: [
    'Откройте KaizenFlow в Chrome.',
    'Нажмите меню (три точки) в правом верхнем углу.',
    'Выберите «Установить приложение» или «Добавить на главный экран».',
    'Подтвердите установку — иконка появится на главном экране.',
  ],
  other: [
    'На телефоне откройте сайт в Chrome (Android) или Safari (iPhone).',
    'В меню браузера найдите пункт «Установить приложение» или «На экран „Домой“».',
    'Подтвердите — KaizenFlow запустится как отдельное приложение без адресной строки.',
  ],
}
