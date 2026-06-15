import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Check, ChevronDown, Plus, Search, Zap } from 'lucide-react'
import { useBoardsStore } from '../../store/useBoardsStore'

// Searchable board switcher. Scales past a handful of boards: a dropdown with
// a filter field (shown once the list gets long) instead of an ever-growing
// row of pills.
const SEARCH_THRESHOLD = 6

export default function BoardMenu() {
  const boards = useBoardsStore((s) => s.boards)
  const activeBoardId = useBoardsStore((s) => s.activeBoardId)
  const setActiveBoard = useBoardsStore((s) => s.setActiveBoard)
  const addBoard = useBoardsStore((s) => s.addBoard)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const active = boards.find((b) => b.id === activeBoardId) ?? boards[0]
  const showSearch = boards.length > SEARCH_THRESHOLD

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return boards
    return boards.filter((b) => b.name.toLowerCase().includes(q))
  }, [boards, query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    if (showSearch) searchRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, showSearch])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex max-w-[14rem] items-center gap-2 rounded-xl border border-line bg-glass-strong px-3.5 py-2.5 text-sm font-semibold text-ink shadow-(--shadow-card) transition hover:border-line-strong"
      >
        {active?.system && <Zap className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />}
        <span className="truncate">{active?.name}</span>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-ink-faint transition-transform', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            role="menu"
            className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-(--shadow-float)"
          >
            {showSearch && (
              <div className="border-b border-line p-2">
                <div className="flex items-center gap-2 rounded-lg bg-sunken/60 px-2.5">
                  <Search className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={2} />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск доски…"
                    className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
                  />
                </div>
              </div>
            )}

            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="m-0 px-3 py-6 text-center text-sm text-ink-faint">
                  Доска не найдена
                </p>
              ) : (
                filtered.map((board) => {
                  const isActive = board.id === activeBoardId
                  return (
                    <button
                      key={board.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setActiveBoard(board.id)
                        close()
                      }}
                      className={clsx(
                        'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition',
                        isActive
                          ? 'bg-accent-soft text-ink'
                          : 'text-ink-muted hover:bg-sunken/60 hover:text-ink',
                      )}
                    >
                      {board.system ? (
                        <Zap className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
                      ) : (
                        <span className="h-4 w-4 shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{board.name}</span>
                      {isActive && (
                        <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.6} />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <div className="border-t border-line p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  addBoard()
                  close()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-accent transition hover:bg-accent-soft"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Новая доска
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
