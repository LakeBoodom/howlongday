/**
 * 7-column day-by-day calendar grid for a month.
 *
 * Each cell shows: day number, sunrise time, sunset time, daylight length.
 * Polar night and midnight sun get badges instead of time stamps.
 * The grid is Monday-first (the dominant convention outside the US).
 */

import {
  type DaySolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

interface Props {
  days: DaySolarSnapshot[]
  /** 0-indexed UTC weekday of the 1st of the month (0=Sun, 6=Sat) */
  firstWeekday: number
  timezone: string
  /** 1..31, or null when this calendar is not the current month */
  todayDay: number | null
}

const WEEKDAYS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function MonthCalendar({ days, firstWeekday, timezone, todayDay }: Props) {
  // Monday-first offset. JS getUTCDay: 0=Sun..6=Sat. Mon-first: 0=Mon..6=Sun.
  const offset = (firstWeekday + 6) % 7
  const totalCells = Math.ceil((days.length + offset) / 7) * 7

  const cells: Array<DaySolarSnapshot | null> = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (const d of days) cells.push(d)
  while (cells.length < totalCells) cells.push(null)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-white/8 bg-white/[0.02] text-[0.65rem] font-medium uppercase tracking-widecaps text-neutral-3">
        {WEEKDAYS_MON_FIRST.map((w) => (
          <div key={w} className="px-2 py-3 text-center">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (cell === null) {
            return (
              <div
                key={idx}
                className="aspect-square border-b border-r border-white/5 sm:aspect-[5/4]"
              />
            )
          }

          const isToday = todayDay === cell.day
          const dayClass = isToday
            ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-daylight text-bg-deepest font-semibold tabular-nums'
            : 'font-semibold tabular-nums text-white'

          return (
            <div
              key={idx}
              className={`relative flex aspect-square min-h-[88px] flex-col justify-between border-b border-r border-white/5 p-2 sm:aspect-[5/4] sm:p-3 ${
                isToday ? 'bg-daylight/[0.05]' : ''
              }`}
            >
              <div className={dayClass}>{cell.day}</div>

              {cell.isMidnightSun ? (
                <div className="text-[0.65rem] font-medium leading-tight text-daylight">
                  24h daylight
                </div>
              ) : cell.isPolarNight ? (
                <div className="text-[0.65rem] font-medium leading-tight text-sunset">
                  Polar night
                </div>
              ) : (
                <div className="space-y-0.5 text-[0.65rem] leading-tight tabular-nums sm:text-[0.7rem]">
                  <div className="flex items-center justify-between gap-1 text-sunrise">
                    <span className="text-neutral-4">↑</span>
                    <span>{formatLocalTime(cell.sunrise, timezone)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-sunset">
                    <span className="text-neutral-4">↓</span>
                    <span>{formatLocalTime(cell.sunset, timezone)}</span>
                  </div>
                  <div className="pt-0.5 text-right font-medium text-daylight">
                    {formatDuration(cell.daylightSeconds)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
