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
import EnergySnapshot from '../flow/EnergySnapshot'
import EnergyHub from '../flow/EnergyHub'
import PauseScreen from '../flow/PauseScreen'
import WipSlot from '../flow/WipSlot'
import PullQueue from '../flow/PullQueue'
import StuckNudge from '../flow/StuckNudge'

function FlowHint({ rawCount, onGoReview }) {
  if (rawCount === 0) return null

  const label =
    rawCount === 1
      ? '1 мысль ждёт разбора'
      : rawCount < 5
        ? `${rawCount} мысли ждут разбора`
        : `${rawCount} мыслей ждут разбора`

  return (
    <button
      type="button"
      onClick={onGoReview}
      className="text-left text-sm text-warm-muted transition-colors hover:text-warm-text"
    >
      {label} →{' '}
      <span className="text-warm-accent">Разбор</span>
    </button>
  )
}

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
      <div className="shrink-0 border-b border-cream-dark/60 bg-white/40 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
        <TabPageHeader title="Поток" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:grid md:grid-cols-2 md:gap-8 md:overflow-hidden md:px-8 md:py-6">
        <div
          className={clsx(
            'order-1 flex min-h-0 flex-col gap-6 md:col-start-1 md:row-start-1 md:overflow-y-auto md:pr-2',
            gateOpen && 'invisible',
          )}
        >
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

        <div className="order-2 flex min-h-0 flex-col gap-4 md:col-start-2 md:row-start-1 md:overflow-y-auto">
          <EnergySnapshot onOpenHub={() => setShowEnergyHub(true)} />
          {!isFlowEmpty && (
            <FlowHint
              rawCount={rawCards.length}
              onGoReview={() => setTab(TABS.review)}
            />
          )}
          <StuckNudge stuckCards={stuckCards} />
        </div>
      </div>
    </div>
  )
}
