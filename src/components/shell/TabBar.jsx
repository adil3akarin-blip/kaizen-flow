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
 aria-label="Выгрузить"
 className="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 ring-4 ring-canvas transition-colors hover:bg-accent-hover md:hidden"
 >
 <Plus className="h-6 w-6" strokeWidth={2} />
 </button>

 <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-canvas/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
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
 className={clsx(
 'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors',
 isActive
 ? 'font-medium text-ink'
 : isSilenced
 ? 'text-ink/55'
 : 'text-ink/80',
 )}
 >
 <Icon
 className={clsx(
 'h-5 w-5 shrink-0',
 isActive
 ? 'text-accent'
 : isSilenced
 ? 'text-ink/50'
 : 'text-ink/65',
 )}
 strokeWidth={1.75}
 />
 <span className="truncate">{item.label}</span>
 {item.id === TABS.kanban && elephantsPending && !isActive && (
 <span className="absolute right-[18%] top-1 h-2 w-2 rounded-full bg-accent" />
 )}
 {isActive && (
 <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
 )}
 </button>
 )
 })}
 </nav>
 </>
 )
}
