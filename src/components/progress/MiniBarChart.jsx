// Lightweight SVG bar chart — no external chart library.
export default function MiniBarChart({ data, formatValue, height = 120 }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barGap = 6
  const count = data.length || 1
  const viewW = 320
  const viewH = height
  const labelH = 18
  const chartH = viewH - labelH
  const barW = (viewW - barGap * (count - 1)) / count

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      role="img"
      preserveAspectRatio="none"
    >
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max(3, (d.value / max) * (chartH - 6)) : 0
        const x = i * (barW + barGap)
        const y = chartH - h
        return (
          <g key={d.key ?? i}>
            {h > 0 && (
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={d.highlight ? 'var(--color-accent)' : 'var(--color-accent-soft)'}
              >
                <title>{formatValue ? formatValue(d.value) : d.value}</title>
              </rect>
            )}
            <text
              x={x + barW / 2}
              y={viewH - 5}
              textAnchor="middle"
              className="fill-ink-faint"
              style={{ fontSize: '9px' }}
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
