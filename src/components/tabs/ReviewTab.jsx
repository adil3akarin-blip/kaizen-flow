import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useAppStore } from '../../store/useAppStore'
import { useCardsStore } from '../../store/useCardsStore'
import { selectRawCards } from '../../lib/cardSelectors'
import {
 formatRawInboxSubtitle,
 formatSilenceExitLabel,
 REVIEW_VIEWS,
} from '../../lib/reviewUtils'
import SilenceCanvas from '../review/SilenceCanvas'
import ReviewInbox from '../review/ReviewInbox'
import FilterFlow from '../review/FilterFlow'
import ReviewViewToggle from '../review/ReviewViewToggle'
import MissionScreen from '../onboarding/MissionScreen'
import TabPageHeader from '../ui/TabPageHeader'
import PageContainer from '../ui/PageContainer'

export default function ReviewTab() {
 const silenceWeek = useAppStore((s) => s.silenceWeek)
 const missionScreenOpen = useAppStore((s) => s.missionScreenOpen)
 const reviewView = useAppStore((s) => s.reviewView)
 const setReviewView = useAppStore((s) => s.setReviewView)
 const openMissionScreen = useAppStore((s) => s.openMissionScreen)
 const exitSilenceWeek = useAppStore((s) => s.exitSilenceWeek)
 const [filterCardId, setFilterCardId] = useState(null)
 const cards = useCardsStore((s) => s.cards)

 const activeFilterCardId = useMemo(() => {
 if (!filterCardId) return null
 const card = cards.find((c) => c.id === filterCardId)
 if (!card || card.status !== 'raw') return null
 return filterCardId
 }, [filterCardId, cards])

 const rawCount = useMemo(() => selectRawCards(cards).length, [cards])
 const canFilter = !silenceWeek
 const isCanvasView = reviewView === REVIEW_VIEWS.canvas

 const handleReadyToReview = () => {
 setFilterCardId(null)
 openMissionScreen()
 }

 const handleReviewViewChange = (view) => {
 setFilterCardId(null)
 setReviewView(view)
 }

 if (missionScreenOpen) {
 return <MissionScreen onComplete={exitSilenceWeek} />
 }

 if (silenceWeek) {
 return (
 <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
 <header className="flex shrink-0 flex-col gap-3 border-b border-line bg-white/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
 <div className="min-w-0 flex-1">
 <TabPageHeader
 eyebrow="Режим паузы"
 title="Неделя тишины"
 subtitle="Просто выгружай — планирование подождёт"
 />
 </div>
 <div className="flex shrink-0 items-center gap-2 sm:gap-3">
 <ReviewViewToggle
 value={reviewView}
 onChange={handleReviewViewChange}
 />
 <button
 type="button"
 onClick={handleReadyToReview}
 className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
 >
 {formatSilenceExitLabel(rawCount)}
 </button>
 </div>
 </header>

 {isCanvasView ? (
 <SilenceCanvas />
 ) : (
 <ReviewInbox showHeader={false} canFilter={false} />
 )}
 </section>
 )
 }

 return (
 <div
 className={clsx(
 'flex min-h-0 flex-1 flex-col overflow-hidden',
 activeFilterCardId && 'md:grid md:min-h-0 md:grid-cols-2 md:overflow-hidden',
 )}
 >
 <div
 className={clsx(
 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
 activeFilterCardId && 'hidden md:flex',
 )}
 >
 {isCanvasView ? (
 <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
 <div className="shrink-0 py-4 sm:py-6 md:py-8">
 <PageContainer>
 <div className="flex items-start justify-between gap-4">
 <TabPageHeader
 eyebrow="Входящие мысли"
 title="Разбор"
 subtitle={formatRawInboxSubtitle(rawCount)}
 />
 <ReviewViewToggle
 value={reviewView}
 onChange={handleReviewViewChange}
 />
 </div>
 </PageContainer>
 </div>
 <SilenceCanvas
 onFilter={canFilter ? setFilterCardId : undefined}
 />
 </div>
 ) : (
 <ReviewInbox
 activeFilterCardId={activeFilterCardId}
 onFilter={setFilterCardId}
 canFilter={canFilter}
 reviewView={reviewView}
 onReviewViewChange={handleReviewViewChange}
 />
 )}
 </div>

 {activeFilterCardId && (
 <FilterFlow
 key={activeFilterCardId}
 cardId={activeFilterCardId}
 onClose={() => setFilterCardId(null)}
 />
 )}
 </div>
 )
}
