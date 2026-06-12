import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { TABS, useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { hapticTap } from '../../lib/haptics'
import { useFinePointerDesktop } from '../../lib/useFinePointerDesktop'

function CollapseDialog({ onSave, onDiscard, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-ink/10 px-6 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full rounded-2xl border border-line bg-surface p-5 shadow-(--shadow-float)"
      >
        <p className="m-0 text-sm leading-relaxed text-ink">
          Сохранить мысль перед закрытием?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover active:scale-[0.98] transition"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-xl border border-line py-2 text-sm text-ink-muted hover:bg-sunken transition"
          >
            Отменить
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-1 text-xs text-ink-muted hover:text-ink transition"
          >
            Продолжить писать
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SplitDialog({ count, onSplit, onKeepOne, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-ink/10 px-6 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full rounded-2xl border border-line bg-surface p-5 shadow-(--shadow-float)"
      >
        <p className="m-0 text-sm font-medium text-ink">
          Разбить на {count} мыслей?
        </p>
        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
          Каждый абзац станет отдельной карточкой.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSplit}
            className="rounded-xl bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover active:scale-[0.98] transition"
          >
            Разбить
          </button>
          <button
            type="button"
            onClick={onKeepOne}
            className="rounded-xl border border-line py-2 text-sm text-ink-muted hover:bg-sunken transition"
          >
            Оставить одной
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-1 text-xs text-ink-muted hover:text-ink transition"
          >
            Продолжить писать
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function getChunks(text) {
  if (text.includes('\n\n')) {
    const parts = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
    if (parts.length >= 2) return parts
  }
  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean)
  if (lines.length >= 3) return lines
  return null
}

export default function DumpOverlay() {
  const open = useAppStore((s) => s.dumpOpen)
  const onClose = useAppStore((s) => s.closeDump)
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const setTab = useAppStore((s) => s.setTab)

  const [text, setText] = useState('')
  const [sessionCount, setSessionCount] = useState(0)
  const [showCollapseDialog, setShowCollapseDialog] = useState(false)
  const [splitChunks, setSplitChunks] = useState([])
  const [counterFlash, setCounterFlash] = useState(false)
  const inputRef = useRef(null)
  const addCard = useCardsStore((s) => s.addCard)
  const setLastAddedId = useCardsStore((s) => s.setLastAddedId)
  const showToast = useToastStore((s) => s.showToast)
  const clearToast = useToastStore((s) => s.clearToast)
  const isDesktop = useFinePointerDesktop()

  const destinationShort = silenceWeek ? 'на холст «Разбор»' : 'во вкладку «Разбор»'
  const destinationHint = silenceWeek
    ? 'Мысли сохраняются на холст во вкладке «Разбор»'
    : 'Мысли сохраняются во вкладке «Разбор»'

  useEffect(() => {
    if (open) {
      setText('')
      setSessionCount(0)
      setShowCollapseDialog(false)
      setSplitChunks([])
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const saveCard = () => {
    const card = addCard(text)
    if (!card) return false
    setLastAddedId(card.id)
    setText('')
    setTimeout(() => setLastAddedId(null), 800)
    return true
  }

  const flashCounter = () => {
    setCounterFlash(true)
    setTimeout(() => setCounterFlash(false), 600)
  }

  const showSavedToast = (count) => {
    const message =
      count > 1
        ? `Сохранено · ${count} ${destinationShort}`
        : `Сохранено ${destinationShort}`
    showToast({
      variant: 'success',
      key: 'dump-save',
      message,
      actionLabel: 'Посмотреть',
      onAction: () => {
        closeOverlay()
        setTab(TABS.review)
        clearToast()
      },
    })
  }

  const handleSave = () => {
    if (!text.trim()) return

    const chunks = getChunks(text.trim())
    if (chunks) {
      setSplitChunks(chunks)
      return
    }

    if (!saveCard()) return
    const count = sessionCount + 1
    setSessionCount(count)
    showSavedToast(count)
    hapticTap()
    flashCounter()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleSplitConfirm = () => {
    splitChunks.forEach((chunk) => addCard(chunk))
    setSplitChunks([])
    setText('')
    const newCount = sessionCount + splitChunks.length
    setSessionCount(newCount)
    showSavedToast(newCount)
    hapticTap()
    flashCounter()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleSplitKeepOne = () => {
    setSplitChunks([])
    if (!saveCard()) return
    const count = sessionCount + 1
    setSessionCount(count)
    showSavedToast(count)
    hapticTap()
    flashCounter()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const closeOverlay = () => {
    setText('')
    setSessionCount(0)
    setShowCollapseDialog(false)
    setSplitChunks([])
    onClose()
  }

  const requestClose = () => {
    if (text.trim()) {
      setShowCollapseDialog(true)
    } else {
      closeOverlay()
    }
  }

  const handleKeyDown = (e) => {
    if (e.isComposing) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
      return
    }
    if (e.key === 'Escape') {
      if (splitChunks.length > 0) {
        setSplitChunks([])
      } else if (showCollapseDialog) {
        setShowCollapseDialog(false)
      } else {
        requestClose()
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-end justify-center md:items-center md:p-6"
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={requestClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl border border-line/60 bg-surface shadow-(--shadow-float) md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-[17px] font-semibold text-ink">
                  Выгрузить мысль
                </h2>
                {sessionCount > 0 && (
                  <motion.span
                    animate={counterFlash ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${counterFlash ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent'}`}
                  >
                    {sessionCount} за сессию
                  </motion.span>
                )}
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={requestClose}
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex flex-col gap-4 px-6 py-5">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Что крутится в голове?"
                rows={5}
                className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint outline-none transition focus:border-line-strong focus:ring-2 focus:ring-accent/30"
              />

              {isDesktop && (
                <p className="text-center text-xs text-ink-faint">
                  Enter — сохранить · Shift+Enter — новая строка · Esc — закрыть
                </p>
              )}

              <p className="text-center text-xs text-ink-muted">{destinationHint}</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={closeOverlay}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm text-ink-muted transition hover:border-line-strong hover:bg-sunken/60"
                >
                  Готово
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showCollapseDialog && (
                <CollapseDialog
                  onSave={() => {
                    handleSave()
                    closeOverlay()
                  }}
                  onDiscard={closeOverlay}
                  onCancel={() => setShowCollapseDialog(false)}
                />
              )}
              {splitChunks.length > 0 && (
                <SplitDialog
                  count={splitChunks.length}
                  onSplit={handleSplitConfirm}
                  onKeepOne={handleSplitKeepOne}
                  onCancel={() => setSplitChunks([])}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
