import { useState } from 'react'
import clsx from 'clsx'
import { ChevronRight, Pause, Play, Square, Timer } from 'lucide-react'
import { useTimerStore } from '../../store/useTimerStore'
import { useCardsStore } from '../../store/useCardsStore'
import { selectWipCard } from '../../lib/cardSelectors'
import {
  currentPhaseElapsedMs,
  formatClock,
  phaseDurationMs,
  sessionFocusElapsedMs,
} from '../../lib/timerUtils'
import { useNow } from '../../lib/useNow'
import StartTimerModal from './StartTimerModal'

function linkLabel(link) {
  if (!link || link.type === 'free') return { icon: '⚡', text: 'Свободная сессия' }
  if (link.type === 'habit') return { icon: link.icon || '🔁', text: link.label || 'Привычка' }
  if (link.type === 'tags') return { icon: '#', text: link.label || 'Теги' }
  return { icon: '◷', text: link.label || 'Задача' }
}

export default function ActiveTimerWidget() {
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const cards = useCardsStore((s) => s.cards)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopTimer = useTimerStore((s) => s.stopTimer)

  const [modalOpen, setModalOpen] = useState(false)

  const wipCard = selectWipCard(cards)
  const running = Boolean(activeTimer?.startedAt)
  const now = useNow({ active: running, intervalMs: 250 })

  // The WIP card surfaces its own timer; this widget covers every other session.
  const ownedByWipCard =
    activeTimer && activeTimer.cardId && wipCard && activeTimer.cardId === wipCard.id

  if (!activeTimer || ownedByWipCard) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="hm-glass flex w-full items-center gap-3 rounded-3xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-(--shadow-float)"
        >
          <span className="hm-grad flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-(--shadow-glow)">
            <Play className="h-5 w-5" strokeWidth={2.4} fill="currentColor" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold text-ink">Запустить таймер</p>
            <p className="m-0 text-xs text-ink-muted">
              Фокус-сессия: свободно, задача, привычка или теги
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" strokeWidth={2} />
        </button>
        <StartTimerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    )
  }

  const isPomodoro = activeTimer.mode === 'pomodoro'
  const phase = isPomodoro ? activeTimer.phase : 'focus'
  let clockMs
  if (isPomodoro) {
    clockMs = Math.max(0, phaseDurationMs(phase, activeTimer) - currentPhaseElapsedMs(activeTimer, now))
  } else {
    clockMs = sessionFocusElapsedMs(activeTimer, now)
  }

  const { icon, text } = linkLabel(activeTimer.link)

  return (
    <section className="hm-glass hm-accent-line relative overflow-hidden rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold text-ink">{text}</p>
            <p className="m-0 text-xs text-ink-faint">
              {isPomodoro
                ? `Помодоро · ${phase === 'break' ? 'Перерыв' : 'Фокус'}`
                : 'Секундомер'}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-xs font-medium text-ink-muted">
          <Timer className="h-3.5 w-3.5" strokeWidth={2} />
          {running ? 'идёт' : 'пауза'}
        </span>
      </div>

      <p className="m-0 mt-3 text-center text-[40px] font-bold leading-none tabular-nums text-ink">
        {formatClock(clockMs)}
      </p>

      {isPomodoro && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {Array.from({ length: Math.max(4, activeTimer.pomodorosCompleted) }).map((_, i) => (
            <span
              key={i}
              className={clsx(
                'h-1.5 w-1.5 rounded-full',
                i < activeTimer.pomodorosCompleted ? 'bg-accent' : 'bg-line-strong',
              )}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-3">
        {running ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-sunken/60"
          >
            <Pause className="h-4 w-4" strokeWidth={2} />
            Пауза
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeTimer}
            className="hm-grad flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" strokeWidth={2.4} fill="currentColor" />
            Продолжить
          </button>
        )}
        <button
          type="button"
          onClick={stopTimer}
          aria-label="Остановить и записать"
          className="flex items-center justify-center rounded-xl border border-line p-2.5 text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
        >
          <Square className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}
