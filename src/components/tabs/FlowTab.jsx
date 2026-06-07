import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { CircleDot } from 'lucide-react'
import { useCardsStore } from '../../store/useCardsStore'
import { useEnergyStore } from '../../store/useEnergyStore'
import { useAppStore, TABS } from '../../store/useAppStore'
import {
  selectPullQueue,
  selectRawCards,
  selectWipCard,
} from '../../lib/cardSelectors'
import { selectStuckCards } from '../../lib/stuckDetector'
import { shouldShowPauseScreen } from '../../lib/willpowerGuard'
import TabPageHeader from '../ui/TabPageHeader'
import EmptyState from '../ui/EmptyState'
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
      className="rounded-xl border border-cream-dark/50 bg-white px-4 py-3 text-left text-sm text-warm-muted shadow-sm transition-colors hover:bg-cream/50"
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
  const openSettings = useAppStore((s) => s.openSettings)

  const heavyCompletions = useEnergyStore((s) => s.heavyCompletions)
  const pauseDismissed = useEnergyStore((s) => s.pauseDismissed)
  const dismissPause = useEnergyStore((s) => s.dismissPause)

  const wipCard = useMemo(() => selectWipCard(cards), [cards])
  const pullQueue = useMemo(() => selectPullQueue(cards), [cards])
  const rawCards = useMemo(() => selectRawCards(cards), [cards])
  const stuckCards = useMemo(() => selectStuckCards(cards), [cards])

  const showPause = shouldShowPauseScreen(heavyCompletions, pauseDismissed)

  const suggestedCard = !wipCard && pullQueue.length > 0 ? pullQueue[0] : null
  const isFlowEmpty = !wipCard && pullQueue.length === 0

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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-cream-dark/60 bg-white/40 px-6 py-5">
        <TabPageHeader
          title="Поток"
          subtitle="Одно дело в единицу времени"
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 md:grid md:grid-cols-2 md:gap-8 md:overflow-hidden">
        <div
          className={clsx(
            'flex flex-col gap-6 md:overflow-y-auto md:pr-2',
            gateOpen && 'invisible',
          )}
        >
          <WipSlot
            suggestedCard={suggestedCard}
            onPullSuggested={handlePullSuggested}
            onGuardOpenChange={(open) => setGateOpen(open)}
          />
          <PullQueue
            highlighted={!wipCard && pullQueue.length > 0}
            onGateOpenChange={setGateOpen}
          />
        </div>

        <div className="flex flex-col gap-4 md:overflow-y-auto">
          <EnergySnapshot onOpenHub={() => setShowEnergyHub(true)} />
          <FlowHint
            rawCount={rawCards.length}
            onGoReview={() => setTab(TABS.review)}
          />
          <StuckNudge stuckCards={stuckCards} />
          <button
            type="button"
            onClick={openSettings}
            className="text-left text-xs text-warm-muted hover:text-warm-text md:hidden"
          >
            Настройки уведомлений →
          </button>
        </div>
      </div>

      {isFlowEmpty && (
        <div className="px-6 pb-8">
          <EmptyState
            icon={CircleDot}
            title="Поток свободен"
            description={
              rawCards.length > 0
                ? 'Сначала разбери мысли — потом они попадут сюда'
                : 'Выгрузи мысли через + внизу, затем разбери во вкладке «Разбор»'
            }
          />
        </div>
      )}
    </div>
  )
}
