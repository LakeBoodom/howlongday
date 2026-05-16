/**
 * Yearly daylight chart — inline SVG, no client JS, no chart library.
 *
 * Plots daylight-length-in-hours over a full calendar year. The curve
 * is stroked with a horizontal linear gradient (cool ends → warm middle),
 * which reads correctly in both hemispheres (winter is short and "cold",
 * summer is long and "warm").
 *
 * Today's point is highlighted with a pulsing gold dot. Approximate
 * solstices and equinoxes are drawn as faint vertical lines.
 */

import type { DaylightPoint } from '@/lib/astronomy'

interface Props {
  data: DaylightPoint[]
  /** 0-based index of today's data point, or null if not in this year. */
  todayIndex: number | null
  year: number
  cityName: string
}

// Layout
const W = 840
const H = 240
const PAD_L = 44
const PAD_R = 16
const PAD_T = 16
const PAD_B = 40
const INNER_W = W - PAD_L - PAD_R
const INNER_H = H - PAD_T - PAD_B

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatHM(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '0h'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function YearlyDaylight({ data, todayIndex, year, cityName }: Props) {
  if (data.length === 0) return null

  // y-axis range: hours, rounded up to a multiple of 6 for tidy ticks
  const maxSec = data.reduce((m, p) => (p.daylightSeconds > m ? p.daylightSeconds : m), 0)
  const maxHours = maxSec / 3600
  const yMax = Math.max(6, Math.ceil(maxHours / 6) * 6) // 6, 12, 18, 24
  const yTicks: number[] = []
  for (let t = 0; t <= yMax; t += 6) yTicks.push(t)

  const xFor = (i: number) =>
    PAD_L + (i / (data.length - 1)) * INNER_W
  const yFor = (hours: number) =>
    PAD_T + INNER_H - (Math.max(0, Math.min(yMax, hours)) / yMax) * INNER_H

  // Path: smoothed-looking polyline (data is already smooth)
  let path = ''
  for (let i = 0; i < data.length; i++) {
    const x = xFor(i).toFixed(2)
    const y = yFor(data[i].daylightSeconds / 3600).toFixed(2)
    path += i === 0 ? `M${x},${y}` : ` L${x},${y}`
  }

  // First-of-month tick positions for x-axis labels
  const monthStarts: Array<{ x: number; label: string }> = []
  let lastMonth = -1
  for (let i = 0; i < data.length; i++) {
    const m = data[i].date.getUTCMonth()
    if (m !== lastMonth) {
      monthStarts.push({ x: xFor(i), label: MONTH_LABELS[m] })
      lastMonth = m
    }
  }

  // Approximate solstice / equinox markers (year-agnostic within 1–2 days).
  const astroEvents: Array<{ label: string; dayOfYear: number }> = [
    { label: 'Spring equinox', dayOfYear: isBefore(year, 2, 20) },
    { label: 'Summer solstice', dayOfYear: isBefore(year, 5, 21) },
    { label: 'Autumn equinox', dayOfYear: isBefore(year, 8, 22) },
    { label: 'Winter solstice', dayOfYear: isBefore(year, 11, 21) },
  ]

  // Today
  const today = todayIndex !== null && todayIndex >= 0 && todayIndex < data.length
    ? {
        x: xFor(todayIndex),
        y: yFor(data[todayIndex].daylightSeconds / 3600),
        daylight: data[todayIndex].daylightSeconds,
      }
    : null

  return (
    <section className="border-t border-white/5 bg-bg-deepest">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
              {year} · annual cycle
            </p>
            <h2 className="mt-2 text-balance font-semibold text-white text-2xl sm:text-3xl">
              Daylight throughout the year in {cityName}
            </h2>
          </div>
          {today && (
            <p className="text-sm text-neutral-3">
              Today: <span className="font-semibold text-white">{formatHM(today.daylight)}</span> of daylight
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.025] p-4 sm:p-6">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label={`Daylight duration in ${cityName} for each day of ${year}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="daylight-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"  stopColor="#3AA0FF" />
                <stop offset="25%" stopColor="#7BB7E8" />
                <stop offset="50%" stopColor="#FFD18A" />
                <stop offset="75%" stopColor="#7BB7E8" />
                <stop offset="100%" stopColor="#3AA0FF" />
              </linearGradient>
              <linearGradient id="daylight-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#FFD18A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFD18A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* y-axis tick lines + labels */}
            {yTicks.map((t) => {
              const y = yFor(t)
              return (
                <g key={t}>
                  <line
                    x1={PAD_L}
                    x2={W - PAD_R}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD_L - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={11}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#6B778C"
                  >
                    {t}h
                  </text>
                </g>
              )
            })}

            {/* Astronomical event markers */}
            {astroEvents.map((e, idx) => {
              const x = xFor(e.dayOfYear)
              if (x < PAD_L || x > W - PAD_R) return null
              return (
                <line
                  key={idx}
                  x1={x}
                  x2={x}
                  y1={PAD_T}
                  y2={H - PAD_B}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
              )
            })}

            {/* Filled area below curve (subtle) */}
            <path
              d={`${path} L${xFor(data.length - 1).toFixed(2)},${(H - PAD_B).toFixed(2)} L${PAD_L},${(H - PAD_B).toFixed(2)} Z`}
              fill="url(#daylight-fill)"
            />

            {/* Daylight curve */}
            <path
              d={path}
              fill="none"
              stroke="url(#daylight-stroke)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* x-axis month labels */}
            {monthStarts.map((m, idx) => (
              <text
                key={idx}
                x={m.x}
                y={H - PAD_B + 18}
                textAnchor="middle"
                fontSize={11}
                fontFamily="Inter, system-ui, sans-serif"
                fill="#A7B0C0"
              >
                {m.label}
              </text>
            ))}

            {/* Today marker */}
            {today && (
              <g>
                <line
                  x1={today.x}
                  x2={today.x}
                  y1={PAD_T}
                  y2={H - PAD_B}
                  stroke="rgba(255,210,100,0.35)"
                  strokeWidth={1}
                />
                <circle
                  cx={today.x}
                  cy={today.y}
                  r={9}
                  fill="rgba(255,210,100,0.18)"
                >
                  <animate
                    attributeName="r"
                    values="7;13;7"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.05;0.5"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={today.x}
                  cy={today.y}
                  r={4.5}
                  fill="#FFC24D"
                  stroke="#fff8e0"
                  strokeWidth={1.5}
                />
              </g>
            )}
          </svg>
        </div>

        <p className="mt-4 text-sm text-neutral-3">
          The curve traces daily daylight length from January through December.
          Dashed vertical lines mark the equinoxes and solstices.
        </p>
      </div>
    </section>
  )
}

/**
 * Approximate day-of-year (0-indexed) for a calendar date in `year`.
 * Used for fixed solstice/equinox positions where 1-day error is fine.
 */
function isBefore(year: number, month0: number, day: number): number {
  const ms = Date.UTC(year, month0, day) - Date.UTC(year, 0, 1)
  return Math.floor(ms / 86_400_000)
}
