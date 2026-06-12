import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCardsStore } from '../../store/useCardsStore'
import { TABS, useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { hapticTap } from '../../lib/haptics'

function DestinationHint({ children }) {
 return (
 <p className="m-0 text-center text-xs leading-relaxed text-ink-muted">
 {children}
 </p>
 )
}

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
 className="w-full rounded-xl border border-line bg-white p-5 shadow-lg"
 >
 <p className="m-0 text-sm leading-relaxed text-ink">
 Сохранить мысль перед закрытием?
 </p>
 <div className="mt-4 flex flex-col gap-2">
 <button
 type="button"
 onClick={onSave}
 className="rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover"
 >
 Сохранить
 </button>
 <button
 type="button"
 onClick={onDiscard}
 className="rounded-lg border border-line py-2 text-sm text-ink-muted hover:bg-sunken"
 >
 Отменить
 </button>
 <button
 type="button"
 onClick={onCancel}
 className="py-1 text-xs text-ink-muted hover:text-ink"
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
 className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted/60 outline-none transition-shadow focus:shadow-md focus:ring-2 focus:ring-accent/30"
 />
 <p className="text-center text-xs text-ink-muted">{hint}</p>
 </>
 )
}

export default function DumpOverlay() {
 const open = useAppStore((s) => s.dumpOpen)
 const onClose = useAppStore((s) => s.closeDump)
 const silenceWeek = useAppStore((s) => s.silenceWeek)
 const setTab = useAppStore((s) => s.setTab)

 const [mode, setMode] = useState('idle')
 const [text, setText] = useState('')
 const [sessionCount, setSessionCount] = useState(0)
 const [showCollapseDialog, setShowCollapseDialog] = useState(false)
 const inputRef = useRef(null)
 const addCard = useCardsStore((s) => s.addCard)
 const setLastAddedId = useCardsStore((s) => s.setLastAddedId)
 const showToast = useToastStore((s) => s.showToast)
 const clearToast = useToastStore((s) => s.clearToast)

 const destinationShort = silenceWeek
 ? 'на холст «Разбор»'
 : 'во вкладку «Разбор»'
 const destinationHint = silenceWeek
 ? 'Мысли сохраняются на холст во вкладке «Разбор»'
 : 'Мысли сохраняются во вкладке «Разбор»'

 const isInputActive = mode === 'capturing' || mode === 'flow'

 useEffect(() => {
 if (open && isInputActive) inputRef.current?.focus()
 }, [open, mode, isInputActive])

 const resetState = () => {
 setMode('idle')
 setText('')
 setSessionCount(0)
 setShowCollapseDialog(false)
 }

 const saveCard = () => {
 const card = addCard(text)
 if (!card) return false

 setLastAddedId(card.id)
 setText('')
 setTimeout(() => setLastAddedId(null), 800)
 return true
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
 resetState()
 onClose()
 setTab(TABS.review)
 clearToast()
 },
 })
 }

 const handleSave = () => {
 if (!saveCard()) return

 let count = sessionCount
 if (mode === 'capturing') {
 count = 1
 setSessionCount(1)
 setMode('flow')
 } else if (mode === 'flow') {
 count = sessionCount + 1
 setSessionCount(count)
 }

 showSavedToast(count)
 hapticTap()
 requestAnimationFrame(() => inputRef.current?.focus())
 }

 const closeOverlay = () => {
 resetState()
 onClose()
 }

 const requestClose = () => {
 if (text.trim() && isInputActive) {
 setShowCollapseDialog(true)
 } else {
 closeOverlay()
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
 requestClose()
 }
 } else {
 closeOverlay()
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
 className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
 />

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 40 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className="relative z-10 flex w-full max-w-md flex-col rounded-t-2xl border border-line/60 bg-white shadow-xl md:rounded-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <header className="border-b border-line px-6 py-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <h2 className="m-0 text-lg font-medium text-ink">
 {mode === 'flow' ? 'Режим потока' : 'Выгрузить мысль'}
 </h2>
 <p className="mt-0.5 text-sm text-ink-muted">
 {mode === 'flow' ? (
 <>
 Одна мысль за раз
 <span className="text-accent"> · {sessionCount}</span>
 </>
 ) : (
 'Без планирования, без фильтров'
 )}
 </p>
 </div>
 {mode === 'flow' && (
 <button
 type="button"
 onClick={requestClose}
 className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
 >
 Закрыть
 </button>
 )}
 </div>
 </header>

 <div
 className={
 mode === 'flow'
 ? 'flex flex-col px-6 py-5'
 : 'flex flex-col items-center px-6 py-8'
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
 className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-base font-medium text-white shadow-lg shadow-accent/30 transition-colors hover:bg-accent-hover"
 >
 Начать
 </motion.button>
 <p className="max-w-[260px] text-center text-sm leading-relaxed text-ink/80">
 Одна кнопка — одна мысль. Без планирования, без фильтров.
 </p>
 <DestinationHint>{destinationHint}</DestinationHint>
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
 <DestinationHint>{destinationHint}</DestinationHint>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={handleSave}
 disabled={!text.trim()}
 className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
 >
 Готово
 </button>
 <button
 type="button"
 onClick={() => {
 setText('')
 setMode('idle')
 }}
 className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink-muted transition-colors hover:bg-sunken"
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
 hint="Enter — следующая · Shift+Enter — строка · Esc — закрыть"
 />

 <DestinationHint>
 {sessionCount > 0
 ? `Выгружено ${sessionCount} — продолжай или нажми «Посмотреть» внизу`
 : destinationHint}
 </DestinationHint>

 <button
 type="button"
 onClick={handleSave}
 disabled={!text.trim()}
 className="rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
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
 closeOverlay()
 }}
 onDiscard={closeOverlay}
 onCancel={() => setShowCollapseDialog(false)}
 />
 )}
 </AnimatePresence>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}
