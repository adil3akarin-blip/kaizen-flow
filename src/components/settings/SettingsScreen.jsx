import NotificationSettings from './NotificationSettings'

export default function SettingsScreen({ onBack }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-cream-dark/60 bg-white/40 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-warm-muted hover:text-warm-text"
        >
          ← Назад
        </button>
        <h2 className="m-0 mt-2 font-serif text-xl font-medium text-warm-text">
          Настройки
        </h2>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
        <NotificationSettings />
      </div>
    </div>
  )
}
