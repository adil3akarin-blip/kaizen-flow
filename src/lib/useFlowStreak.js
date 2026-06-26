import { useMemo } from 'react'
import { useCardsStore } from '../store/useCardsStore'
import { useTimerStore } from '../store/useTimerStore'
import { useHabitsStore } from '../store/useHabitsStore'
import { useTodayKey } from './useTodayKey'
import {
  collectActiveDays,
  computeDayFlowCount,
  computeFlowStreak,
  DAY_FLOW_TARGET,
} from './streakUtils'

// Live «Поток дней» data, derived from cards + focus sessions + habit log.
// `useTodayKey` re-anchors the computation across midnight.
export function useFlowStreak() {
  const cards = useCardsStore((s) => s.cards)
  const sessions = useTimerStore((s) => s.sessions)
  const log = useHabitsStore((s) => s.log)
  const todayKey = useTodayKey()

  return useMemo(() => {
    // Day-resolution "now" derived from todayKey keeps this memo pure and
    // re-anchors across midnight when useTodayKey updates.
    const now = new Date(`${todayKey}T12:00:00`).getTime()
    const activeDays = collectActiveDays(cards, sessions, log)
    const flow = computeFlowStreak(activeDays, now)
    return {
      ...flow,
      todayCount: computeDayFlowCount(cards, sessions, log, todayKey),
      todayTarget: DAY_FLOW_TARGET,
    }
  }, [cards, sessions, log, todayKey])
}

export default useFlowStreak
