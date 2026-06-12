export default function TabPageHeader({ title, subtitle, eyebrow }) {
  return (
    <header className="min-w-0">
      {eyebrow && <p className="hm-eyebrow mb-2.5">{eyebrow}</p>}
      <h2 className="hm-title m-0 text-[30px]">{title}</h2>
      {subtitle && (
        <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-ink-muted">
          {subtitle}
        </p>
      )}
    </header>
  )
}
