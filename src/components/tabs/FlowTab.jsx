import { useCallback, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useCardsStore } from '../../store/useCardsStore'
import { useEnergyStore } from '../../store/useEnergyStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import {
  selectPullQueue,
  selectRawCards,
  selectWipCard,
} from '../../lib/cardSelectors'
import {
  FLOW_EMPTY_ACTIONS,
  resolveFlowEmptyCta,
  selectNextWeekCount,
} from '../../lib/flowEmptyState'
import { selectStuckCards } from '../../lib/stuckDetector'
import { shouldShowPauseScreen } from '../../lib/willpowerGuard'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'
import EnergyHub from '../flow/EnergyHub'
import FlowStatusPanel from '../flow/FlowStatusPanel'
import PauseScreen from '../flow/PauseScreen'
import WipSlot from '../flow/WipSlot'
import PullQueue from '../flow/PullQueue'

export default function FlowTab() {
  const [gateOpen, setGateOpen] = useState(false)
  const [showEnergyHub, setShowEnergyHub] = useState(false)

  const cards = useCardsStore((s) => s.cards)
  const pullToWip = useCardsStore((s) => s.pullToWip)
  const setTab = useAppStore((s) => s.setTab)
  const openDump = useAppStore((s) => s.openDump)

  const heavyCompletions = useEnergyStore((s) => s.heavyCompletions)
  const pauseDismissed = useEnergyStore((s) => s.pauseDismissed)
  const dismissPause = useEnergyStore((s) => s.dismissPause)

  const wipCard = useMemo(() => selectWipCard(cards), [cards])
  const pullQueue = useMemo(() => selectPullQueue(cards), [cards])
  const rawCards = useMemo(() => selectRawCards(cards), [cards])
  const stuckCards = useMemo(() => selectStuckCards(cards), [cards])
  const nextWeekCount = useMemo(() => selectNextWeekCount(cards), [cards])

  const showPause = shouldShowPauseScreen(heavyCompletions, pauseDismissed)

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

  if (showEnergyHub) {
    return <EnergyHub onBack={() => setShowEnergyHub(false)} />
  }

  if (showPause) {
    return (
      <PauseScreen
        onOpenHub={() => {
          dismissPause()
          setShowEnergyHub(true)
        }}
        onContinue={dismissPause}
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6 md:overflow-hidden md:py-8">
        <PageContainer className="md:flex md:h-full md:min-h-0 md:flex-col">
          <TabPageHeader title="Поток" />

          <div
            className={clsx(
              'mt-6 flex flex-col gap-6 md:min-h-0 md:flex-1 md:grid md:grid-cols-[1fr_minmax(200px,260px)] md:gap-8 md:overflow-hidden',
              gateOpen && 'invisible',
            )}
          >
            <div className="order-1 flex flex-col gap-6 md:col-start-1 md:min-h-0 md:overflow-y-auto md:pr-1">
              <WipSlot
                suggestedCard={suggestedCard}
                emptyCta={emptyCta}
                onPullSuggested={handlePullSuggested}
                onGuardOpenChange={(open) => setGateOpen(open)}
              />
              <PullQueue
                excludeCardId={suggestedCard?.id}
                onGateOpenChange={setGateOpen}
              />
            </div>

            <div className="order-2 flex flex-col md:col-start-2 md:min-h-0 md:overflow-y-auto">
              <FlowStatusPanel
                onOpenHub={() => setShowEnergyHub(true)}
                rawCount={rawCards.length}
                onGoReview={() => setTab(TABS.review)}
                stuckCards={stuckCards}
                showHints={!isFlowEmpty}
              />
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
