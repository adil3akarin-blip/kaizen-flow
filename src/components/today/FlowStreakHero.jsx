import clsx from 'clsx'
import { Check, Flame, Snowflake } from 'lucide-react'
import { useFlowStreak } from '../../lib/useFlowStreak'

const FROZEN_STYLE = { backgroundColor: 'rgba(91,141,239,0.16)', color: '#2f5fc0' }

function DayDot({ day }) {
  const { status, label, isToday } = day
  const base =
    'flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-semibold transition'

  let cell
  if (status === 'done') {
    cell = (
      <span className={clsx(base, 'bg-accent text-white')}>
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    )
  } else if (status === 'frozen') {
    cell = (
      <span
        className={base}
        style={FROZEN_STYLE}
        title="Заморозка спасла поток"
        aria-label="Заморозка спасла поток"
      >
        <Snowflake className="h-4 w-4" strokeWidth={2.4} />
      </span>
    )
  } else if (status === 'today') {
    cell = (
      <span className={clsx(base, 'border-2 border-accent text-accent')}>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
    )
  } else if (status === 'future') {
    cell = <span className={clsx(base, 'bg-line/30')} />
  } else {
    cell = <span className={clsx(base, 'bg-sunken')} />
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      {cell}
      <span className={clsx('text-[11.5px]', isToday ? 'font-semibold text-accent' : 'text-ink-faint')}>
        {label}
      </span>
    </div>
  )
}

export default function FlowStreakHero() {
  const { streak, isTodayActive, bestStreak, weekDays, todayCount, todayTarget } =
    useFlowStreak()

  const fresh = streak === 0
  const filled = Math.min(todayCount, todayTarget)

  return (
    <section className="hm-glass rounded-3xl p-5" aria-label="Поток дней">
      <div className="flex items-center gap-3.5">
        <span
          className={clsx(
            'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl',
            fresh ? 'bg-sunken text-ink-faint' : 'bg-accent-soft text-accent',
          )}
        >
          <Flame className="h-7 w-7" strokeWidth={2} />
        </span>

        {fresh ? (
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[17px] font-bold text-ink">Начни поток сегодня</p>
            <p className="m-0 mt-0.5 text-[12.5px] text-ink-faint">
              Закрой одно дело — и счётчик пойдёт
            </p>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[34px] font-bold leading-none tabular-nums text-ink">
                {streak}
              </span>
              {isTodayActive && (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-[12.5px] font-semibold text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  сегодня в потоке
                </span>
              )}
            </div>
            <p className="m-0 mt-1.5 text-[12.5px] text-ink-faint">
              {streak === 1 ? 'день в потоке' : 'дней в потоке'}
              {bestStreak > 0 && ` · рекорд ${bestStreak}`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-1.5">
        {weekDays.map((day) => (
          <DayDot key={day.key} day={day} />
        ))}
      </div>

      <div className="mt-4 border-t border-line/70 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] text-ink-muted">Сегодня — дела потока</span>
          <span className="text-[13px] font-semibold tabular-nums text-ink">
            {todayCount >= todayTarget ? `${todayCount} ✓` : `${todayCount} из ${todayTarget}`}
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: todayTarget }).map((_, i) => (
            <div
              key={i}
              className={clsx('h-2 flex-1 rounded-full', i < filled ? 'bg-accent' : 'bg-sunken')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
