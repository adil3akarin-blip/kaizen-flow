import { motion, AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../store/useCardsStore'

export default function UndoToast() {
  const pendingDelete = useCardsStore((s) => s.pendingDelete)
  const undoDelete = useCardsStore((s) => s.undoDelete)

  return (
    <AnimatePresence>
      {pendingDelete && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-warm-text px-5 py-3 text-sm text-white shadow-xl"
        >
          <span>Карточка удалена</span>
          <button
            type="button"
            onClick={undoDelete}
            className="font-medium text-[#FFE0B2] underline-offset-2 hover:underline"
          >
            Отменить
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
