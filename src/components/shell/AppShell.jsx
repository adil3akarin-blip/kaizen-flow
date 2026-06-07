import { useAppStore, TABS } from '../../store/useAppStore'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import DumpOverlay from './DumpOverlay'
import ManifestScreen from '../onboarding/ManifestScreen'
import FlowTab from '../tabs/FlowTab'
import ReviewTab from '../tabs/ReviewTab'
import KanbanTab from '../tabs/KanbanTab'

const TAB_CONTENT = {
  [TABS.flow]: FlowTab,
  [TABS.review]: ReviewTab,
  [TABS.kanban]: KanbanTab,
}

export default function AppShell() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const activeTab = useAppStore((s) => s.activeTab)
  const Content = TAB_CONTENT[activeTab]

  if (!onboardingComplete) {
    return <ManifestScreen />
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex flex-1 flex-col pb-32 md:pb-0">
        <Content />
      </main>
      <TabBar />
      <DumpOverlay />
    </div>
  )
}
