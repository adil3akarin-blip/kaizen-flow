import EnergySnapshot from './EnergySnapshot'
import StuckNudge from './StuckNudge'

function FlowHint({ rawCount, onGoReview }) {
  if (rawCount === 0) return null

  const label =
    rawCount === 1
      ? '1 мысль ждёт разбора'
      : rawCount < 5
        ? `${rawCount} мысли ждут разбора`
        : `${rawCount} мыслей ждут разбора`

  return (
    <button
      type="button"
      onClick={onGoReview}
      className="w-full text-left text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {label} →{' '}
      <span className="text-accent">Разбор</span>
    </button>
  )
}

export default function FlowStatusPanel({ onOpenHub, rawCount, onGoReview, stuckCards, showHints }) {
  const hasHint = showHints && rawCount > 0
  const hasStuck = stuckCards.length > 0

  return (
    <div className="flex flex-col gap-3">
      <EnergySnapshot onOpenHub={onOpenHub} />

      {hasStuck && (
        <div className="flex items-center gap-2 rounded-xl bg-warn-soft px-4 py-3">
          <StuckNudge stuckCards={stuckCards} />
        </div>
      )}

      {hasHint && (
        <div className="hm-glass rounded-xl px-4 py-3">
          <FlowHint rawCount={rawCount} onGoReview={onGoReview} />
        </div>
      )}
    </div>
  )
}
