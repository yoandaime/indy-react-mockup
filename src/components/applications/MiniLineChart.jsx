const WIDTH = 760
const HEIGHT = 220
const PADDING_LEFT = 40
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 28
const GRID_VALUES = [0, 25, 50, 75, 100]

export default function MiniLineChart({ data, labels }) {
  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const lastIndex = Math.max(1, data.length - 1)

  const points = data.map((value, i) => ({
    x: PADDING_LEFT + (plotWidth * i) / lastIndex,
    y: PADDING_TOP + plotHeight * (1 - value / 100),
  }))
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: HEIGHT }}
    >
      {GRID_VALUES.map((v) => {
        const y = PADDING_TOP + plotHeight * (1 - v / 100)
        return (
          <g key={v}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH - PADDING_RIGHT}
              y1={y}
              y2={y}
              stroke="#e5e5e5"
              strokeWidth={1}
            />
            <text x={PADDING_LEFT - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#737373">
              {v}%
            </text>
          </g>
        )
      })}

      <path d={pathD} fill="none" stroke="#172554" strokeWidth={2.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#172554" />
      ))}

      {labels.map((label, i) => {
        const x = PADDING_LEFT + (plotWidth * i) / lastIndex
        return (
          <text key={label} x={x} y={HEIGHT - 8} textAnchor="middle" fontSize={10} fill="#737373">
            {label}
          </text>
        )
      })}
    </svg>
  )
}
