import clsx from 'clsx'
import { BarChart3, Inbox, Kanban, Plus, Target } from 'lucide-react'
import { TABS, useAppStore } from '../../store/useAppStore'
import { useSettingsStore } from '../../store/useSettingsStore'

const NAV_ITEMS = [
  { id: TABS.today, label: 'Сегодня', icon: Target },
  { id: TABS.kanban, label: 'Канбан', icon: Kanban },
  { id: TABS.review, label: 'Разбор', icon: Inbox },
  { id: TABS.progress, label: 'Прогресс', icon: BarChart3 },
]

export default function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const elephantsPending = useAppStore((s) => s.elephantsPending)
  const elephantsPrefEnabled = useSettingsStore((s) => s.notificationPrefs.elephants)

  return (
    <>
      <button
        type="button"
        onClick={openDump}
        aria-label="Выгрузить мысль"
        className="hm-grad fixed right-4 bottom-(--spacing-mobile-fab-bottom) z-30 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-0 text-white shadow-(--shadow-glow) transition-transform [appearance:none] active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" strokeWidth={2} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-line bg-glass-strong backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isSilenced = silenceWeek && item.id !== TABS.review

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-[11px] transition-colors"
            >
              {isActive && (
                <span className="absolute top-1.5 h-1 w-8 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
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
              {item.id === TABS.kanban && elephantsPending && elephantsPrefEnabled && !isActive && (
                <span className="absolute right-[18%] top-2 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
