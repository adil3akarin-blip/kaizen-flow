import FilterSettings from './FilterSettings'
import NotificationSettings from './NotificationSettings'
import TabPageHeader from '../ui/TabPageHeader'

export default function SettingsScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <TabPageHeader title="Настройки" subtitle="Миссия, фильтры и уведомления" />
        <div className="overflow-hidden rounded-2xl border border-line/60 bg-surface shadow-(--shadow-card) divide-y divide-line">
          <FilterSettings />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line/60 bg-surface shadow-(--shadow-card) divide-y divide-line">
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}
