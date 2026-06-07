import clsx from 'clsx'

const WANT_LABELS = {
  want: 'Хочу',
  must: 'Должен',
  unknown: 'Не знаю',
}

const ENERGY_LABELS = {
  light: 'Лёгкое',
  medium: 'Среднее',
  heavy: 'Тяжёлое',
}

export default function StructuredCard({ card, className, compact = false }) {
  const chips = []

  if (card.wantMust) {
    chips.push({ key: 'want', label: WANT_LABELS[card.wantMust] })
  }
  if (card.energyCost && card.energyCost !== 'medium') {
    chips.push({ key: 'energy', label: ENERGY_LABELS[card.energyCost] })
  }
  if (card.timeInvestment) {
    chips.push({ key: 'invest', label: card.timeInvestment })
  }

  return (
    <div
      className={clsx(
        'rounded-xl border border-cream-dark/50 bg-white shadow-sm',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        className,
      )}
    >
      <p
        className={clsx(
          'm-0 leading-snug text-warm-text',
          compact ? 'text-sm' : 'text-[15px]',
        )}
      >
        {card.text}
      </p>

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="rounded-full bg-cream px-2 py-0.5 text-xs text-warm-muted"
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
