import { useState } from 'react'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { NOTIFICATION_TYPES } from '../../lib/notificationTypes'
import SettingsSection from './SettingsSection'

function ToggleSwitch({ enabled }) {
 return (
 <span
 aria-hidden="true"
 className={clsx(
 'relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors',
 enabled ? 'bg-accent' : 'bg-sunken',
 )}
 >
 <span
 className={clsx(
 'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
 enabled ? 'translate-x-5' : 'translate-x-0',
 )}
 />
 </span>
 )
}

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
 className="fixed inset-0 z-[110] flex items-end justify-center bg-ink/20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:px-6 sm:pb-6"
 >
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 24 }}
 className="w-full max-w-sm rounded-2xl border border-line/60 bg-white p-6 shadow-xl"
 >
 <p className="m-0 text-base font-medium text-ink">
 Мягкие приглашения
 </p>
 <p className="mt-2 text-sm leading-relaxed text-ink-muted">
 Мы не напоминаем о задачах — только приглашаем выгрузить мысли
 или пересмотреть затор.
 </p>
 <div className="mt-5 flex flex-col gap-2">
 <button
 type="button"
 onClick={onConfirm}
 className="rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Разрешить уведомления
 </button>
 <button
 type="button"
 onClick={onCancel}
 className="py-2.5 text-sm text-ink-muted hover:text-ink"
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

 const enabledCount = Object.values(notificationPrefs).filter(Boolean).length

 return (
 <SettingsSection
 icon={Bell}
 title="Что можем напомнить"
 description="Мягкие приглашения открыть нужный экран. Без списков задач и дедлайнов."
 >
 {enabledCount > 0 && (
 <p className="rounded-lg bg-sunken/60 px-3 py-2 text-xs leading-relaxed text-ink-muted">
 Включено: {enabledCount} из {NOTIFICATION_TYPES.length}
 </p>
 )}

 {permission === 'denied' && (
 <p className="mt-3 rounded-lg border border-line/60 bg-sunken/60 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
 Push заблокирован в браузере. Подсказки внутри приложения всё равно
 работают.
 </p>
 )}

 <ul className="mt-3 flex list-none flex-col gap-2 p-0">
 {NOTIFICATION_TYPES.map((type) => {
 const enabled = notificationPrefs[type.id]

 return (
 <li key={type.id}>
 <button
 type="button"
 role="switch"
 aria-checked={enabled}
 onClick={() => applyToggle(type.id, !enabled)}
 className="flex w-full items-start justify-between gap-4 rounded-xl border border-line/50 bg-surface px-4 py-3.5 text-left transition-colors hover:border-line-strong active:bg-sunken/40"
 >
 <span className="min-w-0 flex-1">
 <span className="block text-sm font-medium text-ink">
 {type.label}
 </span>
 <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
 {type.when}
 </span>
 <span className="mt-2 block text-xs text-ink-faint">
 Пример: {type.example}
 </span>
 </span>
 <ToggleSwitch enabled={enabled} />
 </button>
 </li>
 )
 })}
 </ul>

 <div className="mt-4 space-y-1 text-xs leading-relaxed text-ink-faint">
 <p className="m-0">Подсказки внутри приложения работают всегда.</p>
 <p className="m-0">Push-уведомления появятся в следующей версии.</p>
 </div>

 <PushPrePrompt
 open={prePromptOpen}
 onConfirm={handlePrePromptConfirm}
 onCancel={handlePrePromptCancel}
 />
 </SettingsSection>
 )
}
