export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken">
          <Icon className="h-6 w-6 text-ink-faint" strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <p className="m-0 text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
