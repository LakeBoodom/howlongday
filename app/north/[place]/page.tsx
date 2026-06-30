/**
 * /north/[place] — Arctic & Nordic North destination pages (see lib/arctic).
 *
 * The unique, on-brand depth: the extreme daylight story per place — live
 * "today" sun data plus the precomputed midnight-sun, polar-night and aurora
 * windows — fused with hand-written destination guidance (best season +
 * activities). force-dynamic so the "today" figures are correct in the raw
 * HTML for each place's timezone (~50 pages × a few SunCalc calls — cheap).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { MoonPanel } from '@/components/MoonPanel'
import { MONTHS } from '@/lib/months'
import { getArcticBySlug } from '@/lib/arctic'
import {
  getSolarSnapshot,
  getYearlyMonthlySummaries,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

export const dynamic = 'force-dynamic'

const YEAR = new Date().getUTCFullYear()

interface Params {
  place: string
}

export async function generateMetadata(
  { params }: { params: Params },
): Promise<Metadata> {
  const d = getArcticBySlug(params.place)
  if (!d) return { title: 'Destination not found' }

  const bits = [
    d.midnightSun ? 'midnight sun' : null,
    d.polarNight ? 'polar night' : null,
    d.auroraSeason ? 'aurora season' : null,
  ].filter(Boolean).join(', ')
  const title = `${d.name}, ${d.country} – Midnight Sun, Polar Night & Aurora`
  const desc = `When to visit ${d.name} in ${d.region}: ${bits || 'daylight by month'}, today's sunrise & sunset, the best season and what to do. Plan your Arctic trip with real sun data.`
  const canonical = `https://howlongday.com/north/${d.slug}`
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, type: 'article' },
  }
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-4">{label}</div>
      <div className="mt-2 text-lg font-semibold tabular-nums text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-4">{hint}</div>}
    </div>
  )
}

export default function NorthPage({ params }: { params: Params }) {
  const d = getArcticBySlug(params.place)
  if (!d) notFound()

  const now = new Date()
  const snap = getSolarSnapshot(now, d.lat, d.lon)
  const monthly = getYearlyMonthlySummaries(d.lat, d.lon, YEAR)
  const tz = d.timezone

  const todaySunrise = snap.isMidnightSun ? 'No sunset — midnight sun' : formatLocalTime(snap.sunrise, tz)
  const todaySunset = snap.isMidnightSun ? '—' : snap.isPolarNight ? 'No sunrise — polar night' : formatLocalTime(snap.sunset, tz)
  const todayDaylight = snap.isMidnightSun ? '24h (midnight sun)' : snap.isPolarNight ? '0h (polar night)' : formatDuration(snap.daylightSeconds)
  const eveningGolden = formatLocalTime(snap.goldenHour, tz)

  const sorted = [...monthly].sort((a, b) => b.avgSeconds - a.avgSeconds)
  const longest = sorted[0]
  const shortest = sorted[sorted.length - 1]

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #05102a 0%, #123a6b 55%, #2f8f7f 110%)' }}
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
            <li><Link href="/guides/lapland-arctic-north" className="hover:text-white">All destinations</Link></li>
          </ul>
        </nav>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            {d.region} · {d.country}
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl">{d.name}</h1>
          <p className="mt-2 text-sm font-medium text-daylight">{d.knownFor}</p>
          <p className="mt-5 text-base leading-relaxed text-white/85">{d.intro}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        {/* Today */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">Today in {d.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Sunrise" value={todaySunrise} />
            <StatCard label="Sunset" value={todaySunset} />
            <StatCard label="Daylight" value={todayDaylight} />
            <StatCard label="Golden hour" value={eveningGolden} />
          </div>
          <p className="mt-4 text-xs text-neutral-4">Live for {d.name}&apos;s local time ({tz.split('/')[1].replace('_', ' ')}).</p>
        </div>

        {/* Arctic light windows */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">The light at {d.name}</h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-2">
            This far north, the year swings between extremes of light and dark — the planning calendar behind every Arctic trip.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-daylight/25 bg-daylight/[0.06] p-5">
              <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-daylight">Midnight sun</div>
              <div className="mt-2 text-lg font-semibold text-white">{d.midnightSun ?? 'Not at this latitude'}</div>
              <div className="mt-1 text-xs text-neutral-4">{d.midnightSun ? 'Sun never sets' : 'But white nights in midsummer'}</div>
            </div>
            <div className="rounded-card border border-sunset/25 bg-sunset/[0.06] p-5">
              <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-sunset">Polar night</div>
              <div className="mt-2 text-lg font-semibold text-white">{d.polarNight ?? 'Sun rises year-round'}</div>
              <div className="mt-1 text-xs text-neutral-4">{d.polarNight ? 'Sun never rises' : 'Short, low winter days'}</div>
            </div>
            <div className="rounded-card border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">Aurora season</div>
              <div className="mt-2 text-lg font-semibold text-white">{d.auroraSeason ?? 'Too far south for reliable aurora'}</div>
              <div className="mt-1 text-xs text-neutral-4">{d.auroraSeason ? 'Dark, clear nights' : 'Focus on the snow & slopes'}</div>
            </div>
          </div>
        </div>

        {/* Moon, stargazing & aurora tonight */}
        <MoonPanel
          lat={d.lat}
          lon={d.lon}
          timezone={d.timezone}
          snap={snap}
          auroraZone={Boolean(d.auroraSeason)}
          embedded
          heading="Moon, stargazing & aurora tonight"
        />

        {/* When to visit */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">When to visit & what to do</h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-daylight/30 bg-daylight/10 px-4 py-1.5 text-sm font-medium text-daylight">
            Best season: {d.bestSeason}
          </p>
          <ul className="mt-5 space-y-2 text-base leading-relaxed text-neutral-2">
            {d.activities.map((a) => (
              <li key={a} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-daylight/70" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daylight by month */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">Daylight by month</h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-2">
            Daylight at {d.name} ranges from about {formatDuration(longest.avgSeconds)} in {MONTHS[longest.month].name} down to {formatDuration(shortest.avgSeconds)} in {MONTHS[shortest.month].name} — a dramatic Arctic swing.
          </p>
          <div className="mt-6 overflow-x-auto rounded-card border border-white/10">
            <table className="w-full min-w-[18rem] text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium text-daylight">Daylight</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-white">{MONTHS[m.month].name}</td>
                    <td className="px-4 py-2.5 text-daylight">{formatDuration(m.avgSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-neutral-4">Computed for {d.name}&apos;s coordinates ({YEAR}); mid-month values.</p>
        </div>

        {/* Internal links */}
        <div className="mt-12 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">Keep exploring</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/lapland-arctic-north" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              All Arctic North destinations →
            </Link>
            <Link href={`/${d.nearestCitySlug}`} className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Sun &amp; moon in {d.nearestCityName}
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
