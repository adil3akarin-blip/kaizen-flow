import { CircleDot } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import TabPageHeader from '../ui/TabPageHeader'

export default function FlowTab() {
  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <TabPageHeader
        title="Поток"
        subtitle="Одно дело в единицу времени"
      />

      <EmptyState
        icon={CircleDot}
        title="Поток свободен"
        description="Выгрузи мысли через + внизу, затем разбери их во вкладке «Разбор»"
      />
    </div>
  )
}
