import AppShell from './components/shell/AppShell'
import Toast from './components/Toast'
import usePushSync from './lib/usePushSync'

function PushSyncRoot() {
  usePushSync()
  return null
}

export default function App() {
  return (
    <>
      <PushSyncRoot />
      <AppShell />
      <Toast />
    </>
  )
}
