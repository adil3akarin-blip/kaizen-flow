import { useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { Kanban, Inbox, Plus, Settings, Workflow } from 'lucide-react'
import { TABS, useAppStore } from '../../store/useAppStore'
import { useCardsStore } from '../../store/useCardsStore'

const NAV_ITEMS = [
  { id: TABS.flow, label: 'Поток', icon: Workflow },
  { id: TABS.review, label: 'Разбор', icon: Inbox },
  { id: TABS.kanban, label: 'Канбан', icon: Kanban },
]

export default function Sidebar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)
  const openSettings = useAppStore((s) => s.openSettings)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const elephantsPending = useAppStore((s) => s.elephantsPending)
  const cards = useCardsStore((s) => s.cards)
  const rawCount = useMemo(
    () => cards.filter((c) => c.status === 'raw').length,
    [cards],
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        openDump()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openDump])

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-cream-dark bg-cream md:flex">
      <header className="border-b border-cream-dark px-5 py-6">
        <h1 className="m-0 font-serif text-xl font-medium tracking-tight text-warm-text">
          KaizenFlow
        </h1>
        <p className="mt-1 text-xs text-warm-muted">Power & Focus</p>
      </header>

      <div className="flex flex-1 flex-col gap-1 px-3 py-4">
        <button
          type="button"
          onClick={openDump}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white shadow-sm shadow-warm-accent/20 transition-colors hover:bg-warm-accent-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Выгрузить
        </button>
        <p className="mb-3 px-2 text-[11px] text-warm-muted">Ctrl+Enter</p>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const isSilenced = silenceWeek && item.id !== TABS.review

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={clsx(
                  'flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'border-warm-accent bg-white font-medium text-warm-text shadow-sm'
                    : clsx(
                        'border-transparent hover:bg-white/60 hover:text-warm-text',
                        isSilenced ? 'text-warm-text/55' : 'text-warm-text/80',
                      ),
                )}
              >
                <Icon
                  className={clsx(
                    'h-4 w-4 shrink-0',
                    isActive
                      ? 'text-warm-accent'
                      : isSilenced
                        ? 'text-warm-text/50'
                        : 'text-warm-text/65',
                  )}
                  strokeWidth={1.75}
                />
                {item.label}
                {item.id === TABS.review && rawCount > 0 && (
                  <span
                    className={clsx(
                      'ml-auto rounded-full px-2 py-0.5 text-[11px] tabular-nums',
                      isActive
                        ? 'bg-warm-accent/15 text-warm-accent'
                        : 'bg-cream-dark text-warm-text/70',
                    )}
                  >
                    {rawCount}
                  </span>
                )}
                {item.id === TABS.kanban && elephantsPending && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-warm-accent" />
                )}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={openSettings}
          className={clsx(
            'mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
            settingsOpen
              ? 'bg-white font-medium text-warm-text shadow-sm'
              : 'text-warm-text/80 hover:bg-white/60 hover:text-warm-text',
          )}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Настройки
        </button>
      </div>
    </aside>
  )
}
