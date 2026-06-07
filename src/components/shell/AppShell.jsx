import { useAppStore, TABS } from '../../store/useAppStore'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import DumpOverlay from './DumpOverlay'
import ManifestScreen from '../onboarding/ManifestScreen'
import SettingsScreen from '../settings/SettingsScreen'
import FlowTab from '../tabs/FlowTab'
import ReviewTab from '../tabs/ReviewTab'
import KanbanTab from '../tabs/KanbanTab'

const TAB_CONTENT = {
  [TABS.flow]: FlowTab,
  [TABS.review]: ReviewTab,
  [TABS.kanban]: KanbanTab,
  [TABS.settings]: SettingsScreen,
}

export default function AppShell() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const activeTab = useAppStore((s) => s.activeTab)
  const Content = TAB_CONTENT[activeTab]

  if (!onboardingComplete) {
    return <ManifestScreen />
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-cream">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[calc(8rem+env(safe-area-inset-bottom))] md:pb-0">
        <Content />
      </main>
      <TabBar />
      <DumpOverlay />
    </div>
  )
}
