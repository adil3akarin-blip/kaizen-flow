import FilterSettings from './FilterSettings'
import NotificationSettings from './NotificationSettings'
import TabPageHeader from '../ui/TabPageHeader'

export default function SettingsScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <TabPageHeader eyebrow="Конфигурация" title="Настройки" subtitle="Миссия, фильтры и уведомления" hideSettings />
        <div className="hm-glass divide-y divide-line overflow-hidden rounded-2xl">
          <FilterSettings />
        </div>
        <div className="hm-glass divide-y divide-line overflow-hidden rounded-2xl">
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}
