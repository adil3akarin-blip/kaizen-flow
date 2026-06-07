export default function TabPageHeader({ title, subtitle }) {
  return (
    <header>
      <h2 className="m-0 font-serif text-2xl font-medium tracking-tight text-warm-text">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-sm text-warm-muted">{subtitle}</p>
      )}
    </header>
  )
}
