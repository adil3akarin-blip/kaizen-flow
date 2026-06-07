import DumpPanel from './components/DumpPanel'
import Canvas from './components/Canvas'
import UndoToast from './components/UndoToast'

export default function App() {
  return (
    <div className="flex h-full min-h-screen">
      <DumpPanel />
      <Canvas />
      <UndoToast />
    </div>
  )
}
