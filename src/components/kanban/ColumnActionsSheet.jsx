import { useState } from 'react'
import clsx from 'clsx'
import { Check, Columns3, Trash2 } from 'lucide-react'
import Sheet from '../ui/Sheet'

// Column management lives in a sheet (not an inline dropdown) so it never gets
// clipped by the board's horizontal scroll container — matching how the flow
// board edits cards. Parent passes key={column.id} for a fresh mount.
export default function ColumnActionsSheet({
  column,
  canDelete,
  open,
  onClose,
  onRename,
  onToggleDone,
  onDelete,
}) {
  const [label, setLabel] = useState(column?.label ?? '')
  const [confirming, setConfirming] = useState(false)

  if (!column) return null

  const isDone = column.role === 'done'

  const commitRename = () => {
    const value = label.trim()
    if (value && value !== column.label) onRename(value)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Колонка" icon={Columns3}>
      <div className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Название
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === 'Enter' && commitRename()}
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button
          type="button"
          onClick={onToggleDone}
          className={clsx(
            'flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition',
            isDone ? 'border-success/40 bg-success-soft' : 'border-line hover:bg-sunken/60',
          )}
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">Колонка «Сделано»</span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              Карточки тут засчитываются в поток и достижения
            </span>
          </span>
          <span
            className={clsx(
              'ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition',
              isDone ? 'bg-success text-white' : 'border border-line-strong text-transparent',
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </button>

        {confirming ? (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-3.5">
            <p className="m-0 text-sm font-medium text-ink">Удалить колонку?</p>
            <p className="m-0 mt-0.5 text-xs text-ink-muted">
              Карточки переедут в первую колонку доски.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onDelete()
                  onClose()
                }}
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
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => setConfirming(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Удалить колонку
          </button>
        )}
      </div>
    </Sheet>
  )
}
