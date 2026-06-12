import FilterSettings from './FilterSettings'
import NotificationSettings from './NotificationSettings'
import { TABS, useAppStore } from '../../store/useAppStore'

export default function SettingsScreen() {
 const setTab = useAppStore((s) => s.setTab)

 return (
 <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
 <header className="shrink-0 border-b border-line/60 bg-white/40 px-4 py-4 sm:px-6 md:px-8">
 <button
 type="button"
 onClick={() => setTab(TABS.flow)}
 className="hidden min-h-10 text-sm text-ink-muted hover:text-ink md:inline"
 >
 ← Назад
 </button>
 <h2 className="m-0 text-xl font-medium text-ink md:mt-1">
 Настройки
 </h2>
 <p className="m-0 mt-1.5 text-sm text-ink-muted">
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
