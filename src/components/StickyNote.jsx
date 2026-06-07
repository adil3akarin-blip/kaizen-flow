import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function StickyNote({
  card,
  onDelete,
  onMove,
  isNew = false,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef(null)

  const handlePointerDown = (e) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      cardX: card.x,
      cardY: card.y,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e) => {
    if (!dragStart.current) return
    setOffset({
      x: e.clientX - dragStart.current.pointerX,
      y: e.clientY - dragStart.current.pointerY,
    })
  }

  const finishDrag = (clientX, clientY) => {
    if (!dragStart.current) return

    const { pointerX, pointerY, cardX, cardY } = dragStart.current
    dragStart.current = null
    setIsDragging(false)
    setOffset({ x: 0, y: 0 })

    const dx = clientX - pointerX
    const dy = clientY - pointerY
    if (dx !== 0 || dy !== 0) {
      onMove(card.id, cardX + dx, cardY + dy)
    }
  }

  const handlePointerUp = (e) => {
    finishDrag(e.clientX, e.clientY)
  }

  const handlePointerCancel = (e) => {
    finishDrag(e.clientX, e.clientY)
  }

  const x = card.x + offset.x
  const y = card.y + offset.y

  return (
    <div
      className={clsx('absolute w-[180px] select-none', className)}
      style={{
        left: x,
        top: y,
        rotate: card.rotation,
        zIndex: isDragging ? 50 : 1,
      }}
    >
      <motion.div
        initial={
          isNew ? { opacity: 0, x: -220, y: 10, scale: 0.82 } : false
        }
        animate={{ opacity: 1, x: 0, y: 0, scale: isDragging ? 1.02 : 1 }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={clsx(
          'relative rounded-sm px-4 py-3 shadow-md transition-shadow duration-200 touch-none',
          isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab group-hover:shadow-lg',
          !isDragging && 'group',
        )}
        style={{
          backgroundColor: card.color.bg,
          boxShadow: isDragging
            ? `4px 6px 16px ${card.color.shadow}88, 0 2px 4px rgba(0,0,0,0.1)`
            : `2px 3px 8px ${card.color.shadow}55, 0 1px 2px rgba(0,0,0,0.06)`,
        }}
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(card.id)}
          aria-label="Удалить карточку"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-warm-text/80 text-xs text-white opacity-0 shadow transition-opacity duration-150 hover:bg-warm-text group-hover:opacity-100"
        >
          ✕
        </button>
        <p className="m-0 text-[14px] leading-snug text-warm-text">{card.text}</p>
      </motion.div>
    </div>
  )
}
