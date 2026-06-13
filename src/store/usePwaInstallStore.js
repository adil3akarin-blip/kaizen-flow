import { create } from 'zustand'
import {
  detectMobilePlatform,
  dismissInstallPrompt,
  isInstallPromptDismissed,
  isStandalone,
  platformLabel,
} from '../lib/pwaInstall'

let deferredPrompt = null
let listenersReady = false

function attachListeners(set) {
  if (listenersReady) return
  listenersReady = true

  const onBeforeInstall = (e) => {
    e.preventDefault()
    deferredPrompt = e
    set({ canNativeInstall: true })
  }
  const onDisplayMode = () => set({ installed: isStandalone() })

  window.addEventListener('beforeinstallprompt', onBeforeInstall)
  window.matchMedia('(display-mode: standalone)').addEventListener('change', onDisplayMode)
}

export const usePwaInstallStore = create((set) => {
  attachListeners(set)

  return {
    sheetOpen: false,
    dismissed: isInstallPromptDismissed(),
    installed: isStandalone(),
    canNativeInstall: false,
    platform: detectMobilePlatform(),
    platformLabel: platformLabel(detectMobilePlatform()),

    openSheet: () => set({ sheetOpen: true }),
    closeSheet: () => set({ sheetOpen: false }),

    dismissAutoPrompt: () => {
      dismissInstallPrompt()
      set({ dismissed: true })
    },

    handleNativeInstall: async () => {
      if (!deferredPrompt) return false
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      set({ canNativeInstall: false })
      if (outcome === 'accepted') set({ installed: true })
      return outcome === 'accepted'
    },
  }
})
