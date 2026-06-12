// Lightweight CSS bar chart — crisp rounded bars over faint baseline tracks.
export default function MiniBarChart({ data, formatValue, height = 140 }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex items-stretch gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value > 0 ? Math.max(6, (d.value / max) * 100) : 0
        return (
          <div
            key={d.key ?? i}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <div className="relative flex w-full flex-1 items-end justify-center rounded-t-md rounded-b-sm bg-line/25">
              {pct > 0 && (
                <div
                  className={
                    'w-full rounded-t-md rounded-b-sm transition-all ' +
                    (d.highlight
                      ? 'bg-gradient-to-t from-accent to-[#fb923c] shadow-(--shadow-glow)'
                      : 'bg-accent/35 group-hover:bg-accent/55')
                  }
                  style={{ height: `${pct}%` }}
                  title={formatValue ? formatValue(d.value) : String(d.value)}
                />
              )}
            </div>
            <span className="text-[10px] font-medium tabular-nums text-ink-faint">
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
