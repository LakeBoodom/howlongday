/**
 * /parks/[park] — "Best time to visit" + hiking-daylight planner for a
 * curated set of US national parks (see lib/parks.ts).
 *
 * The unique, non-templated depth: real sun data computed for the park's
 * coordinates — today's sunrise/sunset/golden hour, plus daylight length for
 * every month of the year — fused with hand-written seasonal guidance and a
 * signature-hike table framed against available daylight.
 *
 * force-dynamic so the "Today at {park}" figures are correct in the raw HTML
 * for every park's local timezone (18 pages × a few SunCalc calls — cheap).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { MONTHS } from '@/lib/months'
import { getParkBySlug } from '@/lib/parks'
import {
  getSolarSnapshot,
  getYearlyMonthlySummaries,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

export const dynamic = 'force-dynamic'

const YEAR = new Date().getUTCFullYear()

interface Params {
  park: string
}

export async function generateMetadata(
  { params }: { params: Params },
): Promise<Metadata> {
  const park = getParkBySlug(params.park)
  if (!park) return { title: 'Park not found' }

  const title = `Best Time to Visit ${park.name} – Daylight, Golden Hour & Hiking`
  const desc = `When to visit ${park.shortName}: the best months, daylight hours for every month, golden-hour times and signature hikes timed against available daylight. Plan your trip with real sun data.`
  const canonical = `https://howlongday.com/parks/${park.slug}`
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, type: 'article' },
  }
}

function hoursLabel(seconds: number): string {
  return formatDuration(seconds)
}

export default function ParkPage({ params }: { params: Params }) {
  const park = getParkBySlug(params.park)
  if (!park) notFound()

  const now = new Date()
  const snap = getSolarSnapshot(now, park.lat, park.lon)
  const monthly = getYearlyMonthlySummaries(park.lat, park.lon, YEAR)
  const best = new Set(park.bestMonths)

  const todaySunrise = snap.isMidnightSun
    ? 'No sunrise'
    : formatLocalTime(snap.sunrise, park.timezone)
  const todaySunset = snap.isMidnightSun
    ? 'No sunset'
    : formatLocalTime(snap.sunset, park.timezone)
  const eveningGolden = formatLocalTime(snap.goldenHour, park.timezone)
  const todayDaylight = snap.isMidnightSun
    ? '24h (midnight sun)'
    : snap.isPolarNight
      ? '0h (polar night)'
      : hoursLabel(snap.daylightSeconds)

  // Longest / shortest month for the at-a-glance line.
  const sorted = [...monthly].sort((a, b) => b.avgSeconds - a.avgSeconds)
  const longest = sorted[0]
  const shortest = sorted[sorted.length - 1]

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0e1830 0%, #6b2d1a 70%, #e8943a 120%)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{ background: 'linear-gradient(180deg, rgba(11,18,32,0) 0%, rgba(11,18,32,0.7) 75%, rgba(11,18,32,1) 100%)' }}
        />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Link href="/" aria-label="HowLongDay home">
            <Logo variant="compact" />
          </Link>
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/guides/best-time-to-visit-us-national-parks" className="hover:text-white">All parks</Link></li>
          </ul>
        </nav>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            National Park · {park.state}
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl">
            Best time to visit {park.shortName}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85">
            {park.intro}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        {/* Today at the park */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Today at {park.shortName}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Sunrise</p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">{todaySunrise}</p>
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Sunset</p>
              <p className="mt-1 text-lg font-semibold text-sunset tabular-nums">{todaySunset}</p>
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Daylight</p>
              <p className="mt-1 text-lg font-semibold text-daylight tabular-nums">{todayDaylight}</p>
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Golden hour</p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">{eveningGolden}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-4">
            Live for the park&apos;s local timezone ({park.timezone.replace('America/', '').replace('_', ' ')}). Evening golden hour is the start of the warm, low light photographers chase.
          </p>
        </div>

        {/* When to visit */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">When to visit {park.shortName}</h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-daylight/30 bg-daylight/10 px-4 py-1.5 text-sm font-medium text-daylight">
            Best season: {park.bestSeason}
          </p>
          <p className="mt-4 text-base leading-relaxed text-neutral-2">
            {park.whenToVisit}
          </p>
        </div>

        {/* Daylight by month */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">Daylight by month</h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-2">
            How many hours of daylight you get at {park.shortName} through the year — the planning number behind sunrise starts, long-trail timing and golden-hour photography. {park.shortName} ranges from about {hoursLabel(longest.avgSeconds)} in {MONTHS[longest.month].name} down to {hoursLabel(shortest.avgSeconds)} in {MONTHS[shortest.month].name}. Highlighted rows are the recommended months to visit.
          </p>
          <div className="mt-6 overflow-x-auto rounded-card border border-white/10">
            <table className="w-full min-w-[20rem] text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium text-daylight">Daylight</th>
                  <th className="px-4 py-3 font-medium">Recommended</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr
                    key={m.month}
                    className={`border-b border-white/5 last:border-0 ${best.has(m.month) ? 'bg-daylight/[0.06]' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-white">{MONTHS[m.month].name}</td>
                    <td className="px-4 py-2.5 text-daylight">{hoursLabel(m.avgSeconds)}</td>
                    <td className="px-4 py-2.5 text-neutral-3">{best.has(m.month) ? '★ Recommended' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-4">
            Daylight figures computed for {park.shortName}&apos;s coordinates ({YEAR}); mid-month values, accurate to a few minutes.
          </p>
        </div>

        {/* Hiking daylight planner */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">Hiking &amp; daylight planner</h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-2">
            {park.daylightNote}
          </p>
          <div className="mt-6 overflow-x-auto rounded-card border border-white/10">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                  <th className="px-4 py-3 font-medium">Signature hike</th>
                  <th className="px-4 py-3 font-medium tabular-nums">Round trip</th>
                  <th className="px-4 py-3 font-medium tabular-nums">Typical time</th>
                </tr>
              </thead>
              <tbody>
                {park.hikes.map((h) => (
                  <tr key={h.name} className="border-b border-white/5 align-top last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{h.name}</span>
                      <span className="mt-0.5 block text-xs text-neutral-4">{h.note}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-neutral-2">{h.miles} mi</td>
                    <td className="px-4 py-3 tabular-nums text-neutral-2">~{h.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!snap.isMidnightSun && !snap.isPolarNight && (
            <p className="mt-3 text-sm text-neutral-4">
              You have {hoursLabel(snap.daylightSeconds)} of daylight at {park.shortName} today (sunrise {todaySunrise}, sunset {todaySunset}) — start the longer routes early to keep a comfortable margin before dark.
            </p>
          )}
        </div>

        {/* Internal links */}
        <div className="mt-12 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Keep exploring
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/best-time-to-visit-us-national-parks" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              All US national parks →
            </Link>
            <Link href={`/${park.nearestCitySlug}`} className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Sun times in {park.nearestCityName}
            </Link>
            <Link href="/country/united-states" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Daylight across the United States
            </Link>
          </div>
        </div>
      </article>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <p>© {YEAR} HowLongDay</p>
          </div>
        </div>
      </footer>
    </>
  )
}
