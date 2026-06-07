import { useMemo, useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import TabPageHeader from '../ui/TabPageHeader'
import EmptyState from '../ui/EmptyState'
import { Inbox } from 'lucide-react'

function InboxCard({ card, isEditing, onStartEdit, onSaveEdit, onFilter, onDelete }) {
  const [draft, setDraft] = useState(card.text)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSave = () => {
    if (onSaveEdit(draft)) {
      onStartEdit(null)
    }
  }

  return (
    <div
      className={clsx(
        'rounded-xl border bg-white shadow-sm transition-colors',
        isEditing
          ? 'border-warm-accent/40 ring-2 ring-warm-accent/20'
          : 'border-cream-dark/50',
      )}
    >
      {isEditing ? (
        <div className="p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-lg border border-cream-dark bg-cream/30 px-3 py-2 text-[15px] leading-relaxed text-warm-text outline-none focus:ring-2 focus:ring-warm-accent/30"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-warm-accent px-4 py-2 text-sm font-medium text-white hover:bg-warm-accent-hover"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(card.text)
                onStartEdit(null)
              }}
              className="rounded-lg border border-cream-dark px-4 py-2 text-sm text-warm-muted hover:bg-cream-dark"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={() => {
              setDraft(card.text)
              onStartEdit(card.id)
            }}
            className="min-w-0 flex-1 text-left"
          >
            <p className="m-0 break-words text-[15px] leading-snug text-warm-text">
              {card.text}
            </p>
          </button>

          <div className="relative flex shrink-0 flex-row items-center justify-end gap-2 sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={() => onFilter(card.id)}
              className="rounded-lg bg-warm-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-warm-accent-hover"
            >
              Разобрать
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Ещё"
              className="rounded-lg p-1.5 text-warm-muted hover:bg-cream-dark"
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Закрыть меню"
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-cream-dark bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(card.id)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-warm-muted hover:bg-cream"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReviewInbox({ onFilter }) {
  const cards = useCardsStore((s) => s.cards)
  const updateCardText = useCardsStore((s) => s.updateCardText)
  const removeCard = useCardsStore((s) => s.removeCard)
  const [editingId, setEditingId] = useState(null)

  const rawCards = useMemo(
    () =>
      [...selectRawCards(cards)].sort((a, b) => b.createdAt - a.createdAt),
    [cards],
  )

  if (rawCards.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-6 md:px-8">
        <TabPageHeader
          title="Разбор"
          subtitle="Фильтруй мысли, когда будешь готов"
        />
        <EmptyState
          icon={Inbox}
          title="Пока нет карточек для разбора"
          description="Выгрузи мысль — она появится здесь"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-cream-dark/60 bg-white/40 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
        <TabPageHeader
          title="Разбор"
          subtitle={`${rawCards.length} ${rawCards.length === 1 ? 'мысль' : rawCards.length < 5 ? 'мысли' : 'мыслей'} ждут разбора`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 md:px-8">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {rawCards.map((card) => (
            <li key={card.id}>
              <InboxCard
                card={card}
                isEditing={editingId === card.id}
                onStartEdit={setEditingId}
                onSaveEdit={(text) => updateCardText(card.id, text)}
                onFilter={onFilter}
                onDelete={removeCard}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
