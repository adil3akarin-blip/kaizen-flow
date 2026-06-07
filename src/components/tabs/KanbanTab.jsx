import { Kanban } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import TabPageHeader from '../ui/TabPageHeader'

export default function KanbanTab() {
  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <TabPageHeader
        title="Канбан"
        subtitle="Сам вытягиваешь следующее дело"
      />

      <EmptyState
        icon={Kanban}
        title="Канбан появится после разбора"
        description="Сначала разбери мысли во вкладке «Разбор» — потом они попадут в колонки"
      />
    </div>
  )
}
