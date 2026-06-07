import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function StickyNote({
  card,
  onDelete,
  isNew = false,
  className,
}) {
  return (
    <motion.div
      layout
      initial={
        isNew
          ? { opacity: 0, x: -220, y: 10, scale: 0.82, rotate: card.rotation }
          : false
      }
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: card.rotation,
      }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 24,
      }}
      className={clsx(
        'group absolute w-[180px] cursor-default select-none',
        className,
      )}
      style={{ left: card.x, top: card.y }}
    >
      <div
        className="relative rounded-sm px-4 py-3 shadow-md transition-shadow duration-200 group-hover:shadow-lg"
        style={{
          backgroundColor: card.color.bg,
          boxShadow: `2px 3px 8px ${card.color.shadow}55, 0 1px 2px rgba(0,0,0,0.06)`,
        }}
      >
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          aria-label="Удалить карточку"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-warm-text/80 text-xs text-white opacity-0 shadow transition-opacity duration-150 hover:bg-warm-text group-hover:opacity-100"
        >
          ✕
        </button>
        <p className="m-0 text-[14px] leading-snug text-warm-text">{card.text}</p>
      </div>
    </motion.div>
  )
}
