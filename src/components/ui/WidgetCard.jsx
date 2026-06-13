import clsx from 'clsx'

// A dashboard widget: glass card with a consistent header (icon + title +
// optional trailing meta/action) and a body. Inspired by modular life-tracker
// dashboards where every module reads as a self-contained card.
export default function WidgetCard({
  icon: Icon,
  title,
  meta,
  action,
  children,
  className,
  bodyClassName,
}) {
  return (
    <section className={clsx('hm-glass flex flex-col rounded-3xl p-5', className)}>
      {(title || Icon || meta != null || action) && (
        <header className="mb-4 flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          )}
          {title && (
            <h3 className="m-0 truncate text-sm font-semibold text-ink">{title}</h3>
          )}
          {meta != null && (
            <span className="ml-auto shrink-0 rounded-full bg-sunken px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink-muted">
              {meta}
            </span>
          )}
          {action && <span className={clsx(meta == null && 'ml-auto')}>{action}</span>}
        </header>
      )}
      <div className={clsx('min-h-0', bodyClassName)}>{children}</div>
    </section>
  )
}
