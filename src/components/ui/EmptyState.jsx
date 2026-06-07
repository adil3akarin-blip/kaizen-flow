export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="mt-8 flex flex-1 flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-cream-dark/50 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        {Icon && (
          <Icon
            className="mb-4 h-8 w-8 text-warm-accent/45"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
        <p className="m-0 text-center font-serif text-base font-medium text-warm-text">
          {title}
        </p>
        {description && (
          <p className="mt-2 text-center text-sm leading-relaxed text-warm-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
