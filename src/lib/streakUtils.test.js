import { describe, it, expect } from 'vitest'
import { localDateKey } from './timerUtils'
import { mondayOf } from './habitUtils'
import {
  collectActiveDays,
  computeFlowStreak,
  computeDayFlowCount,
  DAY_FLOW_TARGET,
} from './streakUtils'

// Fixed reference: 14 June 2026, noon local. June has no DST shift here.
const NOW = new Date(2026, 5, 14, 12, 0, 0).getTime()
// Day key for the Nth day of June 2026 (local).
const june = (d) => localDateKey(new Date(2026, 5, d).getTime())

describe('collectActiveDays', () => {
  it('unions done cards, sessions, and habit log into day keys', () => {
    const cards = [
      { status: 'done', completedAt: new Date(2026, 5, 14).getTime() },
      { status: 'raw', createdAt: new Date(2026, 5, 14).getTime() },
    ]
    const sessions = [{ endedAt: new Date(2026, 5, 13).getTime() }]
    const habitLog = { h1: [june(12)] }

    const days = collectActiveDays(cards, sessions, habitLog)
    expect(days.has(june(14))).toBe(true)
    expect(days.has(june(13))).toBe(true)
    expect(days.has(june(12))).toBe(true)
    expect(days.size).toBe(3)
  })

  it('falls back to createdAt for done cards without completedAt', () => {
    const cards = [{ status: 'done', createdAt: new Date(2026, 5, 10).getTime() }]
    const days = collectActiveDays(cards, [], {})
    expect(days.has(june(10))).toBe(true)
  })
})

describe('computeFlowStreak', () => {
  it('returns zero on empty history', () => {
    const r = computeFlowStreak(new Set(), NOW)
    expect(r.streak).toBe(0)
    expect(r.isTodayActive).toBe(false)
    expect(r.bestStreak).toBe(0)
  })

  it('counts today + yesterday', () => {
    const r = computeFlowStreak(new Set([june(14), june(13)]), NOW)
    expect(r.streak).toBe(2)
    expect(r.isTodayActive).toBe(true)
  })

  it('does not penalize an inactive-but-not-over today', () => {
    const r = computeFlowStreak(new Set([june(13), june(12)]), NOW)
    expect(r.streak).toBe(2)
    expect(r.isTodayActive).toBe(false)
  })

  it('counts a long contiguous chain ending today', () => {
    const days = new Set([10, 11, 12, 13, 14].map(june))
    expect(computeFlowStreak(days, NOW).streak).toBe(5)
  })

  it('bridges a single gap with a freeze', () => {
    // gap at day 12; freeze should carry the streak across it
    const days = new Set([10, 11, 13, 14].map(june))
    expect(computeFlowStreak(days, NOW).streak).toBe(4)
  })

  it('breaks on two consecutive gaps (one freeze per 7 days)', () => {
    // gaps at 11 and 12 — only one can be frozen
    const days = new Set([10, 13, 14].map(june))
    expect(computeFlowStreak(days, NOW).streak).toBe(2)
  })

  it('allows a second freeze once 7 days have passed', () => {
    // active June 1-14 except gaps at 13 and 5 (8 days apart)
    const active = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14].map(june)
    expect(computeFlowStreak(new Set(active), NOW).streak).toBe(12)
  })

  it('reports best streak from history, even past the current run', () => {
    // a 6-day block (June 1-6) plus a current 2-day run (June 13-14)
    const days = new Set([1, 2, 3, 4, 5, 6, 13, 14].map(june))
    const r = computeFlowStreak(days, NOW)
    expect(r.streak).toBe(2)
    expect(r.bestStreak).toBe(6)
  })

  it('builds a 7-day week and marks a gap bridged by the live streak', () => {
    // NOW (14 June 2026) is a Sunday, so the week is June 8 (Mon) … 14 (Sun).
    // Active all week except June 11 — the live streak bridges it via a freeze.
    expect(localDateKey(mondayOf(new Date(NOW)))).toBe(june(8))
    const days = new Set([8, 9, 10, 12, 13, 14].map(june))
    const r = computeFlowStreak(days, NOW)
    expect(r.weekDays).toHaveLength(7)
    expect(r.weekDays.find((d) => d.key === june(11)).status).toBe('frozen')
    expect(r.frozenInWeek).toBe(true)
    expect(r.weekDays.find((d) => d.key === june(8)).status).toBe('done')
    expect(r.weekDays.find((d) => d.key === june(14)).status).toBe('done')
    expect(r.weekDays.find((d) => d.key === june(14)).isToday).toBe(true)
  })
})

describe('computeDayFlowCount', () => {
  const cards = [
    { status: 'done', completedAt: new Date(2026, 5, 14).getTime() },
    { status: 'done', completedAt: new Date(2026, 5, 13).getTime() },
    { status: 'raw', createdAt: new Date(2026, 5, 14).getTime() },
  ]
  const sessions = [
    { endedAt: new Date(2026, 5, 14, 9).getTime() },
    { endedAt: new Date(2026, 5, 14, 15).getTime() },
  ]
  const habitLog = { h1: [june(14)], h2: [june(14), june(13)] }

  it('counts cards, sessions, and habits for a day without double-counting', () => {
    expect(computeDayFlowCount(cards, sessions, habitLog, june(14))).toBe(5)
  })

  it('counts only the given day', () => {
    expect(computeDayFlowCount(cards, sessions, habitLog, june(13))).toBe(2)
  })

  it('exposes a sane daily target', () => {
    expect(DAY_FLOW_TARGET).toBe(3)
  })
})
