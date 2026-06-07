import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../store/useCardsStore'

export default function DumpPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const addCard = useCardsStore((s) => s.addCard)
  const setLastAddedId = useCardsStore((s) => s.setLastAddedId)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSave = () => {
    const card = addCard(text)
    if (!card) return

    setLastAddedId(card.id)
    setText('')
    setIsOpen(false)

    setTimeout(() => setLastAddedId(null), 800)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setText('')
      setIsOpen(false)
    }
  }

  return (
    <aside className="flex w-[360px] shrink-0 flex-col border-r border-cream-dark bg-cream">
      <header className="border-b border-cream-dark px-6 py-5">
        <h1 className="m-0 text-xl font-medium tracking-tight text-warm-text">
          KaizenFlow
        </h1>
        <p className="mt-1 text-sm text-warm-muted">Чистая голова</p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(true)}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-warm-accent text-lg font-medium text-white shadow-lg shadow-warm-accent/30 transition-colors hover:bg-warm-accent-hover"
              >
                Выгрузить
              </motion.button>
              <p className="max-w-[220px] text-center text-sm leading-relaxed text-warm-muted">
                Одна кнопка — одна мысль. Без планирования, без фильтров.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex w-full flex-col gap-4"
            >
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Что крутится в голове?"
                rows={5}
                className="w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-[15px] leading-relaxed text-warm-text placeholder:text-warm-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-warm-accent/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="flex-1 rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-warm-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Готово
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setText('')
                    setIsOpen(false)
                  }}
                  className="rounded-lg border border-cream-dark px-4 py-2.5 text-sm text-warm-muted transition-colors hover:bg-cream-dark"
                >
                  Отмена
                </button>
              </div>
              <p className="text-center text-xs text-warm-muted">
                Enter — сохранить · Esc — отмена
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
