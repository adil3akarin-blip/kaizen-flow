import { Smartphone } from 'lucide-react'
import { usePwaInstallStore } from '../../store/usePwaInstallStore'
import SettingsSection from './SettingsSection'

export default function InstallAppSettings() {
  const openSheet = usePwaInstallStore((s) => s.openSheet)
  const installed = usePwaInstallStore((s) => s.installed)
  const canNativeInstall = usePwaInstallStore((s) => s.canNativeInstall)
  const handleNativeInstall = usePwaInstallStore((s) => s.handleNativeInstall)

  return (
    <SettingsSection
      icon={Smartphone}
      title="Установка на телефон"
      description="Запуск с главного экрана, офлайн-доступ и полноэкранный режим."
    >
      {installed ? (
        <p className="m-0 rounded-xl border border-line/50 bg-surface px-4 py-3 text-sm text-ink-muted">
          Приложение уже установлено — вы открыли его с главного экрана.
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {canNativeInstall && (
            <button
              type="button"
              onClick={handleNativeInstall}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Установить
            </button>
          )}
          <button
            type="button"
            onClick={openSheet}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-sunken"
          >
            Как установить
          </button>
        </div>
      )}
    </SettingsSection>
  )
}
