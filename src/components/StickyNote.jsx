import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const DRAG_THRESHOLD = 5

function autoResize(textarea) {
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

export default function StickyNote({
  card,
  onDelete,
  onMove,
  onUpdate,
  onFilter,
  isNew = false,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(card.text)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef(null)
  const isDraggingRef = useRef(false)
  const inputRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      autoResize(inputRef.current)
    }
  }, [isEditing])

  const startEdit = () => {
    setEditText(card.text)
    setIsEditing(true)
  }

  const saveEdit = () => {
    const saved = onUpdate(card.id, editText)
    if (saved) {
      setIsEditing(false)
    } else {
      setEditText(card.text)
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setEditText(card.text)
    setIsEditing(false)
  }

  const handleTextDoubleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    startEdit()
  }

  const handlePointerDown = (e) => {
    if (isEditing || e.button !== 0) return

    isDraggingRef.current = false
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      cardX: card.x ?? 0,
      cardY: card.y ?? 0,
    }
  }

  const handlePointerMove = (e) => {
    if (!dragStart.current) return

    const dx = e.clientX - dragStart.current.pointerX
    const dy = e.clientY - dragStart.current.pointerY

    if (
      !isDraggingRef.current &&
      (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
    ) {
      isDraggingRef.current = true
      setIsDragging(true)
      cardRef.current?.setPointerCapture(e.pointerId)
    }

    if (isDraggingRef.current) {
      setOffset({ x: dx, y: dy })
    }
  }

  const finishDrag = (clientX, clientY) => {
    if (!dragStart.current) return

    const { pointerX, pointerY, cardX, cardY } = dragStart.current
    dragStart.current = null
    isDraggingRef.current = false
    setIsDragging(false)
    setOffset({ x: 0, y: 0 })

    const dx = clientX - pointerX
    const dy = clientY - pointerY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      onMove(card.id, cardX + dx, cardY + dy)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const x = (card.x ?? 0) + offset.x
  const y = (card.y ?? 0) + offset.y
  const isRaised = isDragging || isEditing

  return (
    <div
      data-card-id={card.id}
      className={clsx('absolute w-[180px]', className)}
      style={{
        left: x,
        top: y,
        rotate: card.rotation,
        zIndex: isRaised ? 50 : 1,
      }}
    >
      <motion.div
        ref={cardRef}
        initial={
          isNew ? { opacity: 0, x: -220, y: 10, scale: 0.82 } : false
        }
        animate={{ opacity: 1, x: 0, y: 0, scale: isDragging ? 1.02 : 1 }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishDrag(e.clientX, e.clientY)}
        onPointerCancel={(e) => finishDrag(e.clientX, e.clientY)}
        className={clsx(
          'relative rounded-sm px-4 py-3 shadow-md transition-shadow duration-200',
          isEditing ? 'select-text ring-2 ring-warm-accent/40' : 'touch-none select-none',
          isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab group-hover:shadow-lg',
          !isDragging && !isEditing && 'group',
        )}
        style={{
          backgroundColor: card.color.bg,
          boxShadow: isRaised
            ? `4px 6px 16px ${card.color.shadow}88, 0 2px 4px rgba(0,0,0,0.1)`
            : `2px 3px 8px ${card.color.shadow}55, 0 1px 2px rgba(0,0,0,0.06)`,
        }}
      >
        {!isEditing && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={startEdit}
              aria-label="Редактировать карточку"
              className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-warm-text/80 text-xs text-white opacity-0 shadow transition-opacity duration-150 hover:bg-warm-text group-hover:opacity-100"
            >
              ✎
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDelete(card.id)}
              aria-label="Удалить карточку"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-warm-text/80 text-xs text-white opacity-0 shadow transition-opacity duration-150 hover:bg-warm-text group-hover:opacity-100"
            >
              ✕
            </button>
            <p
              onDoubleClick={handleTextDoubleClick}
              title="Дважды кликни, чтобы редактировать"
              className="m-0 cursor-text text-[14px] leading-snug text-warm-text"
            >
              {card.text}
            </p>
            {onFilter && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onFilter(card.id)}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-warm-accent px-2.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow transition-opacity duration-150 hover:bg-warm-accent-hover group-hover:opacity-100"
              >
                Разобрать
              </button>
            )}
          </>
        )}

        {isEditing && (
          <textarea
            ref={inputRef}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value)
              autoResize(e.target)
            }}
            onKeyDown={handleEditKeyDown}
            onBlur={saveEdit}
            rows={1}
            className="m-0 w-full resize-none overflow-hidden border-none bg-transparent p-0 text-[14px] leading-snug text-warm-text outline-none"
          />
        )}
      </motion.div>
    </div>
  )
}
