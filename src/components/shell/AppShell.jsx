import { useAppStore, TABS } from '../../store/useAppStore'
import TabBar from './TabBar'
import Sidebar from './Sidebar'
import DumpOverlay from './DumpOverlay'
import ManifestScreen from '../onboarding/ManifestScreen'
import PwaInstallPrompt from '../pwa/PwaInstallPrompt'
import PwaInstallSheet from '../pwa/PwaInstallSheet'
import SettingsScreen from '../settings/SettingsScreen'
import TodayTab from '../tabs/TodayTab'
import ReviewTab from '../tabs/ReviewTab'
import KanbanTab from '../tabs/KanbanTab'
import ProgressTab from '../tabs/ProgressTab'

const TAB_CONTENT = {
 [TABS.today]: TodayTab,
 [TABS.review]: ReviewTab,
 [TABS.kanban]: KanbanTab,
 [TABS.progress]: ProgressTab,
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
 <div className="flex h-dvh min-h-0 overflow-hidden">
 <Sidebar />
 <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-(--spacing-mobile-chrome-bottom) md:pb-0">
 <Content />
 </main>
 <TabBar />
 <DumpOverlay />
 <PwaInstallPrompt />
 <PwaInstallSheet />
 </div>
 )
}
