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
 <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-canvas md:flex">
 <header className="border-b border-line px-5 py-6">
 <h1 className="m-0 text-xl font-medium tracking-tight text-ink">
 KaizenFlow
 </h1>
 <p className="mt-1 text-xs text-ink-muted">Power & Focus</p>
 </header>

 <div className="flex flex-1 flex-col gap-1 px-3 py-4">
 <button
 type="button"
 onClick={openDump}
 className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/20 transition-colors hover:bg-accent-hover"
 >
 <Plus className="h-4 w-4" strokeWidth={2} />
 Выгрузить
 </button>
 <p className="mb-3 px-2 text-[11px] text-ink-muted">Ctrl+Enter</p>

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
 'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
 isActive
 ? 'bg-accent-soft font-medium text-accent'
 : clsx(
 'hover:bg-sunken hover:text-ink',
 isSilenced ? 'text-ink-faint/60' : 'text-ink-muted',
 ),
 )}
 >
 <Icon
 className={clsx(
 'h-4 w-4 shrink-0',
 isActive ? 'text-accent' : 'text-ink-faint',
 )}
 strokeWidth={isActive ? 2 : 1.75}
 />
 {item.label}
 {item.id === TABS.review && rawCount > 0 && (
 <span
 className={clsx(
 'ml-auto rounded-full px-2 py-0.5 text-[11px] tabular-nums',
 isActive
 ? 'bg-accent/15 text-accent'
 : 'bg-sunken text-ink/70',
 )}
 >
 {rawCount}
 </span>
 )}
 {item.id === TABS.kanban && elephantsPending && (
 <span className="ml-auto h-2 w-2 rounded-full bg-accent" />
 )}
 </button>
 )
 })}
 </nav>

 <button
 type="button"
 onClick={() => setTab(TABS.settings)}
 className={clsx(
 'mt-auto flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
 activeTab === TABS.settings
 ? 'bg-accent-soft font-medium text-accent'
 : 'text-ink-muted hover:bg-sunken hover:text-ink',
 )}
 >
 <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
 Настройки
 </button>
 </div>
 </aside>
 )
}
