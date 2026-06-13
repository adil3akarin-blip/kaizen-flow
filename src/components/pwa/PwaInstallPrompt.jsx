import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import { isInstallPromptDismissed, isMobileBrowser } from '../../lib/pwaInstall'
import { usePwaInstallStore } from '../../store/usePwaInstallStore'

export default function PwaInstallPrompt() {
  const dismissed = usePwaInstallStore((s) => s.dismissed)
  const installed = usePwaInstallStore((s) => s.installed)
  const openSheet = usePwaInstallStore((s) => s.openSheet)
  const dismissAutoPrompt = usePwaInstallStore((s) => s.dismissAutoPrompt)

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (installed || dismissed || isInstallPromptDismissed() || !isMobileBrowser()) {
      return
    }
    const timer = window.setTimeout(() => setVisible(true), 1200)
    return () => window.clearTimeout(timer)
  }, [installed, dismissed])

  const handleDownload = () => {
    setVisible(false)
    openSheet()
  }

  const handleDismiss = () => {
    setVisible(false)
    dismissAutoPrompt()
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-prompt-title"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:px-6 sm:pb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-sm rounded-2xl border border-line/60 bg-surface p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="hm-grad flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-(--shadow-glow)">
                <Smartphone className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p id="pwa-install-prompt-title" className="m-0 text-base font-semibold text-ink">
                  Установить на телефон?
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  Быстрый запуск с главного экрана, офлайн и без адресной строки.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-xl bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-hover"
              >
                Скачать
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-xl py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sunken hover:text-ink"
              >
                Не сейчас
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
