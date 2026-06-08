import clsx from 'clsx'
import { LayoutGrid, List } from 'lucide-react'
import { REVIEW_VIEWS } from '../../lib/reviewUtils'

export default function ReviewViewToggle({ value, onChange }) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-cream-dark bg-cream/50 p-0.5"
      role="group"
      aria-label="Вид разбора"
    >
      <button
        type="button"
        aria-label="Холст"
        aria-pressed={value === REVIEW_VIEWS.canvas}
        onClick={() => onChange(REVIEW_VIEWS.canvas)}
        className={clsx(
          'rounded-md p-2 transition-colors',
          value === REVIEW_VIEWS.canvas
            ? 'bg-white text-warm-text shadow-sm'
            : 'text-warm-muted hover:text-warm-text',
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
          'rounded-md p-2 transition-colors',
          value === REVIEW_VIEWS.inbox
            ? 'bg-white text-warm-text shadow-sm'
            : 'text-warm-muted hover:text-warm-text',
        )}
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  )
}
