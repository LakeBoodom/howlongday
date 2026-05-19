/**
 * MonthBrowser — 12-tile "year at a glance" navigator.
 *
 * Each tile represents one calendar month and renders:
 *   - the month short name (Jan..Dec)
 *   - the month's average daylight (e.g. "5h 49m")
 *   - a warm fill rising from the bottom proportional to daylight length
 *     (so winter tiles read as "dark + tiny warm sliver", summer tiles as
 *     "dark + tall warm column", midnight sun fully filled, polar night
 *     fully dark).
 *
 * The whole tile is a <Link> to /[city]/[month]. This is the primary "plan
 * ahead" affordance — both on the city page and replacing the small
 * prev/next chips on the month page itself. Current month gets a sungglow
 * ring and "Now" badge.
 *
 * Server component, no client JS. Renders only on contexts where the city
 * is in the top-100 prebuilt SSG set — otherwise the linked tiles would
 * walk Googlebot through 12 ISR writes per tail city.
 */

import Link from 'next/link'

import { MONTHS } from '@/lib/months'
import { formatDuration, type MonthDaylightSummary } from '@/lib/astronomy'

interface Props {
  citySlug: string
  cityName: string
  year: number
  summaries: MonthDaylightSummary[]
  /** 0..11 for the tile to highlight, or null for no highlight. */
  currentMonthIndex: number | null
  /** Label shown in the highlight badge. Defaults to "Now". */
  highlightLabel?: string
}

function tileLabel(seconds: number): string {
  if (seconds >= 86_399) return '24h'
  if (seconds <= 1) return '0h'
  return formatDuration(seconds)
}

export function MonthBrowser({
  citySlug,
  cityName,
  year,
  summaries,
  currentMonthIndex,
  highlightLabel = 'Now',
}: Props) {
  return (
    <section className="border-t border-white/5 bg-bg-deepest">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
              Plan ahead
            </p>
            <h2 className="mt-2 text-balance font-semibold text-white text-2xl sm:text-3xl">
              Daylight in {cityName} month by month
            </h2>
          </div>
          <p className="hidden text-sm text-neutral-4 sm:block">{year}</p>
        </div>

        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-12">
          {summaries.map((s) => {
            const m = MONTHS[s.month]
            const ratio = Math.max(0, Math.min(1, s.avgSeconds / 86400))
            const isNow = s.month === currentMonthIndex
            const label = tileLabel(s.avgSeconds)

            return (
              <li key={m.slug}>
                <Link
                  href={`/${citySlug}/${m.slug}`}
                  aria-label={`${m.name} in ${cityName} — average daylight ${label}. See day-by-day calendar.`}
                  className={`group relative flex aspect-square overflow-hidden rounded-card border bg-white/[0.04] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sungglow ${
                    isNow
                      ? 'border-sungglow shadow-[0_0_0_2px_rgba(255,194,77,0.45)]'
                      : 'border-white/10 hover:border-white/35'
                  }`}
                >
                  {/* Daylight fill bar — height ∝ avg daylight ratio */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 transition-[height] duration-300"
                    style={{
                      height: `${ratio * 100}%`,
                      background:
                        'linear-gradient(180deg, rgba(255,194,77,0.45) 0%, rgba(255,138,0,0.65) 100%)',
                    }}
                  />
                  {/* Subtle top sheen for depth */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                    }}
                  />

                  <div className="relative z-10 flex h-full w-full flex-col items-center justify-between p-2 sm:p-3">
                    <span className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/85">
                      {m.short}
                    </span>
                    <span className="font-semibold text-white tabular-nums text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
                      {label}
                    </span>
                  </div>

                  {isNow && (
                    <span className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-sungglow px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widecaps text-bg-deepest shadow">
                      {highlightLabel}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-5 text-sm text-neutral-4">
          Tap a month to see daylight, sunrise and sunset for every day in{' '}
          {cityName}.
        </p>
      </div>
    </section>
  )
}
