export default function TabPageHeader({ title, subtitle }) {
  return (
    <header className="min-w-0">
      <h2 className="m-0 text-[22px] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      )}
    </header>
  )
}
