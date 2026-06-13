export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center py-12 px-4 text-center">
      {Icon && (
        <div className="hm-orb mb-4 flex h-16 w-16 items-center justify-center rounded-[22px]">
          <Icon className="h-7 w-7 text-accent" strokeWidth={1.6} aria-hidden />
        </div>
      )}
      <p className="m-0 text-lg font-bold tracking-tight text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="hm-grad mt-5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-glow) transition-transform hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
