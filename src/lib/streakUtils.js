// «Поток дней» — глобальный мягкий стрик KaizenFlow.
//
// Всё выводится из существующих данных (закрытые карточки, фокус-сессии, лог
// привычек) — отдельного персист-стора нет, рассинхрон невозможен. Активный
// день = любое действие. Заморозка прощает 1 пропуск в скользящие 7 дней:
// поток не рвётся, а пропуск помечается явно (видимое прощение, не магия).

import { localDateKey } from './timerUtils'
import { WEEKDAY_LABELS, mondayOf } from './habitUtils'

// Дневная цель: сколько «дел потока» = «день в потоке». 1 действие держит
// поток, 3 — наполняют день. Превышение не наказывается (равномерность).
export const DAY_FLOW_TARGET = 3

const DAY_MS = 86400000

function startOfLocalDay(input) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function shiftDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

// Целое число календарных дней между двумя датами (later - earlier).
function daysBetween(later, earlier) {
  return Math.round((startOfLocalDay(later) - startOfLocalDay(earlier)) / DAY_MS)
}

// Время завершения карточки с запасными вариантами для старых данных.
function cardDoneTime(card) {
  return card.completedAt ?? card.createdAt ?? null
}

// Объединение всех дней-ключей, в которых было хоть какое-то действие.
export function collectActiveDays(cards = [], sessions = [], habitLog = {}) {
  const days = new Set()

  for (const card of cards) {
    if (card?.status !== 'done') continue
    const ts = cardDoneTime(card)
    if (ts == null) continue
    days.add(localDateKey(ts))
  }

  for (const session of sessions) {
    if (session?.endedAt == null) continue
    days.add(localDateKey(session.endedAt))
  }

  for (const dates of Object.values(habitLog)) {
    if (!Array.isArray(dates)) continue
    for (const key of dates) {
      if (typeof key === 'string') days.add(key)
    }
  }

  return days
}

// Идём назад от сегодня, считая активные дни. «Сегодня ещё не активно» не
// рвёт поток — отсчёт стартует со вчера. Пустой день перешагиваем заморозкой,
// если в последних 7 днях обхода она ещё не тратилась; иначе поток кончился.
// Заморожённые дни возвращаются в `frozenKeys` (для пометки в неделе).
function walkStreak(activeDays, now) {
  const todayKey = localDateKey(now)
  let cursor = startOfLocalDay(now)
  if (!activeDays.has(todayKey)) {
    cursor = shiftDays(cursor, -1)
  }

  let streak = 0
  let lastFreeze = null
  const frozenKeys = new Set()

  for (let guard = 0; guard < 5000; guard++) {
    const key = localDateKey(cursor)
    if (activeDays.has(key)) {
      streak += 1
      cursor = shiftDays(cursor, -1)
      continue
    }
    const canFreeze = lastFreeze == null || daysBetween(lastFreeze, cursor) >= 7
    if (canFreeze) {
      lastFreeze = cursor
      frozenKeys.add(key)
      cursor = shiftDays(cursor, -1)
      continue
    }
    break
  }

  return { streak, frozenKeys }
}

// Лучший стрик за всю историю — прямой проход по отсортированным активным
// дням с тем же правилом заморозки (один прощённый пропуск на 7 дней).
function computeBestStreak(activeDays, now) {
  const todayKey = localDateKey(now)
  const dates = [...activeDays]
    .filter((key) => key <= todayKey)
    .map((key) => startOfLocalDay(new Date(`${key}T00:00:00`)))
    .sort((a, b) => a - b)

  if (dates.length === 0) return 0

  let best = 1
  let run = 1
  let lastFreeze = null

  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i], dates[i - 1])
    if (gap === 1) {
      run += 1
    } else if (gap === 2) {
      const missing = shiftDays(dates[i], -1)
      const canFreeze = lastFreeze == null || daysBetween(missing, lastFreeze) >= 7
      if (canFreeze) {
        run += 1
        lastFreeze = missing
      } else {
        run = 1
        lastFreeze = null
      }
    } else {
      run = 1
      lastFreeze = null
    }
    if (run > best) best = run
  }

  return best
}

// Дни текущей недели (Пн…Вс) со статусом для hero.
function buildWeek(activeDays, frozenKeys, now) {
  const todayKey = localDateKey(now)
  const monday = mondayOf(new Date(now))

  return WEEKDAY_LABELS.map((label, i) => {
    const key = localDateKey(shiftDays(monday, i))
    let status
    if (key > todayKey) status = 'future'
    else if (activeDays.has(key)) status = 'done'
    else if (key === todayKey) status = 'today'
    else if (frozenKeys.has(key)) status = 'frozen'
    else status = 'empty'
    return { key, label, status, isToday: key === todayKey }
  })
}

export function computeFlowStreak(activeDays, now = Date.now()) {
  const todayKey = localDateKey(now)
  const { streak, frozenKeys } = walkStreak(activeDays, now)
  const weekDays = buildWeek(activeDays, frozenKeys, now)

  return {
    streak,
    isTodayActive: activeDays.has(todayKey),
    bestStreak: Math.max(streak, computeBestStreak(activeDays, now)),
    weekDays,
    frozenInWeek: weekDays.some((d) => d.status === 'frozen'),
  }
}

// Сколько «дел потока» закрыто за конкретный день: закрытые карточки +
// фокус-сессии + отметки привычек, каждое = 1 (без двойного учёта дней).
export function computeDayFlowCount(cards = [], sessions = [], habitLog = {}, dayKey) {
  let count = 0

  for (const card of cards) {
    if (card?.status !== 'done') continue
    const ts = cardDoneTime(card)
    if (ts != null && localDateKey(ts) === dayKey) count += 1
  }

  for (const session of sessions) {
    if (session?.endedAt != null && localDateKey(session.endedAt) === dayKey) {
      count += 1
    }
  }

  for (const dates of Object.values(habitLog)) {
    if (Array.isArray(dates) && dates.includes(dayKey)) count += 1
  }

  return count
}
