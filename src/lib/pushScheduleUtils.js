import { getUserTimezone } from './pushUtils'

export const MORNING_HOUR = 8
export const INACTIVE_MS = 3 * 24 * 60 * 60 * 1000

export function localDateKey(now = new Date(), timezone = getUserTimezone()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function localMonthKey(now = new Date(), timezone = getUserTimezone()) {
  return localDateKey(now, timezone).slice(0, 7)
}

export function localHour(now = new Date(), timezone = getUserTimezone()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const hour = parts.find((p) => p.type === 'hour')?.value
  return Number(hour)
}

export function startOfLocalDayMs(now = new Date(), timezone = getUserTimezone()) {
  const dateKey = localDateKey(now, timezone)
  const probe = new Date(now)
  for (let i = 0; i < 48; i += 1) {
    if (localDateKey(probe, timezone) === dateKey && localHour(probe, timezone) === 0) {
      return probe.getTime()
    }
    probe.setTime(probe.getTime() - 30 * 60 * 1000)
  }
  return now.getTime() - 24 * 60 * 60 * 1000
}

export function hasDumpedToday(lastDumpAt, now = new Date(), timezone = getUserTimezone()) {
  if (!lastDumpAt) return false
  return lastDumpAt >= startOfLocalDayMs(now, timezone)
}

export function isFirstDayOfMonth(now = new Date(), timezone = getUserTimezone()) {
  const day = Number(localDateKey(now, timezone).split('-')[2])
  return day === 1
}
