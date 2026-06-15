import clsx from 'clsx'
import { getSphere } from '../../lib/labelSets'

const WANT_LABELS = {
 want: 'Хочу',
 must: 'Должен',
 unknown: 'Не знаю',
}

const TONE_CLASS = {
 accent: 'border-accent/20 bg-accent-soft text-accent',
 teal: 'border-teal/20 bg-teal/10 text-teal',
 neutral: 'border-line bg-glass text-ink-muted',
}

export default function StructuredCard({ card, className, compact = false }) {
 const sphere = getSphere(card.sphere)
 const chips = []

 if (card.wantMust) {
 chips.push({
 key: 'want',
 label: WANT_LABELS[card.wantMust],
 tone: card.wantMust === 'want' ? 'accent' : 'neutral',
 })
 }
 if (card.timeInvestment) {
 chips.push({ key: 'invest', label: card.timeInvestment, tone: 'teal' })
 }

 const hasLabels = sphere || chips.length > 0

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

 {hasLabels && (
 <div className="mt-2 flex flex-wrap gap-1.5">
 {sphere && (
 <span
 className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold"
 style={{
 borderColor: `${sphere.dot}33`,
 background: sphere.soft,
 color: sphere.text,
 }}
 >
 <span
 className="h-1.5 w-1.5 rounded-full"
 style={{ background: sphere.dot }}
 />
 {sphere.label}
 </span>
 )}
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
