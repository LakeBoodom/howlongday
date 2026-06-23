/**
 * NextDays — the "Next 7 days" planner table + a one-line daylight-trend
 * readout. This is the core "planner, not database" upgrade: it gives a reason
 * to stay on the page (a week of sunrise/sunset to plan around) and an
 * interpretation the search-result instant answer cannot show (how daylight is
 * changing, and how much you gain/lose tomorrow).
 *
 * Server component, no client JS — the table is in the raw HTML so it is
 * crawlable. Compute is cheap (~9 SunCalc getTimes calls), which is fine on the
 * dynamic city page.
 */

import type { City } from '@/lib/cities'
import {
  getUpcomingDays,
  buildDaylightTrend,
  formatLocalTime,
  formatDuration,
  formatSignedDuration,
} from '@/lib/astronomy'

interface Props {
  city: City
}

function dayLengthLabel(seconds: number): string {
  if (seconds >= 86_399) return '24h 0m'
  if (seconds <= 1) return '0h 0m'
  return formatDuration(seconds)
}

export function NextDays({ city }: Props) {
  // Anchor one day in the past so "today" has a previous day to diff against,
  // and so we have today→+7 for the weekly trend. series[1] = today.
  const from = new Date(Date.now() - 86_400_000)
  const series = getUpcomingDays(city.lat, city.lon, 9, from)
  const todayOnward = series.slice(1) // today .. +7  (8 entries)
  const trend = buildDaylightTrend(todayOnward)

  const dayFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: city.timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  // 7 rows: today .. +6. Row j maps to series[j + 1]; its change is measured
  // against the previous calendar day series[j].
  const rows = Array.from({ length: 7 }, (_, j) => {
    const day = series[j + 1]
    const prev = series[j]
    return {
      isToday: j === 0,
      label: j === 0 ? 'Today' : dayFmt.format(day.date),
      sunrise: formatLocalTime(day.sunrise, city.timezone),
      sunset: formatLocalTime(day.sunset, city.timezone),
      length: dayLengthLabel(day.daylightSeconds),
      change: formatSignedDuration(day.daylightSeconds - prev.daylightSeconds),
      changePositive: day.daylightSeconds - prev.daylightSeconds >= 0,
    }
  })

  const tomorrowAbs = Math.round(Math.abs(trend.tomorrowDeltaSeconds))
  const tomorrowMag =
    tomorrowAbs < 60
      ? `${tomorrowAbs}s`
      : tomorrowAbs % 60 === 0
      ? `${Math.floor(tomorrowAbs / 60)}m`
      : `${Math.floor(tomorrowAbs / 60)}m ${tomorrowAbs % 60}s`
  const tomorrowLine =
    trend.direction === 'flat' || tomorrowAbs === 0
      ? null
      : `Tomorrow is ${tomorrowMag} ${
          trend.tomorrowDeltaSeconds >= 0 ? 'longer' : 'shorter'
        } than today.`

  return (
    <section className="border-t border-white/5 bg-bg-deepest">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="mb-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Next 7 days
          </p>
          <h2 className="mt-2 text-balance font-semibold text-white text-2xl sm:text-3xl">
            Sunrise &amp; sunset in {city.name} this week
          </h2>
        </div>

        {/* Interpretive readout — the planner value */}
        <div className="mb-6 rounded-card border border-daylight/20 bg-daylight/[0.06] p-5">
          <p className="font-medium text-daylight">{trend.sentence}</p>
          {tomorrowLine && (
            <p className="mt-1 text-sm text-neutral-2">{tomorrowLine}</p>
          )}
        </div>

        <div className="overflow-x-auto rounded-card border border-white/10">
          <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium text-sunrise">Sunrise</th>
                <th className="px-4 py-3 font-medium text-sunset">Sunset</th>
                <th className="px-4 py-3 font-medium">Day length</th>
                <th className="px-4 py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className={`border-b border-white/5 last:border-0 ${
                    r.isToday ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {r.isToday ? (
                      <span className="inline-flex items-center gap-2">
                        Today
                        <span className="rounded-full bg-daylight/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-widecaps text-daylight">
                          Now
                        </span>
                      </span>
                    ) : (
                      <span className="text-neutral-2">{r.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sunrise">{r.sunrise}</td>
                  <td className="px-4 py-3 text-sunset">{r.sunset}</td>
                  <td className="px-4 py-3 text-white">{r.length}</td>
                  <td
                    className={`px-4 py-3 ${
                      r.changePositive ? 'text-emerald-300/90' : 'text-rose-300/90'
                    }`}
                  >
                    {r.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-neutral-4">
          Times shown for {city.timezone}. “Change” is the difference in daylight
          length from the day before.
        </p>
      </div>
    </section>
  )
}
