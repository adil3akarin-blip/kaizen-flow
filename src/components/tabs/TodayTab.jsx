import { useCallback, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import { selectRawCards, selectWipCard } from '../../lib/cardSelectors'
import { selectOrderedPullQueue } from '../../lib/kanbanOrderUtils'
import {
  FLOW_EMPTY_ACTIONS,
  resolveFlowEmptyCta,
  selectNextWeekCount,
} from '../../lib/flowEmptyState'
import { selectStuckCards } from '../../lib/stuckDetector'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import FlowStatusPanel from '../flow/FlowStatusPanel'
import WipSlot from '../flow/WipSlot'
import PullQueue from '../flow/PullQueue'
import TodayHabits from '../today/TodayHabits'
import DailySummary from '../today/DailySummary'

export default function TodayTab() {
  const [queueOverlayOpen, setQueueOverlayOpen] = useState(false)

  const cards = useCardsStore((s) => s.cards)
  const columnOrder = useCardsStore((s) => s.columnOrder)
  const pullToWip = useCardsStore((s) => s.pullToWip)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)

  const wipCard = useMemo(() => selectWipCard(cards), [cards])
  const pullQueue = useMemo(
    () => selectOrderedPullQueue(cards, columnOrder),
    [cards, columnOrder],
  )
  const rawCards = useMemo(() => selectRawCards(cards), [cards])
  const stuckCards = useMemo(() => selectStuckCards(cards), [cards])
  const nextWeekCount = useMemo(() => selectNextWeekCount(cards), [cards])

  const suggestedCard = !wipCard && pullQueue.length > 0 ? pullQueue[0] : null
  const isFlowEmpty = !wipCard && pullQueue.length === 0

  const handleEmptyAction = useCallback(
    (action) => {
      if (action === FLOW_EMPTY_ACTIONS.review) {
        setTab(TABS.review)
        return
      }
      if (action === FLOW_EMPTY_ACTIONS.kanban) {
        setTab(TABS.kanban)
        return
      }
      openDump()
    },
    [setTab, openDump],
  )

  const emptyCta = useMemo(() => {
    if (!isFlowEmpty) return null
    const resolved = resolveFlowEmptyCta({
      rawCount: rawCards.length,
      nextWeekCount,
    })
    return {
      ...resolved,
      onAction: () => handleEmptyAction(resolved.action),
    }
  }, [isFlowEmpty, rawCards.length, nextWeekCount, handleEmptyAction])

  const handlePullSuggested = (id) => {
    pullToWip(id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6 md:overflow-hidden md:py-8">
        <PageContainer className="md:flex md:h-full md:min-h-0 md:flex-col">
          <div className="mx-auto flex w-full max-w-[600px] flex-col md:min-h-0 md:flex-1">
            <TabPageHeader eyebrow="Фокус сейчас" title="Сегодня" />

            <div className="mt-5">
              <DailySummary />
            </div>

            <div
              className={clsx(
                'mt-5 flex flex-col gap-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1',
                queueOverlayOpen && 'invisible',
              )}
            >
              <FlowStatusPanel
                rawCount={rawCards.length}
                onGoReview={() => setTab(TABS.review)}
                stuckCards={stuckCards}
                showHints={!isFlowEmpty}
              />
              <WipSlot
                suggestedCard={suggestedCard}
                emptyCta={emptyCta}
                onPullSuggested={handlePullSuggested}
              />
              <PullQueue
                excludeCardId={suggestedCard?.id}
                onGateOpenChange={setQueueOverlayOpen}
              />
              <TodayHabits />
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
