import { Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function TabPageHeader({ title, subtitle, eyebrow, hideSettings = false }) {
  const openSettings = useAppStore((s) => s.openSettings)

  return (
    <header className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="hm-eyebrow mb-2.5">{eyebrow}</p>}
        <h2 className="hm-title m-0 text-[30px]">{title}</h2>
        {subtitle && (
          <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        )}
      </div>
      {!hideSettings && (
        <button
          type="button"
          onClick={openSettings}
          aria-label="Настройки"
          className="shrink-0 rounded-xl p-2 text-ink-faint transition hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
        >
          <Settings className="h-5 w-5" strokeWidth={1.75} />
        </button>
      )}
    </header>
  )
}
