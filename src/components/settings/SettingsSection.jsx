// One settings block: icon + title + description on the left, controls on the
// right (stacks on mobile). Mirrors the modern settings-list pattern used by
// Stripe/GitHub/Linear dashboards.
export default function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="hm-glass rounded-2xl p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] md:gap-8">
        <div className="flex gap-3">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="m-0 text-[15px] font-semibold text-ink">{title}</h3>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}
