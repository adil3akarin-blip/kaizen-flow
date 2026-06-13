import { useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { BarChart3, Kanban, Inbox, Plus, Settings, Target, Workflow } from 'lucide-react'
import { TABS, useAppStore } from '../../store/useAppStore'
import { useCardsStore } from '../../store/useCardsStore'
import { useSettingsStore } from '../../store/useSettingsStore'

const NAV_ITEMS = [
  { id: TABS.today, label: 'Сегодня', icon: Target },
  { id: TABS.kanban, label: 'Канбан', icon: Kanban },
  { id: TABS.review, label: 'Разбор', icon: Inbox },
  { id: TABS.progress, label: 'Прогресс', icon: BarChart3 },
]

export default function Sidebar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const elephantsPending = useAppStore((s) => s.elephantsPending)
  const elephantsPrefEnabled = useSettingsStore((s) => s.notificationPrefs.elephants)
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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-glass backdrop-blur-xl md:flex">
      <header className="border-b border-line px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="hm-grad flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-(--shadow-glow)">
            <Workflow className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="m-0 text-sm font-extrabold tracking-tight text-ink">
              KaizenFlow
            </h1>
            <p className="mt-0.5 text-[11px] text-ink-faint">Power & Focus</p>
          </div>
          <span className="ml-auto rounded-full border border-accent/20 bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent">
            v1
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-1 px-3 py-4">
        <button
          type="button"
          onClick={openDump}
          className="hm-grad mb-1.5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          Выгрузить
        </button>
        <p className="mb-4 px-2 text-[11px] text-ink-faint">Ctrl+Enter</p>

        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[1.4px] text-ink-faint">
          Навигация
        </p>

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
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                  isActive
                    ? 'border-accent/20 bg-accent-soft font-semibold text-ink'
                    : clsx(
                        'border-transparent hover:border-line hover:bg-glass-strong hover:text-ink',
                        isSilenced ? 'text-ink-faint/60' : 'text-ink-muted',
                      ),
                )}
              >
                {isActive && (
                  <span className="absolute -left-px top-1/4 bottom-1/4 w-[3px] rounded-r bg-accent shadow-[0_0_10px_var(--color-accent)]" />
                )}
                <Icon
                  className={clsx(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-accent' : 'text-ink-faint',
                  )}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                {item.label}
                {item.id === TABS.review && rawCount > 0 && (
                  <span
                    className={clsx(
                      'ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                      isActive
                        ? 'bg-accent/15 text-accent'
                        : 'bg-sunken text-ink/70',
                    )}
                  >
                    {rawCount}
                  </span>
                )}
                {item.id === TABS.kanban && elephantsPending && elephantsPrefEnabled && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                )}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => setTab(TABS.settings)}
          aria-current={activeTab === TABS.settings ? 'page' : undefined}
          className={clsx(
            'relative mt-auto flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
            activeTab === TABS.settings
              ? 'border-accent/20 bg-accent-soft font-semibold text-ink'
              : 'border-transparent text-ink-muted hover:border-line hover:bg-glass-strong hover:text-ink',
          )}
        >
          <Settings
            className={clsx(
              'h-4 w-4 shrink-0',
              activeTab === TABS.settings ? 'text-accent' : 'text-ink-faint',
            )}
            strokeWidth={activeTab === TABS.settings ? 2.2 : 1.75}
          />
          Настройки
        </button>
      </div>
    </aside>
  )
}
