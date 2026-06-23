/**
 * /country/[country] — country daylight hubs.
 *
 * A curated set of countries (see lib/countries.ts) get a hub page listing
 * their largest cities with today's sunrise/sunset/daylight, plus country-wide
 * "today" highlights. These pages establish the Home → Country → City → Month
 * hierarchy and funnel internal links to the city pages.
 *
 * force-dynamic so the per-city "today" data is correct in the raw HTML
 * (≤20 cities × a couple of SunCalc calls — cheap).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { getCitiesByCountry, type City } from '@/lib/cities'
import { getCountryHub } from '@/lib/countries'
import {
  getSolarSnapshot,
  formatLocalTime,
  formatDuration,
  type SolarSnapshot,
} from '@/lib/astronomy'

export const dynamic = 'force-dynamic'

const MAX_CITIES = 20

interface Params {
  country: string
}

export async function generateMetadata(
  { params }: { params: Params },
): Promise<Metadata> {
  const hub = getCountryHub(params.country)
  if (!hub) return { title: 'Country not found' }

  const title = `Sunrise & Sunset in ${hub.name} Today – Daylight by City`
  const desc = `Today's sunrise, sunset and daylight length for the largest cities in ${hub.name}. Compare day length across ${hub.name} and plan around golden hour.`
  const canonical = `https://howlongday.com/country/${hub.slug}`
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical },
    openGraph: { title, description: desc, url: canonical, type: 'website' },
  }
}

interface Row {
  city: City
  snap: SolarSnapshot
  sunrise: string
  sunset: string
  daylight: string
}

export default function CountryHubPage({ params }: { params: Params }) {
  const hub = getCountryHub(params.country)
  if (!hub) notFound()

  const now = new Date()
  const cities = getCitiesByCountry(hub.code).slice(0, MAX_CITIES)
  if (cities.length === 0) notFound()

  const rows: Row[] = cities.map((city) => {
    const snap = getSolarSnapshot(now, city.lat, city.lon)
    return {
      city,
      snap,
      sunrise: snap.isMidnightSun ? '—' : formatLocalTime(snap.sunrise, city.timezone),
      sunset: snap.isPolarNight ? '—' : formatLocalTime(snap.sunset, city.timezone),
      daylight: snap.isMidnightSun
        ? '24h'
        : snap.isPolarNight
        ? '0h'
        : formatDuration(snap.daylightSeconds),
    }
  })

  // Country-wide "today" highlights. Sunrise/sunset compared by local clock
  // time (HH:MM strings sort chronologically); daylight by seconds.
  const withSunrise = rows.filter((r) => r.sunrise !== '—')
  const withSunset = rows.filter((r) => r.sunset !== '—')
  const earliest = withSunrise.length
    ? withSunrise.reduce((a, b) => (a.sunrise <= b.sunrise ? a : b))
    : null
  const latest = withSunset.length
    ? withSunset.reduce((a, b) => (a.sunset >= b.sunset ? a : b))
    : null
  const longest = rows.reduce((a, b) =>
    a.snap.daylightSeconds >= b.snap.daylightSeconds ? a : b,
  )

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #0a1f3d 0%, #1a4080 50%, #2a6ab0 100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,18,32,0) 0%, rgba(11,18,32,0.6) 70%, rgba(11,18,32,1) 100%)',
          }}
        />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Link href="/" aria-label="HowLongDay home">
            <Logo variant="compact" />
          </Link>
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
          </ul>
        </nav>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            Daylight by city
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl md:text-6xl">
            Sunrise &amp; sunset in {hub.name} today
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Today&apos;s sunrise, sunset and daylight length for the largest
            cities in {hub.name}. Tap any city for live sun position, golden
            hour and a 7-day forecast.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {earliest && (
              <Highlight
                label="Earliest sunrise today"
                value={earliest.sunrise}
                sub={earliest.city.name}
                accent="text-sunrise"
              />
            )}
            {latest && (
              <Highlight
                label="Latest sunset today"
                value={latest.sunset}
                sub={latest.city.name}
                accent="text-sunset"
              />
            )}
            <Highlight
              label="Longest day today"
              value={longest.daylight}
              sub={longest.city.name}
              accent="text-daylight"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <h2 className="mb-6 font-semibold text-white text-2xl sm:text-3xl">
            Today across {hub.name}
          </h2>
          <div className="overflow-x-auto rounded-card border border-white/10">
            <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium text-sunrise">Sunrise</th>
                  <th className="px-4 py-3 font-medium text-sunset">Sunset</th>
                  <th className="px-4 py-3 font-medium">Daylight</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.city.slug} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/${r.city.slug}`} className="text-white hover:text-daylight">
                        {r.city.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sunrise">{r.sunrise}</td>
                    <td className="px-4 py-3 text-sunset">{r.sunset}</td>
                    <td className="px-4 py-3 text-daylight">{r.daylight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-neutral-4">
            Times are shown in each city&apos;s local timezone and update through
            the day.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <p>© {new Date().getFullYear()} HowLongDay</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function Highlight({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <div className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
        {label}
      </div>
      <div className={`mt-2 font-semibold text-2xl tabular-nums ${accent}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-white/75">{sub}</div>
    </div>
  )
}
