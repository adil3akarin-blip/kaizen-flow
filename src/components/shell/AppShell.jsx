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
}

export default function AppShell() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const activeTab = useAppStore((s) => s.activeTab)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const closeSettings = useAppStore((s) => s.closeSettings)
  const Content = TAB_CONTENT[activeTab]

  if (!onboardingComplete) {
    return <ManifestScreen />
  }

  if (settingsOpen) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex flex-1 flex-col pb-32 md:pb-0">
          <SettingsScreen onBack={closeSettings} />
        </main>
        <TabBar />
        <DumpOverlay />
      </div>
    )
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
