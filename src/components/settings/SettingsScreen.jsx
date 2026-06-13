import FilterSettings from './FilterSettings'
import InstallAppSettings from './InstallAppSettings'
import NotificationSettings from './NotificationSettings'
import PomodoroSettings from './PomodoroSettings'
import SettingsGroup from './SettingsGroup'
import TabPageHeader from '../ui/TabPageHeader'

export default function SettingsScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
        <TabPageHeader eyebrow="Конфигурация" title="Настройки" subtitle="Миссия, фильтры, таймер и уведомления" hideSettings />
        <div className="mt-8 flex flex-col gap-10">
          <SettingsGroup title="Приложение">
            <InstallAppSettings />
          </SettingsGroup>

          <SettingsGroup title="Осознанность" description="Миссия и критерии для фильтрации задач">
            <FilterSettings />
          </SettingsGroup>

          <SettingsGroup title="Фокус">
            <PomodoroSettings />
          </SettingsGroup>

          <SettingsGroup title="Уведомления">
            <NotificationSettings />
          </SettingsGroup>
        </div>
      </div>
    </div>
  )
}
