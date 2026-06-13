export default function SettingsGroup({ title, description, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-1 text-sm text-ink-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
