import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
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
 className="flex items-center gap-2 text-left text-sm text-warn transition-colors hover:text-warn/80"
 >
 <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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
