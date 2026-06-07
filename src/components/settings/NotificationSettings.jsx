import { useState } from 'react'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '../../store/useSettingsStore'
import { NOTIFICATION_TYPES } from '../../lib/notificationTypes'

function PushPrePrompt({ open, onConfirm, onCancel }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-warm-text/20 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-2xl border border-cream-dark/60 bg-white p-6 shadow-xl"
          >
            <p className="m-0 font-serif text-base font-medium text-warm-text">
              Мягкие приглашения
            </p>
            <p className="mt-2 text-sm leading-relaxed text-warm-muted">
              Мы не напоминаем о задачах — только приглашаем выгрузить мысли
              или пересмотреть затор.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white hover:bg-warm-accent-hover"
              >
                Разрешить уведомления
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="py-2 text-sm text-warm-muted hover:text-warm-text"
              >
                Пока нет
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default function NotificationSettings() {
  const notificationPrefs = useSettingsStore((s) => s.notificationPrefs)
  const pushPromptShown = useSettingsStore((s) => s.pushPromptShown)
  const setNotificationEnabled = useSettingsStore((s) => s.setNotificationEnabled)
  const requestPushPermission = useSettingsStore((s) => s.requestPushPermission)
  const markPushPromptShown = useSettingsStore((s) => s.markPushPromptShown)

  const [prePromptOpen, setPrePromptOpen] = useState(false)
  const [pendingToggle, setPendingToggle] = useState(null)

  const applyToggle = async (id, enabled) => {
    const wasAllOff = !Object.values(notificationPrefs).some(Boolean)
    setNotificationEnabled(id, enabled)

    if (
      enabled &&
      wasAllOff &&
      !pushPromptShown &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      setPendingToggle(id)
      setPrePromptOpen(true)
    }
  }

  const handlePrePromptConfirm = async () => {
    setPrePromptOpen(false)
    markPushPromptShown()
    await requestPushPermission()
    setPendingToggle(null)
  }

  const handlePrePromptCancel = () => {
    if (pendingToggle) {
      setNotificationEnabled(pendingToggle, false)
    }
    setPrePromptOpen(false)
    markPushPromptShown()
    setPendingToggle(null)
  }

  const permission =
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'

  return (
    <section className="rounded-2xl border border-cream-dark/50 bg-white p-5 shadow-sm">
      <p className="m-0 font-serif text-base font-medium text-warm-text">
        Уведомления
      </p>
      <p className="mt-1 text-xs text-warm-muted">
        Приглашения открыть нужный экран — не напоминания о задачах
      </p>

      {permission === 'denied' && (
        <p className="mt-3 rounded-lg bg-cream/80 px-3 py-2 text-xs text-warm-muted">
          Push заблокирован в браузере. In-app подсказки на «Потоке» работают
          без push.
        </p>
      )}

      <ul className="mt-4 flex list-none flex-col gap-3 p-0">
        {NOTIFICATION_TYPES.map((type) => {
          const enabled = notificationPrefs[type.id]

          return (
            <li
              key={type.id}
              className="rounded-xl border border-cream-dark/40 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-sm font-medium text-warm-text">
                  {type.label}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => applyToggle(type.id, !enabled)}
                  className={clsx(
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                    enabled ? 'bg-warm-accent' : 'bg-cream-dark',
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      enabled ? 'translate-x-5' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-warm-muted">{type.preview}</p>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-warm-muted">
        Доставка push — в следующей версии. Сейчас настройки сохраняются,
        подсказки в приложении работают всегда.
      </p>

      <PushPrePrompt
        open={prePromptOpen}
        onConfirm={handlePrePromptConfirm}
        onCancel={handlePrePromptCancel}
      />
    </section>
  )
}
