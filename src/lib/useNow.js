import { useEffect, useState } from 'react'

// A periodically-refreshed timestamp held in state (so render stays pure).
// Ticks every `intervalMs` while `active`, and always re-anchors on tab focus
// and at the next local midnight. All updates run in timer/event callbacks,
// never in render or synchronously in an effect body.
export function useNow({ active = false, intervalMs = 1000 } = {}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())

    const intervalId = active ? setInterval(tick, intervalMs) : null

    const onVisible = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    const d = new Date()
    const msToMidnight =
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() -
      d.getTime() +
      1000
    const midnightId = setTimeout(tick, Math.max(1000, msToMidnight))

    return () => {
      if (intervalId) clearInterval(intervalId)
      clearTimeout(midnightId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [active, intervalMs])

  return now
}
