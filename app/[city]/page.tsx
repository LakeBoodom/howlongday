import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { HeroSky } from '@/components/HeroSky'
import { DataCards } from '@/components/DataCards'
import { SecondaryRow } from '@/components/SecondaryRow'
import { SeoSection } from '@/components/SeoSection'
import { YearlyDaylight } from '@/components/YearlyDaylight'
import { MonthBrowser } from '@/components/MonthBrowser'

import {
  getCityBySlug,
  getTopCities,
  getCitiesByCountry,
  isTopCity,
  type City,
} from '@/lib/cities'
import {
  getSolarSnapshot,
  getMaxDaylight,
  getYearlyDaylight,
  getYearlyMonthlySummaries,
  dayOfYearUTC,
  formatLocalDate,
  formatLocalTime,
  formatDuration,
  type SolarSnapshot,
} from '@/lib/astronomy'
import { getSkyGradient } from '@/lib/sky'

// Per-page ISR — daylight data (sunrise/sunset/length) is per-date and stable
// within a day, so revalidating daily is plenty. The sun-elevation visual in
// the hero will be stale within a day (it reflects the time the cache was
// last written); accepted as a trade-off for keeping ISR Writes within
// Vercel's free-tier limit. Long-term fix: move the live sun position to a
// client component so the cached HTML stays fresh-looking all day.
export const revalidate = 86400

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
    title: `${city.name} Sunrise & Sunset Today | HowLongDay`,
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

/**
 * "Popular cities" pills on each city page.
 * If the current city's country has at least 5 cities in the top-1k SSG set,
 * show same-country siblings (max 11, excluding the current city).
 * Otherwise fall back to a hand-picked international set.
 */
const FALLBACK_PILLS = [
  'helsinki', 'tokyo', 'new-york-city', 'london',
  'sydney', 'dubai', 'singapore', 'reykjavik',
  'cape-town', 'rio-de-janeiro', 'los-angeles',
]

function getNearbyCities(city: City): City[] {
  const sameCountry = getCitiesByCountry(city.countryCode)
    .filter((c) => c.slug !== city.slug)
    .sort((a, b) => b.population - a.population)
    .slice(0, 11)
  if (sameCountry.length >= 5) return sameCountry
  // Sparse country — show curated international pills
  return FALLBACK_PILLS
    .filter((s) => s !== city.slug)
    .map((s) => getCityBySlug(s))
    .filter((c): c is City => c !== null)
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
  const nearby = getNearbyCities(city)

  // "Plan ahead" 12-month browser. Gated to the top-1000 SSG-prebuilt city
  // set — that covers every city we surface as a CTA (Helsinki, Stockholm,
  // Anchorage, Sydney, Tokyo, etc.) while keeping ISR cost bounded. For the
  // ~48k tail cities a linked 12-tile grid would let Googlebot trigger 12
  // ISR writes per city; the YearlyDaylight chart below serves as their
  // cross-month overview instead.
  const showMonthBrowser = isTopCity(city.slug, 1000)
  const monthSummaries = showMonthBrowser
    ? getYearlyMonthlySummaries(city.lat, city.lon, year)
    : null
  // City's local month index (0..11), so the "Now" badge respects timezone.
  const cityLocalMonthIndex =
    parseInt(
      new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        timeZone: city.timezone,
      }).format(now),
      10,
    ) - 1

  // --- JSON-LD structured data -------------------------------------------
  const sunriseFormatted = formatLocalTime(snap.sunrise, city.timezone)
  const sunsetFormatted = formatLocalTime(snap.sunset, city.timezone)
  const daylightFormatted = formatDuration(snap.daylightSeconds)
  const goldenHourFormatted = formatLocalTime(snap.goldenHour, city.timezone)
  const dateLabel = formatLocalDate(now, city.timezone)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: snap.isMidnightSun
      ? [
          {
            '@type': 'Question',
            name: `How long is the day in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${city.name}, ${city.country} is experiencing midnight sun on ${dateLabel} — the sun stays above the horizon for the full 24 hours.`,
            },
          },
        ]
      : snap.isPolarNight
      ? [
          {
            '@type': 'Question',
            name: `How long is the day in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${city.name}, ${city.country} is in polar night on ${dateLabel} — the sun does not rise above the horizon today.`,
            },
          },
        ]
      : [
          {
            '@type': 'Question',
            name: `What time is sunrise in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Sunrise in ${city.name}, ${city.country} today (${dateLabel}) is at ${sunriseFormatted}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What time is sunset in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Sunset in ${city.name}, ${city.country} today (${dateLabel}) is at ${sunsetFormatted}.`,
            },
          },
          {
            '@type': 'Question',
            name: `How long is the day in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Daylight in ${city.name} today is ${daylightFormatted} long — from sunrise at ${sunriseFormatted} to sunset at ${sunsetFormatted}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What time is golden hour in ${city.name} today?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Evening golden hour in ${city.name} today starts at ${goldenHourFormatted}, when the sun drops below 6° above the horizon.`,
            },
          },
        ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSky
        sky={sky}
        azimuthDeg={snap.azimuthDeg}
        elevationDeg={snap.elevationDeg}
        isMidnightSun={snap.isMidnightSun}
        isPolarNight={snap.isPolarNight}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Link href="/" aria-label="HowLongDay home">
            <Logo variant="compact" />
          </Link>
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
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

      {showMonthBrowser && monthSummaries && (
        <MonthBrowser
          citySlug={city.slug}
          cityName={city.name}
          year={year}
          summaries={monthSummaries}
          currentMonthIndex={cityLocalMonthIndex}
        />
      )}

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

      {/* Popular cities pills (same-country if dense, else curated international) */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            {nearby[0]?.countryCode === city.countryCode
              ? `More in ${city.country}`
              : 'Explore other cities'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {nearby.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <ul className="grid grid-cols-2 gap-y-4 text-center text-[0.7rem] uppercase tracking-widecaps text-neutral-3 sm:grid-cols-2 md:grid-cols-4">
            <li>200+ countries</li>
            <li>49,000+ cities</li>
            <li>Astronomical precision</li>
            <li>Golden &amp; Blue hour</li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <p>
              © {new Date().getFullYear()} HowLongDay. Times in {city.timezone}.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
