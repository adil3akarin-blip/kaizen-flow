import { useMemo } from 'react'
import { Target } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { LIFE_SPHERES } from '../../lib/labelSets'

// «Баланс сфер жизни» — табло приоритетов из набора меток «Ромашка».
// Показывает, на какие сферы уходят разобранные дела и сколько уже выполнено,
// чтобы видеть перекосы и держать жизнь в равновесии.
export default function SphereBalance() {
  const cards = useCardsStore((s) => s.cards)

  const { rows, total, done, labeledTotal, unlabeled } = useMemo(() => {
    const counts = new Map(LIFE_SPHERES.map((s) => [s.id, { total: 0, done: 0 }]))
    let total = 0
    let done = 0
    let unlabeled = 0

    for (const c of cards) {
      if (c.status === 'raw') continue
      total += 1
      const isDone = c.status === 'done'
      if (isDone) done += 1

      const entry = counts.get(c.sphere)
      if (!entry) {
        unlabeled += 1
        continue
      }
      entry.total += 1
      if (isDone) entry.done += 1
    }

    const rows = LIFE_SPHERES.map((s) => ({ ...s, ...counts.get(s.id) }))
    const labeledTotal = rows.reduce((sum, r) => sum + r.total, 0)
    return { rows, total, done, labeledTotal, unlabeled }
  }, [cards])

  if (total === 0) {
    return (
      <p className="mt-8 text-center text-sm text-ink-faint">
        Пока нет разобранных дел. Отметь сферу жизни при разборе — и здесь
        появится баланс твоих приоритетов.
      </p>
    )
  }

  const max = Math.max(1, ...rows.map((r) => r.total))

  // Кольцо-«ромашка»: доли сфер как conic-gradient.
  let acc = 0
  const slices = []
  for (const r of rows) {
    if (r.total === 0 || labeledTotal === 0) continue
    const start = (acc / labeledTotal) * 360
    acc += r.total
    const end = (acc / labeledTotal) * 360
    slices.push(`${r.dot} ${start}deg ${end}deg`)
  }
  const conic = slices.length
    ? `conic-gradient(${slices.join(', ')})`
    : 'var(--color-sunken)'

  return (
    <div className="mt-6 flex flex-col gap-4">
      <section className="hm-glass rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Target className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-sm font-semibold text-ink">Баланс сфер жизни</p>
            <p className="m-0 mt-0.5 text-sm text-ink-muted">
              <span className="text-lg font-bold text-accent">{total}</span> в потоке
              <span className="mx-1.5 text-ink-faint">·</span>
              {done} выполнено
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="mx-auto shrink-0 sm:mx-0">
            <div
              className="relative h-32 w-32 rounded-full"
              style={{ background: conic }}
            >
              <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-surface">
                <div className="text-center">
                  <p className="m-0 text-2xl font-bold tabular-nums text-ink">
                    {labeledTotal}
                  </p>
                  <p className="m-0 text-[11px] text-ink-faint">отмечено</p>
                </div>
              </div>
            </div>
          </div>

          <ul className="flex min-w-0 flex-1 list-none flex-col gap-2.5 p-0">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <span className="flex w-32 shrink-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: r.dot }}
                  />
                  <span className="truncate text-xs font-medium text-ink">
                    {r.label}
                  </span>
                </span>
                <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-sunken">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${(r.total / max) * 100}%`, background: r.dot }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                  {r.done}/{r.total}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {unlabeled > 0 && (
          <p className="mt-4 text-xs text-ink-faint">
            Не отмечено сферой: {unlabeled}. Отметь при следующем разборе, чтобы
            картина была точнее.
          </p>
        )}
      </section>
    </div>
  )
}
