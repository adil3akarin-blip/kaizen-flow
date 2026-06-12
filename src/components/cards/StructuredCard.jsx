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

const TONE_CLASS = {
 indigo: 'border-indigo/20 bg-indigo/10 text-indigo',
 orange: 'border-accent/20 bg-accent-soft text-accent',
 teal: 'border-teal/20 bg-teal/10 text-teal',
 neutral: 'border-line bg-glass text-ink-muted',
}

export default function StructuredCard({ card, className, compact = false }) {
 const chips = []

 if (card.wantMust) {
 chips.push({ key: 'want', label: WANT_LABELS[card.wantMust], tone: 'indigo' })
 }
 if (card.energyCost && card.energyCost !== 'medium') {
 chips.push({ key: 'energy', label: ENERGY_LABELS[card.energyCost], tone: 'orange' })
 }
 if (card.timeInvestment) {
 chips.push({ key: 'invest', label: card.timeInvestment, tone: 'teal' })
 }

 return (
 <div
 className={clsx(
 'rounded-xl border border-line bg-glass-strong shadow-sm',
 compact ? 'px-3 py-2.5' : 'px-4 py-3',
 className,
 )}
 >
 <p
 className={clsx(
 'm-0 break-words leading-snug text-ink',
 compact ? 'text-sm line-clamp-2' : 'text-[15px]',
 )}
 >
 {card.text}
 </p>

 {chips.length > 0 && (
 <div className="mt-2 flex flex-wrap gap-1.5">
 {chips.map((chip) => (
 <span
 key={chip.key}
 className={clsx(
 'rounded-full border px-2 py-0.5 text-xs font-semibold',
 TONE_CLASS[chip.tone] ?? TONE_CLASS.neutral,
 )}
 >
 {chip.label}
 </span>
 ))}
 </div>
 )}
 </div>
 )
}
