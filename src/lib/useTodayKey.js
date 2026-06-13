import { useEffect, useState } from 'react'
import { localDateKey } from './timerUtils'

// Local date key that rolls over at midnight while the app stays open.
// Timers can fire late after system sleep, so visibilitychange re-checks too.
export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => localDateKey(Date.now()))

  useEffect(() => {
    let timeoutId

    const arm = () => {
      const now = new Date()
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000)
      timeoutId = setTimeout(() => {
        setTodayKey(localDateKey(Date.now()))
        arm()
      }, delay)
    }

    const onVisible = () => {
      if (!document.hidden) setTodayKey(localDateKey(Date.now()))
    }

    arm()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return todayKey
}
