import FilterSettings from './FilterSettings'
import NotificationSettings from './NotificationSettings'
import { TABS, useAppStore } from '../../store/useAppStore'

export default function SettingsScreen() {
  const setTab = useAppStore((s) => s.setTab)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-cream">
      <header className="shrink-0 border-b border-cream-dark/60 bg-white/40 px-4 py-4 sm:px-6 md:px-8">
        <button
          type="button"
          onClick={() => setTab(TABS.flow)}
          className="hidden min-h-10 text-sm text-warm-muted hover:text-warm-text md:inline"
        >
          ← Назад
        </button>
        <h2 className="m-0 font-serif text-xl font-medium text-warm-text md:mt-1">
          Настройки
        </h2>
        <p className="m-0 mt-1.5 text-sm text-warm-muted">
          Миссия, фильтры и уведомления
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <FilterSettings />
        <NotificationSettings />
      </div>
    </div>
  )
}
