import { useEffect, useState } from 'react'

const QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine)'

export function useFinePointerDesktop() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return enabled
}
