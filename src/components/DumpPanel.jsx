import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../store/useCardsStore'

function CollapseDialog({ onSave, onDiscard, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-cream/80 px-6 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full rounded-xl border border-cream-dark bg-white p-5 shadow-lg"
      >
        <p className="m-0 text-sm leading-relaxed text-warm-text">
          Сохранить мысль перед сворачиванием?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-warm-accent py-2 text-sm font-medium text-white hover:bg-warm-accent-hover"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-lg border border-cream-dark py-2 text-sm text-warm-muted hover:bg-cream-dark"
          >
            Отменить
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-1 text-xs text-warm-muted hover:text-warm-text"
          >
            Продолжить писать
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DumpTextarea({ inputRef, text, onChange, onKeyDown, hint }) {
  return (
    <>
      <textarea
        ref={inputRef}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Что крутится в голове?"
        rows={5}
        className="w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-[15px] leading-relaxed text-warm-text placeholder:text-warm-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-warm-accent/30"
      />
      <p className="text-center text-xs text-warm-muted">{hint}</p>
    </>
  )
}

export default function DumpPanel() {
  const [mode, setMode] = useState('idle')
  const [text, setText] = useState('')
  const [sessionCount, setSessionCount] = useState(0)
  const [showCollapseDialog, setShowCollapseDialog] = useState(false)
  const inputRef = useRef(null)
  const addCard = useCardsStore((s) => s.addCard)
  const setLastAddedId = useCardsStore((s) => s.setLastAddedId)

  const isInputActive = mode === 'capturing' || mode === 'flow'

  useEffect(() => {
    if (isInputActive) inputRef.current?.focus()
  }, [mode, isInputActive])

  const saveCard = () => {
    const card = addCard(text)
    if (!card) return false

    setLastAddedId(card.id)
    setText('')
    setTimeout(() => setLastAddedId(null), 800)
    return true
  }

  const handleSave = () => {
    if (!saveCard()) return

    if (mode === 'capturing') {
      setSessionCount(1)
      setMode('flow')
    } else if (mode === 'flow') {
      setSessionCount((c) => c + 1)
    }

    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const collapseToIdle = () => {
    setMode('idle')
    setText('')
    setSessionCount(0)
    setShowCollapseDialog(false)
  }

  const requestCollapse = () => {
    if (text.trim()) {
      setShowCollapseDialog(true)
    } else {
      collapseToIdle()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
      return
    }

    if (e.key === 'Escape') {
      if (mode === 'capturing') {
        setText('')
        setMode('idle')
      } else if (mode === 'flow') {
        if (showCollapseDialog) {
          setShowCollapseDialog(false)
        } else {
          requestCollapse()
        }
      }
    }
  }

  return (
    <aside className="relative flex w-[360px] shrink-0 flex-col border-r border-cream-dark bg-cream">
      <header className="border-b border-cream-dark px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="m-0 text-xl font-medium tracking-tight text-warm-text">
              KaizenFlow
            </h1>
            <p className="mt-1 text-sm text-warm-muted">
              {mode === 'flow' ? (
                <>
                  Режим потока
                  <span className="text-warm-accent"> · {sessionCount}</span>
                </>
              ) : (
                'Чистая голова'
              )}
            </p>
          </div>
          {mode === 'flow' && (
            <button
              type="button"
              onClick={requestCollapse}
              className="shrink-0 rounded-lg border border-cream-dark px-3 py-1.5 text-xs text-warm-muted transition-colors hover:bg-cream-dark hover:text-warm-text"
            >
              Свернуть
            </button>
          )}
        </div>
      </header>

      <div
        className={
          mode === 'flow'
            ? 'flex flex-col px-6 py-5'
            : 'flex flex-1 flex-col items-center justify-center px-6 py-10'
        }
      >
        <AnimatePresence mode="wait">
          {mode === 'idle' && (
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
                onClick={() => setMode('capturing')}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-warm-accent text-lg font-medium text-white shadow-lg shadow-warm-accent/30 transition-colors hover:bg-warm-accent-hover"
              >
                Выгрузить
              </motion.button>
              <p className="max-w-[220px] text-center text-sm leading-relaxed text-warm-muted">
                Одна кнопка — одна мысль. Без планирования, без фильтров.
              </p>
            </motion.div>
          )}

          {mode === 'capturing' && (
            <motion.div
              key="capturing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex w-full flex-col gap-4"
            >
              <DumpTextarea
                inputRef={inputRef}
                text={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                hint="Enter — сохранить · Shift+Enter — новая строка"
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
                    setMode('idle')
                  }}
                  className="rounded-lg border border-cream-dark px-4 py-2.5 text-sm text-warm-muted transition-colors hover:bg-cream-dark"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'flow' && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex w-full flex-col gap-3"
            >
              <DumpTextarea
                inputRef={inputRef}
                text={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                hint="Enter — следующая · Shift+Enter — строка · Esc — свернуть"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!text.trim()}
                className="rounded-lg bg-warm-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-warm-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Готово
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCollapseDialog && (
          <CollapseDialog
            onSave={() => {
              handleSave()
              collapseToIdle()
            }}
            onDiscard={collapseToIdle}
            onCancel={() => setShowCollapseDialog(false)}
          />
        )}
      </AnimatePresence>
    </aside>
  )
}
