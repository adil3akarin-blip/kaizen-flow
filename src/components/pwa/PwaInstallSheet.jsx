import { Smartphone } from 'lucide-react'
import Sheet from '../ui/Sheet'
import { INSTALL_STEPS } from '../../lib/pwaInstall'
import { usePwaInstallStore } from '../../store/usePwaInstallStore'

function PlatformSteps({ steps }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {steps.map((text, i) => (
        <li key={text} className="flex gap-3 text-sm leading-relaxed text-ink">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
            {i + 1}
          </span>
          <span className="pt-0.5">{text}</span>
        </li>
      ))}
    </ol>
  )
}

function InstallGuideSection({ title, steps }) {
  return (
    <section>
      <h4 className="m-0 text-sm font-semibold text-ink">{title}</h4>
      <div className="mt-3">
        <PlatformSteps steps={steps} />
      </div>
    </section>
  )
}

export default function PwaInstallSheet() {
  const sheetOpen = usePwaInstallStore((s) => s.sheetOpen)
  const closeSheet = usePwaInstallStore((s) => s.closeSheet)
  const canNativeInstall = usePwaInstallStore((s) => s.canNativeInstall)
  const handleNativeInstall = usePwaInstallStore((s) => s.handleNativeInstall)

  return (
    <Sheet
      open={sheetOpen}
      onClose={closeSheet}
      title="Установка на телефон"
      subtitle="iPhone и Android"
      icon={Smartphone}
    >
      <p className="m-0 mb-5 text-sm leading-relaxed text-ink-muted">
        После установки KaizenFlow открывается как отдельное приложение — быстрее
        и удобнее для ежедневного потока.
      </p>

      <div className="flex flex-col gap-6">
        <InstallGuideSection title="iPhone / iPad" steps={INSTALL_STEPS.ios} />
        <div className="h-px bg-line/60" aria-hidden="true" />
        <InstallGuideSection title="Android" steps={INSTALL_STEPS.android} />
      </div>

      {canNativeInstall && (
        <button
          type="button"
          onClick={() => {
            closeSheet()
            handleNativeInstall()
          }}
          className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Установить сейчас
        </button>
      )}
    </Sheet>
  )
}
