import { useState } from 'react'
import StuckSheet from './StuckSheet'

export default function StuckNudge({ stuckCards }) {
  const [open, setOpen] = useState(false)

  if (stuckCards.length === 0) return null

  const label =
    stuckCards.length === 1
      ? '1 дело застряло — пересмотреть?'
      : `${stuckCards.length} дел застряло — пересмотреть?`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-amber-400/30 bg-amber-50/50 px-4 py-3 text-left text-sm text-warm-text transition-colors hover:bg-amber-50"
      >
        {label}
      </button>

      <StuckSheet
        open={open}
        stuckCards={stuckCards}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
