import { Inbox } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import SilenceCanvas from '../review/SilenceCanvas'
import MissionScreen from '../onboarding/MissionScreen'
import EmptyState from '../ui/EmptyState'
import TabPageHeader from '../ui/TabPageHeader'

function ReviewInboxPlaceholder() {
  return (
    <div className="flex flex-1 flex-col px-6 py-8">
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

export default function ReviewTab() {
  const silenceWeek = useAppStore((s) => s.silenceWeek)
  const missionScreenOpen = useAppStore((s) => s.missionScreenOpen)
  const openMissionScreen = useAppStore((s) => s.openMissionScreen)
  const exitSilenceWeek = useAppStore((s) => s.exitSilenceWeek)

  if (missionScreenOpen) {
    return <MissionScreen onComplete={exitSilenceWeek} />
  }

  if (silenceWeek) {
    return (
      <section className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-cream-dark bg-white/40 px-6 py-4 md:px-8">
          <div>
            <h2 className="m-0 font-serif text-xl font-medium tracking-tight text-warm-text">
              Неделя тишины
            </h2>
            <p className="mt-1 text-sm text-warm-muted">
              Просто выгружай — планирование подождёт
            </p>
          </div>
          <button
            type="button"
            onClick={openMissionScreen}
            className="shrink-0 rounded-lg border border-cream-dark bg-white px-4 py-2 text-sm text-warm-muted shadow-sm transition-colors hover:bg-cream-dark hover:text-warm-text"
          >
            Готов разбирать
          </button>
        </header>

        <SilenceCanvas />
      </section>
    )
  }

  return <ReviewInboxPlaceholder />
}
