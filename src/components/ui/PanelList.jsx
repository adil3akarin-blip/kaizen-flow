import clsx from 'clsx'

export function PanelList({ children, className, clip = true }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-cream-dark/50 bg-white shadow-sm',
        clip ? 'overflow-hidden' : 'overflow-visible',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PanelRow({ children, className, onClick, isLast = false }) {
  const interactive = Boolean(onClick)

  return (
    <>
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
        className={clsx(
          'flex items-start gap-3 px-4 py-3.5',
          interactive && 'cursor-pointer transition-colors hover:bg-cream/40',
          className,
        )}
      >
        {children}
      </div>
      {!isLast && <div className="mx-4 border-b border-cream-dark/60" />}
    </>
  )
}

export function PanelSection({ children, className }) {
  return (
    <div className={clsx('px-4 py-3.5', className)}>
      {children}
    </div>
  )
}

export function PanelDivider() {
  return <div className="border-b border-cream-dark/60" />
}
