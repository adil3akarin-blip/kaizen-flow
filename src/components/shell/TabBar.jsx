import clsx from 'clsx'
import { Kanban, Inbox, Plus, Workflow } from 'lucide-react'
import { TABS, useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { id: TABS.flow, label: 'Поток', icon: Workflow },
  { id: TABS.review, label: 'Разбор', icon: Inbox },
  { id: TABS.kanban, label: 'Канбан', icon: Kanban },
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
        aria-label="Выгрузить"
        className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-warm-accent text-white shadow-lg shadow-warm-accent/30 ring-4 ring-cream transition-colors hover:bg-warm-accent-hover md:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-cream-dark bg-cream/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
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
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                isActive
                  ? 'font-medium text-warm-text'
                  : isSilenced
                    ? 'text-warm-text/55'
                    : 'text-warm-text/80',
              )}
            >
              <Icon
                className={clsx(
                  'h-5 w-5',
                  isActive
                    ? 'text-warm-accent'
                    : isSilenced
                      ? 'text-warm-text/50'
                      : 'text-warm-text/65',
                )}
                strokeWidth={1.75}
              />
              {item.label}
              {item.id === TABS.kanban && elephantsPending && !isActive && (
                <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-warm-accent" />
              )}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-warm-accent" />
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
