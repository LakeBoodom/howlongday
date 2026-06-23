/**
 * /world-cup-2026 — timely topical hub for the 2026 FIFA World Cup
 * (USA · Canada · Mexico, 11 June – 19 July 2026).
 *
 * Why this page exists: while the tournament is on, searches for the host
 * cities spike, and fans planning around evening kick-offs and golden hour
 * care about local daylight. This hub answers that in one place AND funnels
 * internal links to the 16 host-city pages and their June/July month pages —
 * strengthening the site's hierarchy exactly when those cities get attention.
 *
 * Server-rendered with force-dynamic so the per-city "today" times are correct
 * in the raw HTML (16 cities × a couple of SunCalc calls — cheap).
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { getCityBySlug } from '@/lib/cities'
import {
  getSolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

export const dynamic = 'force-dynamic'

const TOURNAMENT = '11 June – 19 July 2026'
const CANONICAL = 'https://howlongday.com/world-cup-2026'

interface HostCity {
  slug: string
  /** Display name (may differ from the dataset name, e.g. metro labels). */
  label: string
  /** Stadium + notable fixture, for unique on-page context. */
  venue: string
}

const HOSTS: { country: string; cities: HostCity[] }[] = [
  {
    country: 'United States',
    cities: [
      { slug: 'atlanta', label: 'Atlanta', venue: 'Mercedes-Benz Stadium — Semifinal, Jul 15' },
      { slug: 'boston', label: 'Boston', venue: 'Gillette Stadium, Foxborough' },
      { slug: 'dallas', label: 'Dallas', venue: 'AT&T Stadium, Arlington — most matches; Semifinal Jul 14' },
      { slug: 'houston', label: 'Houston', venue: 'NRG Stadium' },
      { slug: 'kansas-city', label: 'Kansas City', venue: 'Arrowhead Stadium' },
      { slug: 'los-angeles', label: 'Los Angeles', venue: 'SoFi Stadium, Inglewood' },
      { slug: 'miami', label: 'Miami', venue: 'Hard Rock Stadium, Miami Gardens' },
      { slug: 'new-york-city', label: 'New York / New Jersey', venue: 'MetLife Stadium — Final, Jul 19' },
      { slug: 'philadelphia', label: 'Philadelphia', venue: 'Lincoln Financial Field' },
      { slug: 'san-francisco', label: 'San Francisco Bay Area', venue: "Levi's Stadium, Santa Clara" },
      { slug: 'seattle', label: 'Seattle', venue: 'Lumen Field' },
    ],
  },
  {
    country: 'Canada',
    cities: [
      { slug: 'toronto', label: 'Toronto', venue: 'BMO Field' },
      { slug: 'vancouver', label: 'Vancouver', venue: 'BC Place' },
    ],
  },
  {
    country: 'Mexico',
    cities: [
      { slug: 'mexico-city', label: 'Mexico City', venue: 'Estadio Azteca' },
      { slug: 'guadalajara', label: 'Guadalajara', venue: 'Estadio Akron' },
      { slug: 'monterrey', label: 'Monterrey', venue: 'Estadio BBVA' },
    ],
  },
]

export const metadata: Metadata = {
  title: {
    absolute: 'Sunrise, Sunset & Daylight in 2026 World Cup Host Cities',
  },
  description: `Today's sunrise, sunset and daylight hours for all 16 FIFA World Cup 2026 host cities across the USA, Canada and Mexico (${TOURNAMENT}). Plan matchday evenings and golden hour.`,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Sunrise, Sunset & Daylight in 2026 World Cup Host Cities',
    description: `Local daylight for all 16 host cities, ${TOURNAMENT}.`,
    url: CANONICAL,
    type: 'website',
  },
}

function CityCard({ host }: { host: HostCity }) {
  const city = getCityBySlug(host.slug)
  if (!city) return null

  const snap = getSolarSnapshot(new Date(), city.lat, city.lon)
  const sunrise = formatLocalTime(snap.sunrise, city.timezone)
  const sunset = formatLocalTime(snap.sunset, city.timezone)
  const daylight = snap.isMidnightSun
    ? '24h daylight'
    : snap.isPolarNight
    ? 'No sunrise'
    : formatDuration(snap.daylightSeconds)

  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Link
          href={`/${city.slug}`}
          className="font-semibold text-white hover:text-daylight"
        >
          {host.label}
        </Link>
        <span className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
          {city.country}
        </span>
      </div>

      <p className="mt-1 text-xs text-neutral-4">{host.venue}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums">
        <span className="text-sunrise">↑ {sunrise}</span>
        <span className="text-sunset">↓ {sunset}</span>
        <span className="text-daylight">● {daylight}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href={`/${city.slug}`}
          className="rounded-full border border-white/15 px-3 py-1 text-white/85 hover:border-white/30 hover:text-white"
        >
          Today
        </Link>
        <Link
          href={`/${city.slug}/june`}
          className="rounded-full border border-white/15 px-3 py-1 text-white/85 hover:border-white/30 hover:text-white"
        >
          June
        </Link>
        <Link
          href={`/${city.slug}/july`}
          className="rounded-full border border-white/15 px-3 py-1 text-white/85 hover:border-white/30 hover:text-white"
        >
          July
        </Link>
      </div>
    </div>
  )
}

export default function WorldCup2026Page() {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #0a1f3d 0%, #1a4080 45%, #2a6ab0 100%)',
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

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            {TOURNAMENT} · USA · Canada · Mexico
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl md:text-6xl">
            Daylight in the 2026 World Cup host cities
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Sunrise, sunset and daylight length for all 16 FIFA World Cup 2026
            host cities. Handy for planning around evening kick-offs, golden-hour
            photos and what to do before and after a match.
          </p>
        </div>
      </section>

      {HOSTS.map((group) => (
        <section
          key={group.country}
          className="border-t border-white/5 bg-bg-deepest"
        >
          <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
            <h2 className="mb-6 font-semibold text-white text-2xl sm:text-3xl">
              {group.country}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.cities.map((c) => (
                <CityCard key={c.slug} host={c} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="max-w-prose text-sm leading-relaxed text-neutral-3">
            All times are shown in each city&apos;s local timezone and update
            through the day. Tap any city for live sun position, golden hour and
            a 7-day forecast, or open its June / July page for the full
            day-by-day daylight calendar across the tournament.
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
