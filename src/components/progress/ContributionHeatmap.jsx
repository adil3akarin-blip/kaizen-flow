import clsx from 'clsx'

const WEEKDAY_ROWS = ['Пн', '', 'Ср', '', 'Пт', '', '']

// GitHub-style year contribution grid: month labels on top, weekday labels on
// the left, one rounded cell per day. `cellFor(cell)` returns the styling for a
// given day so the same grid renders both habit (binary) and timer (intensity)
// data. Scrolls horizontally when the viewport is too narrow.
export default function ContributionHeatmap({
  columns,
  monthLabels,
  cellFor,
  legend,
  minWidth = 520,
}) {
  const weeks = columns.length
  const colsStyle = { gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div style={{ minWidth }}>
        {monthLabels && (
          <div className="mb-1 flex gap-1.5">
            <div className="w-6 shrink-0" />
            <div className="grid flex-1 gap-[3px]" style={colsStyle}>
              {monthLabels.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  style={{ gridColumnStart: col + 1 }}
                  className="whitespace-nowrap text-[10px] leading-none text-ink-faint"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1.5">
          <div
            className="grid w-6 shrink-0 gap-[3px]"
            style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
          >
            {WEEKDAY_ROWS.map((l, i) => (
              <span
                key={i}
                className="flex items-center text-[9px] leading-none text-ink-faint"
              >
                {l}
              </span>
            ))}
          </div>

          <div
            className="grid flex-1 gap-[3px]"
            style={{
              ...colsStyle,
              gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
              gridAutoFlow: 'column',
            }}
          >
            {columns.flatMap((col) =>
              col.map((cell) => {
                const c = cellFor(cell)
                return (
                  <span
                    key={cell.key}
                    title={c.title}
                    style={c.style}
                    className={clsx('aspect-square w-full rounded-[3px]', c.className)}
                  />
                )
              }),
            )}
          </div>
        </div>

        {legend && (
          <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] text-ink-faint">
            {legend}
          </div>
        )}
      </div>
    </div>
  )
}
