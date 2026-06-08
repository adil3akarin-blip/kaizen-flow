import { PanelDivider, PanelList, PanelSection } from '../ui/PanelList'
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
      className="w-full text-left text-sm text-warm-muted transition-colors hover:text-warm-text"
    >
      {label} →{' '}
      <span className="text-warm-accent">Разбор</span>
    </button>
  )
}

export default function FlowStatusPanel({
  onOpenHub,
  rawCount,
  onGoReview,
  stuckCards,
  showHints,
}) {
  const hasHint = showHints && rawCount > 0
  const hasStuck = stuckCards.length > 0

  if (!hasHint && !hasStuck) {
    return (
      <PanelList>
        <PanelSection className="p-0">
          <EnergySnapshot embedded onOpenHub={onOpenHub} />
        </PanelSection>
      </PanelList>
    )
  }

  return (
    <PanelList>
      <PanelSection className="p-0">
        <EnergySnapshot embedded onOpenHub={onOpenHub} />
      </PanelSection>

      {hasHint && (
        <>
          <PanelDivider />
          <PanelSection>
            <FlowHint rawCount={rawCount} onGoReview={onGoReview} />
          </PanelSection>
        </>
      )}

      {hasStuck && (
        <>
          <PanelDivider />
          <PanelSection>
            <StuckNudge stuckCards={stuckCards} />
          </PanelSection>
        </>
      )}
    </PanelList>
  )
}
