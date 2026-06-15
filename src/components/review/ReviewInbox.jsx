import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { MoreHorizontal, Trash2, Inbox } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import { formatRawInboxSubtitle } from '../../lib/reviewUtils'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import EmptyState from '../ui/EmptyState'
import ReviewViewToggle from './ReviewViewToggle'

function InboxRow({ card, isEditing, isLast, isFirst, canFilter, onStartEdit, onSaveEdit, onFilter, onDelete }) {
  const openMenuUp = isLast && !isFirst
  const [draft, setDraft] = useState(card.text)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSave = () => {
    if (onSaveEdit(draft)) onStartEdit(null)
  }

  if (isEditing) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-(--shadow-card)">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          autoFocus
          className="w-full resize-none rounded-xl border border-line bg-canvas px-3 py-2 text-[15px] leading-relaxed text-ink outline-none focus:ring-2 focus:ring-accent/30"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => { setDraft(card.text); onStartEdit(null) }}
            className="rounded-xl border border-line px-4 py-2 text-sm text-ink-muted hover:bg-sunken transition"
          >
            Отмена
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'group relative flex rounded-2xl border border-line/60 bg-surface shadow-(--shadow-card)',
        menuOpen ? 'z-20' : 'overflow-hidden',
      )}
    >
      <div
        className="w-1 shrink-0 rounded-l-2xl"
        style={{ backgroundColor: card.color?.bg ?? 'transparent' }}
      />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={() => { setDraft(card.text); onStartEdit(card.id) }}
          className="min-w-0 flex-1 text-left"
        >
          <p className="m-0 text-sm leading-snug text-ink line-clamp-2">{card.text}</p>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {canFilter && (
            <button
              type="button"
              onClick={() => onFilter(card.id)}
              className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
            >
              Разобрать
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Ещё"
              aria-expanded={menuOpen}
              className="-mr-1 flex h-11 w-11 items-center justify-center rounded-lg text-ink-faint hover:bg-sunken hover:text-ink-muted transition"
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Закрыть меню"
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className={clsx(
                    'absolute right-0 z-30 min-w-[140px] rounded-xl border border-line bg-surface py-1 shadow-(--shadow-float)',
                    openMenuUp ? 'bottom-full mb-1' : 'top-full mt-1',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(card.id) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-sunken transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReviewInbox({
  activeFilterCardId,
  onFilter,
  canFilter = true,
  showHeader = true,
  reviewView,
  onReviewViewChange,
}) {
  const openDump = useAppStore((s) => s.openDump)
  const cards = useCardsStore((s) => s.cards)
  const updateCardText = useCardsStore((s) => s.updateCardText)
  const removeCard = useCardsStore((s) => s.removeCard)
  const [editingId, setEditingId] = useState(null)

  const rawCards = useMemo(
    () => [...selectRawCards(cards)].sort((a, b) => b.createdAt - a.createdAt),
    [cards],
  )

  const activeEditingId = rawCards.some((c) => c.id === editingId) ? editingId : null

  const handleDelete = (id) => {
    removeCard(id)
    if (editingId === id) setEditingId(null)
    if (activeFilterCardId === id) onFilter?.(null)
  }

  const header = showHeader && (
    <div className="flex items-start justify-between gap-4">
      <TabPageHeader
        eyebrow="Входящие мысли"
        title="Разбор"
        subtitle={formatRawInboxSubtitle(rawCards.length)}
      />
      {onReviewViewChange && reviewView && (
        <ReviewViewToggle value={reviewView} onChange={onReviewViewChange} />
      )}
    </div>
  )

  if (rawCards.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto py-6 md:py-8">
        <PageContainer>
          {header ?? (
            <TabPageHeader
              eyebrow="Входящие мысли"
              title="Разбор"
              subtitle={formatRawInboxSubtitle(0)}
            />
          )}
          <div className="mt-8">
            <EmptyState
              icon={Inbox}
              title="Пока нет карточек для разбора"
              description="Выгрузи мысль — она появится здесь"
              action={{ label: 'Выгрузить мысль', onClick: openDump }}
            />
          </div>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto pt-4 pb-24 sm:pt-6 md:pt-8 md:pb-8">
        <PageContainer>
          {header}
          <div className="mt-6 flex flex-col gap-2">
            {rawCards.map((card, index) => (
              <InboxRow
                key={card.id}
                card={card}
                isEditing={activeEditingId === card.id}
                isLast={index === rawCards.length - 1}
                isFirst={index === 0}
                canFilter={canFilter}
                onStartEdit={setEditingId}
                onSaveEdit={(text) => updateCardText(card.id, text)}
                onFilter={onFilter}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
