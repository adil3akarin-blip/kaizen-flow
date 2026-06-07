import { useMemo, useState } from 'react'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore } from '../../store/useAppStore'
import StructuredCard from '../cards/StructuredCard'

const STEPS = ['done', 'carry', 'elephant']

export default function ElephantsFlow({ onClose, onOpenYear }) {
  const cards = useCardsStore((s) => s.cards)
  const removeCard = useCardsStore((s) => s.removeCard)
  const moveKanbanCard = useCardsStore((s) => s.moveKanbanCard)
  const setElephantsPending = useAppStore((s) => s.setElephantsPending)

  const [stepIndex, setStepIndex] = useState(0)
  const [selectedCarry, setSelectedCarry] = useState(() => new Set())
  const [elephantChoice, setElephantChoice] = useState('')

  const doneCards = useMemo(
    () => cards.filter((c) => c.status === 'done'),
    [cards],
  )

  const carryCards = useMemo(
    () =>
      cards.filter(
        (c) =>
          c.status === 'filtered' &&
          c.kanbanColumn !== 'done' &&
          c.kanbanColumn !== 'progress',
      ),
    [cards],
  )

  const step = STEPS[stepIndex]

  const toggleCarry = (id) => {
    setSelectedCarry((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const finish = () => {
    carryCards.forEach((card) => {
      if (!selectedCarry.has(card.id)) {
        moveKanbanCard(card.id, 'next_week')
      }
    })
    setElephantsPending(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      <header className="border-b border-cream-dark/60 bg-white/40 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-warm-muted hover:text-warm-text"
        >
          Позже
        </button>
        <h2 className="m-0 mt-2 font-serif text-xl font-medium text-warm-text">
          Ретроспектива «Слонов»
        </h2>
        <p className="mt-1 text-sm text-warm-muted">
          Шаг {stepIndex + 1} из {STEPS.length}
        </p>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        {step === 'done' && (
          <>
            <p className="m-0 font-serif text-base text-warm-text">
              Сделано за месяц
            </p>
            <p className="mt-1 text-sm text-warm-muted">
              Не KPI — просто вспомнить, что уже двигается
            </p>
            <ul className="mt-4 flex list-none flex-col gap-2 p-0">
              {doneCards.length > 0 ? (
                doneCards.map((card) => (
                  <li key={card.id}>
                    <StructuredCard card={card} compact />
                  </li>
                ))
              ) : (
                <li className="text-sm text-warm-muted">
                  Пока нет завершённых дел в этом месяце
                </li>
              )}
            </ul>
          </>
        )}

        {step === 'carry' && (
          <>
            <p className="m-0 font-serif text-base text-warm-text">
              Что переносим на следующий месяц?
            </p>
            <p className="mt-1 text-sm text-warm-muted">
              Снятые галочки — мягкий перенос; «Отпустить» удалит карточку
            </p>
            <ul className="mt-4 flex list-none flex-col gap-2 p-0">
              {carryCards.map((card) => (
                <li
                  key={card.id}
                  className="flex items-start gap-3 rounded-xl border border-cream-dark/50 bg-white p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedCarry.has(card.id)}
                    onChange={() => toggleCarry(card.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-sm text-warm-text">{card.text}</p>
                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      className="mt-2 text-xs text-warm-muted hover:text-warm-text"
                    >
                      Отпустить
                    </button>
                  </div>
                </li>
              ))}
              {carryCards.length === 0 && (
                <li className="text-sm text-warm-muted">
                  Незавершённых дел нет — отлично
                </li>
              )}
            </ul>
          </>
        )}

        {step === 'elephant' && (
          <>
            <p className="m-0 font-serif text-base text-warm-text">
              Слон месяца
            </p>
            <p className="mt-1 text-sm text-warm-muted">
              Одно главное достижение — для годовой доски
            </p>
            <textarea
              value={elephantChoice}
              onChange={(e) => setElephantChoice(e.target.value)}
              placeholder="Что было самым значимым?"
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-cream-dark bg-white px-4 py-3 text-[15px] text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
            />
            <button
              type="button"
              onClick={onOpenYear}
              className="mt-3 text-sm text-warm-accent hover:underline"
            >
              Открыть годовую доску
            </button>
          </>
        )}
      </div>

      <footer className="border-t border-cream-dark/60 px-6 py-4">
        {stepIndex < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 'done') {
                setSelectedCarry(new Set(carryCards.map((c) => c.id)))
              }
              setStepIndex((i) => i + 1)
            }}
            className="w-full rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
          >
            Далее
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-lg bg-warm-accent py-3 text-sm font-medium text-white hover:bg-warm-accent-hover"
          >
            Завершить
          </button>
        )}
      </footer>
    </div>
  )
}
