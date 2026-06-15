import { useEffect, useRef, useState } from 'react'
import { Check, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { useBoardsStore } from '../../store/useBoardsStore'
import { useCardsStore } from '../../store/useCardsStore'

// Rename / delete the active custom board. Rename happens inline; delete asks
// for confirmation. System boards (Поток) don't render this.
export default function BoardActions({ board }) {
  const renameBoard = useBoardsStore((s) => s.renameBoard)
  const deleteBoard = useBoardsStore((s) => s.deleteBoard)
  const deleteBoardCards = useCardsStore((s) => s.deleteBoardCards)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [name, setName] = useState(board.name)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const startRename = () => {
    setName(board.name)
    setEditing(true)
    setMenuOpen(false)
  }

  const commit = () => {
    const value = name.trim()
    if (value && value !== board.name) renameBoard(board.id, value)
    setEditing(false)
  }

  const remove = () => {
    deleteBoardCards(board.id)
    deleteBoard(board.id)
    setMenuOpen(false)
    setConfirming(false)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setConfirming(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="w-44 rounded-lg border border-accent/50 bg-white px-2.5 py-2 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={commit}
          aria-label="Сохранить"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white transition hover:bg-accent-hover"
        >
          <Check className="h-4 w-4" strokeWidth={2.6} />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Отмена"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:bg-sunken/60"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Действия с доской"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-glass-strong text-ink-muted shadow-(--shadow-card) transition hover:border-line-strong hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeMenu}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-(--shadow-float)"
          >
            {confirming ? (
              <div className="px-3 py-2.5">
                <p className="m-0 text-sm font-medium text-ink">Удалить доску?</p>
                <p className="m-0 mt-0.5 text-xs text-ink-muted">
                  Доска и все её карточки будут удалены.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={remove}
                    className="flex-1 rounded-lg bg-danger py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-lg border border-line py-2 text-xs font-medium text-ink-muted transition hover:bg-sunken/60"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={startRename}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink transition hover:bg-sunken/70"
                >
                  <Pencil className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                  Переименовать
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setConfirming(true)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-danger transition hover:bg-danger/10"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                  Удалить доску
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
