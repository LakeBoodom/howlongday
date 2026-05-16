import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { HeroSky } from '@/components/HeroSky'
import { DataCards } from '@/components/DataCards'
import { SecondaryRow } from '@/components/SecondaryRow'
import { SeoSection } from '@/components/SeoSection'
import { YearlyDaylight } from '@/components/YearlyDaylight'

import { getCityBySlug, getTopCities, type City } from '@/lib/cities'
import {
  getSolarSnapshot,
  getMaxDaylight,
  getYearlyDaylight,
  dayOfYearUTC,
  formatLocalDate,
  formatLocalTime,
  formatDuration,
  type SolarSnapshot,
} from '@/lib/astronomy'
import { getSkyGradient } from '@/lib/sky'

// Per-page ISR — sky depends on real-time sun elevation, so we refresh hourly.
export const revalidate = 3600

interface Params {
  city: string
}

export async function generateStaticParams() {
  // Prebuild the top 1000 cities by population. The remaining ~48k generate
  // on first request via ISR (dynamicParams=true) and are cached for 1h.
  return getTopCities(1000).map((c) => ({ city: c.slug }))
}

// Any slug not in the prebuilt list is generated on-demand.
export const dynamicParams = true

export async function generateMetadata(
  { params }: { params: Params },
): Promise<Metadata> {
  const city = getCityBySlug(params.city)
  if (!city) {
    return { title: 'City not found' }
  }
  const now = new Date()
  const snap = getSolarSnapshot(now, city.lat, city.lon)
  const sunrise = formatLocalTime(snap.sunrise, city.timezone)
  const sunset = formatLocalTime(snap.sunset, city.timezone)
  const daylight = formatDuration(snap.daylightSeconds)
  const desc = snap.isMidnightSun
    ? `${city.name}, ${city.country} is in midnight sun — daylight all 24 hours today.`
    : snap.isPolarNight
    ? `${city.name}, ${city.country} is in polar night — the sun does not rise today.`
    : `Today in ${city.name}, ${city.country}: sunrise ${sunrise}, sunset ${sunset}. Daylight ${daylight}.`
  const canonical = `https://howlongday.com/${city.slug}`
  return {
    title: `How long is the day in ${city.name} today?`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${city.name} sunrise & sunset today`,
      description: desc,
      url: canonical,
      type: 'website',
    },
  }
}

// --- Helpers ---------------------------------------------------------------

// Approximate equinox/solstice dates (UTC). Accurate within a day for display.
const ASTRO_EVENTS = [
  { date: '2026-03-20', kind: 'equinox' as const, label: 'Mar 20, 2026' },
  { date: '2026-06-21', kind: 'solstice' as const, label: 'Jun 21, 2026' },
  { date: '2026-09-22', kind: 'equinox' as const, label: 'Sep 22, 2026' },
  { date: '2026-12-21', kind: 'solstice' as const, label: 'Dec 21, 2026' },
  { date: '2027-03-20', kind: 'equinox' as const, label: 'Mar 20, 2027' },
  { date: '2027-06-21', kind: 'solstice' as const, label: 'Jun 21, 2027' },
  { date: '2027-09-23', kind: 'equinox' as const, label: 'Sep 23, 2027' },
  { date: '2027-12-22', kind: 'solstice' as const, label: 'Dec 22, 2027' },
]

function nextAstroEvent(now: Date) {
  for (const e of ASTRO_EVENTS) {
    const d = new Date(`${e.date}T12:00:00Z`)
    if (d.getTime() > now.getTime()) {
      const daysAway = Math.max(
        1,
        Math.ceil((d.getTime() - now.getTime()) / 86_400_000),
      )
      return { label: e.label, daysAway, kind: e.kind }
    }
  }
  return { label: 'Jun 21, 2026', daysAway: 0, kind: 'solstice' as const }
}

function buildLocalFact(snap: SolarSnapshot, city: City): string {
  if (snap.isMidnightSun) return 'The sun stays above the horizon all 24 hours today.'
  if (snap.isPolarNight) return 'The sun does not rise above the horizon today.'
  const absLat = Math.abs(city.lat)
  if (absLat >= 60) {
    return 'At this latitude, daylight length changes several minutes every day.'
  }
  if (absLat < 10) {
    return 'Near the equator, daylight stays close to 12 hours all year.'
  }
  return `Daylight today is ${formatDuration(snap.daylightSeconds)} long.`
}

// --- Page ------------------------------------------------------------------

export default function CityPage({ params }: { params: Params }) {
  const city = getCityBySlug(params.city)
  if (!city) notFound()

  const now = new Date()
  const snap = getSolarSnapshot(now, city.lat, city.lon)
  const sky = getSkyGradient(snap.elevationDeg, snap.isAfterNoon)
  const year = now.getUTCFullYear()
  const maxDaylight = getMaxDaylight(city.lat, city.lon, year)
  const daylightPct = maxDaylight > 0 ? (snap.daylightSeconds / maxDaylight) * 100 : 0
  const yearlyDaylight = getYearlyDaylight(city.lat, city.lon, year)
  const todayIndex = dayOfYearUTC(now)
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: city.timezone,
  }).format(now)
  const peakDateLabel = city.lat >= 0 ? 'Jun 21' : 'Dec 21'
  const nextEvent = nextAstroEvent(now)
  const localFact = buildLocalFact(snap, city)
  const isHighLatitude = Math.abs(city.lat) >= 66.5

  return (
    <>
      <HeroSky
        sky={sky}
        azimuthDeg={snap.azimuthDeg}
        elevationDeg={snap.elevationDeg}
        isMidnightSun={snap.isMidnightSun}
        isPolarNight={snap.isPolarNight}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Logo variant="compact" />
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li className="cursor-default">Today</li>
            <li className="cursor-default text-white/50">Explore</li>
            <li className="cursor-default text-white/50">API</li>
          </ul>
        </nav>

        <header className="mx-auto max-w-6xl px-6 pt-16 pb-6 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            {formatLocalDate(now, city.timezone)}
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-4xl sm:text-5xl md:text-6xl">
            {city.name}
            <span className="ml-3 align-baseline font-normal text-neutral-3 text-2xl sm:text-3xl md:text-4xl">
              {city.country}
            </span>
          </h1>
        </header>

        <div className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
          <DataCards
            snap={snap}
            city={city}
            daylightPct={daylightPct}
            peakDateLabel={peakDateLabel}
          />
          <div className="mt-4">
            <SecondaryRow
              snap={snap}
              city={city}
              nextSolstice={nextEvent}
              localFact={localFact}
            />
          </div>
        </div>
      </HeroSky>

      <SeoSection
        city={city}
        snap={snap}
        monthLabel={monthLabel}
        isHighLatitude={isHighLatitude}
      />

      <YearlyDaylight
        data={yearlyDaylight}
        todayIndex={todayIndex}
        year={year}
        cityName={city.name}
      />

      {/* Features bar */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <ul className="grid grid-cols-2 gap-y-4 text-center text-[0.7rem] uppercase tracking-widecaps text-neutral-3 sm:grid-cols-3 md:grid-cols-6">
            <li>200+ countries</li>
            <li>50,000+ cities</li>
            <li>Astronomical precision</li>
            <li>Golden &amp; Blue hour</li>
            <li>Free API</li>
            <li>Free forever</li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <p>
            © {new Date().getFullYear()} HowLongDay. Times in {city.timezone}.
          </p>
        </div>
      </footer>
    </>
  )
}
