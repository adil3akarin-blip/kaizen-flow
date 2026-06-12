import clsx from 'clsx'
import { Inbox, Kanban, Plus, Settings, Workflow } from 'lucide-react'
import { TABS, useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { id: TABS.flow, label: 'Поток', icon: Workflow },
  { id: TABS.review, label: 'Разбор', icon: Inbox },
  { id: TABS.kanban, label: 'Канбан', icon: Kanban },
  { id: TABS.settings, label: 'Ещё', icon: Settings },
]

export default function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const elephantsPending = useAppStore((s) => s.elephantsPending)

  return (
    <>
      <button
        type="button"
        onClick={openDump}
        aria-label="Выгрузить мысль"
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+12px)] left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-(--shadow-float) transition-transform active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-line bg-surface/90 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isSilenced =
            silenceWeek &&
            item.id !== TABS.review &&
            item.id !== TABS.settings

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-label={item.id === TABS.settings ? 'Настройки' : item.label}
              className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-[11px] transition-colors"
            >
              {isActive && (
                <span className="absolute top-1.5 h-1 w-8 rounded-full bg-accent-soft" />
              )}
              <Icon
                className={clsx(
                  'relative h-5 w-5 shrink-0',
                  isActive
                    ? 'text-accent'
                    : isSilenced
                      ? 'text-ink-faint'
                      : 'text-ink-faint',
                )}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <span
                className={clsx(
                  'relative truncate',
                  isActive
                    ? 'font-medium text-accent'
                    : isSilenced
                      ? 'text-ink-faint/60'
                      : 'text-ink-faint',
                )}
              >
                {item.label}
              </span>
              {item.id === TABS.kanban && elephantsPending && !isActive && (
                <span className="absolute right-[18%] top-2 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
