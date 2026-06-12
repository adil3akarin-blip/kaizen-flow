import clsx from 'clsx'
import { LayoutGrid, List } from 'lucide-react'
import { REVIEW_VIEWS } from '../../lib/reviewUtils'

export default function ReviewViewToggle({ value, onChange }) {
  return (
    <div
      className="flex shrink-0 rounded-xl bg-sunken p-1"
      role="group"
      aria-label="Вид разбора"
    >
      <button
        type="button"
        aria-label="Холст"
        aria-pressed={value === REVIEW_VIEWS.canvas}
        onClick={() => onChange(REVIEW_VIEWS.canvas)}
        className={clsx(
          'rounded-lg p-2 transition-colors',
          value === REVIEW_VIEWS.canvas
            ? 'bg-surface text-ink shadow-sm'
            : 'text-ink-muted hover:text-ink',
        )}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Список"
        aria-pressed={value === REVIEW_VIEWS.inbox}
        onClick={() => onChange(REVIEW_VIEWS.inbox)}
        className={clsx(
          'rounded-lg p-2 transition-colors',
          value === REVIEW_VIEWS.inbox
            ? 'bg-surface text-ink shadow-sm'
            : 'text-ink-muted hover:text-ink',
        )}
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  )
}
