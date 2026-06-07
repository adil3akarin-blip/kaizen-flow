import { useState } from 'react'
import clsx from 'clsx'
import { useAppStore } from '../../store/useAppStore'
import SilenceCanvas from '../review/SilenceCanvas'
import ReviewInbox from '../review/ReviewInbox'
import FilterFlow from '../review/FilterFlow'
import MissionScreen from '../onboarding/MissionScreen'

export default function ReviewTab() {
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const missionScreenOpen = useAppStore((s) => s.missionScreenOpen)
  const openMissionScreen = useAppStore((s) => s.openMissionScreen)
  const exitSilenceWeek = useAppStore((s) => s.exitSilenceWeek)
  const [filterCardId, setFilterCardId] = useState(null)

  if (missionScreenOpen) {
    return <MissionScreen onComplete={exitSilenceWeek} />
  }

  if (silenceWeek) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-col gap-3 border-b border-cream-dark bg-white/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <div className="min-w-0">
            <h2 className="m-0 font-serif text-lg font-medium tracking-tight text-warm-text sm:text-xl">
              Неделя тишины
            </h2>
            <p className="mt-1 text-sm text-warm-muted">
              Просто выгружай — планирование подождёт
            </p>
          </div>
          <button
            type="button"
            onClick={openMissionScreen}
            className="w-full shrink-0 rounded-lg border border-cream-dark bg-white px-4 py-2 text-sm text-warm-muted shadow-sm transition-colors hover:bg-cream-dark hover:text-warm-text sm:w-auto"
          >
            Готов разбирать
          </button>
        </header>

        <SilenceCanvas />
      </section>
    )
  }

  return (
    <div
      className={clsx(
        'flex min-h-0 flex-1 flex-col overflow-hidden',
        filterCardId && 'md:grid md:min-h-0 md:grid-cols-2 md:overflow-hidden',
      )}
    >
      <div
        className={clsx(
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          filterCardId && 'hidden md:flex',
        )}
      >
        <ReviewInbox onFilter={setFilterCardId} />
      </div>

      {filterCardId && (
        <FilterFlow
          cardId={filterCardId}
          onClose={() => setFilterCardId(null)}
        />
      )}
    </div>
  )
}
