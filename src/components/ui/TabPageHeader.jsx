export default function TabPageHeader({ title, subtitle }) {
  return (
    <header className="min-w-0">
      <h2 className="m-0 text-xl font-semibold tracking-tight text-warm-text sm:text-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-sm text-warm-muted">{subtitle}</p>
      )}
    </header>
  )
}
