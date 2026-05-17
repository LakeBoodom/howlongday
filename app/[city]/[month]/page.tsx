/**
 * /[city]/[month] — month-specific daylight calendar pages.
 *
 * Each page targets the search intent "how long is daylight in {City} in
 * {Month}" — a high-volume long-tail query. We render a day-by-day calendar
 * grid, summary stats (average / longest / shortest day), and FAQPage JSON-LD.
 *
 * Build strategy: top 100 cities × 12 months = 1,200 prebuilt pages.
 * Remaining city/month combinations render on-demand via ISR (revalidate=1h).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { MonthCalendar } from '@/components/MonthCalendar'
import { FaqAccordion, type FaqEntry } from '@/components/FaqAccordion'

import { getCityBySlug, getTopCities } from '@/lib/cities'
import { MONTHS, getMonthBySlug, firstWeekday as monthFirstWeekday } from '@/lib/months'
import {
  getMonthlyDaylight,
  formatLocalTime,
  formatDuration,
  type DaySolarSnapshot,
} from '@/lib/astronomy'
import { getSkyGradient } from '@/lib/sky'

// 1-hour ISR — keeps "today" highlight fresh and lets new cities (outside
// the prebuilt 1,200) render on first request.
export const revalidate = 3600

interface Params {
  city: string
  month: string
}

export async function generateStaticParams() {
  const topCities = getTopCities(100)
  const params: Array<{ city: string; month: string }> = []
  for (const c of topCities) {
    for (const m of MONTHS) {
      params.push({ city: c.slug, month: m.slug })
    }
  }
  return params
}

export const dynamicParams = true

// ----- Metadata -------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Params },
): Promise<Metadata> {
  const city = getCityBySlug(params.city)
  const month = getMonthBySlug(params.month)
  if (!city || !month) return { title: 'Not found' }

  const year = new Date().getUTCFullYear()
  const days = getMonthlyDaylight(city.lat, city.lon, year, month.index)
  const stats = computeStats(days)

  const desc = stats.allMidnightSun
    ? `${city.name} stays in midnight sun throughout ${month.name} ${year} — 24 hours of daylight every day.`
    : stats.allPolarNight
    ? `${city.name} is in polar night throughout ${month.name} ${year} — the sun does not rise.`
    : `Daylight in ${city.name}, ${city.country} in ${month.name} ${year}: average ${formatDuration(stats.avg)}, longest ${formatDuration(stats.max)}, shortest ${formatDuration(stats.min)}.`

  const canonical = `https://howlongday.com/${city.slug}/${month.slug}`
  return {
    title: `Daylight in ${city.name} in ${month.name} ${year}`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${city.name} sunrise & sunset in ${month.name}`,
      description: desc,
      url: canonical,
      type: 'website',
    },
  }
}

// ----- Helpers --------------------------------------------------------------

interface MonthStats {
  avg: number
  min: number
  max: number
  minDay: number
  maxDay: number
  allMidnightSun: boolean
  allPolarNight: boolean
  anyMidnightSun: boolean
  anyPolarNight: boolean
}

function computeStats(days: DaySolarSnapshot[]): MonthStats {
  let sum = 0
  let min = Infinity
  let max = -Infinity
  let minDay = 1
  let maxDay = 1
  let midnightSunDays = 0
  let polarNightDays = 0
  for (const d of days) {
    sum += d.daylightSeconds
    if (d.daylightSeconds < min) {
      min = d.daylightSeconds
      minDay = d.day
    }
    if (d.daylightSeconds > max) {
      max = d.daylightSeconds
      maxDay = d.day
    }
    if (d.isMidnightSun) midnightSunDays++
    if (d.isPolarNight) polarNightDays++
  }
  return {
    avg: sum / days.length,
    min,
    max,
    minDay,
    maxDay,
    allMidnightSun: midnightSunDays === days.length,
    allPolarNight: polarNightDays === days.length,
    anyMidnightSun: midnightSunDays > 0,
    anyPolarNight: polarNightDays > 0,
  }
}

function buildFaq(opts: {
  cityName: string
  country: string
  monthName: string
  year: number
  stats: MonthStats
  hemisphere: 'north' | 'south' | 'equatorial'
}): FaqEntry[] {
  const { cityName, country, monthName, year, stats, hemisphere } = opts

  const summer =
    hemisphere === 'north'
      ? ['May', 'June', 'July', 'August']
      : hemisphere === 'south'
      ? ['November', 'December', 'January', 'February']
      : []

  const isSummerMonth = summer.includes(monthName)

  return [
    {
      q: `How long is daylight in ${cityName} in ${monthName}?`,
      a: stats.allMidnightSun
        ? `${cityName} is in midnight sun for the entire month of ${monthName} ${year} — daylight lasts all 24 hours every day.`
        : stats.allPolarNight
        ? `${cityName} is in polar night for the entire month of ${monthName} ${year} — the sun does not rise above the horizon.`
        : `Daylight in ${cityName} in ${monthName} ${year} averages ${formatDuration(stats.avg)} per day, ranging from ${formatDuration(stats.min)} on the shortest day (the ${ordinal(stats.minDay)}) to ${formatDuration(stats.max)} on the longest day (the ${ordinal(stats.maxDay)}).`,
    },
    {
      q: `When is the longest day of ${monthName} in ${cityName}?`,
      a: stats.allMidnightSun
        ? `Every day in ${monthName} ${year} is equally long — 24 hours of daylight — because of ${cityName}'s extreme latitude.`
        : `The longest day in ${monthName} ${year} in ${cityName} is the ${ordinal(stats.maxDay)}, with ${formatDuration(stats.max)} of daylight.`,
    },
    {
      q: `When is the shortest day of ${monthName} in ${cityName}?`,
      a: stats.allPolarNight
        ? `Every day is equally dark in ${monthName} ${year} in ${cityName} — the sun does not rise.`
        : `The shortest day in ${monthName} ${year} in ${cityName} is the ${ordinal(stats.minDay)}, with ${formatDuration(stats.min)} of daylight.`,
    },
    {
      q: `Does ${cityName} have midnight sun in ${monthName}?`,
      a: stats.anyMidnightSun
        ? `Yes — ${cityName} experiences midnight sun on some days in ${monthName} ${year}. The sun stays above the horizon all 24 hours on those days.`
        : isSummerMonth && hemisphere !== 'equatorial'
        ? `No — ${cityName} does not have midnight sun in ${monthName}, but daylight is at its longest during this season.`
        : `No — ${cityName}'s latitude is below the Arctic / Antarctic Circle (66.5°), so the sun rises and sets every day.`,
    },
    {
      q: `What time does the sun rise and set in ${cityName} in ${monthName}?`,
      a: stats.allMidnightSun
        ? `In ${monthName} ${year}, the sun does not rise or set in ${cityName} — it stays above the horizon all month.`
        : stats.allPolarNight
        ? `In ${monthName} ${year}, the sun does not rise above the horizon in ${cityName}.`
        : `Sunrise and sunset shift several minutes each day in ${monthName} ${year}. See the calendar above for the exact time each day in ${cityName}, ${country}.`,
    },
  ]
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function hemisphereOf(lat: number): 'north' | 'south' | 'equatorial' {
  if (lat > 10) return 'north'
  if (lat < -10) return 'south'
  return 'equatorial'
}

// ----- Page -----------------------------------------------------------------

export default function CityMonthPage({ params }: { params: Params }) {
  const city = getCityBySlug(params.city)
  const month = getMonthBySlug(params.month)
  if (!city || !month) notFound()

  const now = new Date()
  const year = now.getUTCFullYear()
  const days = getMonthlyDaylight(city.lat, city.lon, year, month.index)
  const stats = computeStats(days)

  // Sky preview: middle of the month at local noon, approximated via UTC noon.
  const previewDate = new Date(Date.UTC(year, month.index, Math.min(15, days.length), 12))
  const previewSky = getSkyGradient(
    // At "local noon" the elevation peaks. Use solstice-style proxy:
    // we approximate by reading the average daylight to choose a band.
    pickElevationProxy(stats),
    false,
  )

  // Today highlight: only when this page is the current real month
  const isCurrentMonth =
    now.getUTCFullYear() === year && now.getUTCMonth() === month.index
  const todayDay = isCurrentMonth ? now.getUTCDate() : null

  // Previous/Next month nav links
  const prevMonth = MONTHS[(month.index + 11) % 12]
  const nextMonth = MONTHS[(month.index + 1) % 12]

  const faq = buildFaq({
    cityName: city.name,
    country: city.country,
    monthName: month.name,
    year,
    stats,
    hemisphere: hemisphereOf(city.lat),
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: city.name,
        item: `https://howlongday.com/${city.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${month.name} ${year}`,
        item: `https://howlongday.com/${city.slug}/${month.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero with sky preview */}
      <section
        className="relative overflow-hidden"
        style={{ background: previewSky.gradient }}
      >
        {/* Subtle bottom fade into page bg */}
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
            <li>
              <Link href="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link href={`/${city.slug}`} className="text-white/85 hover:text-white">
                {city.name} today
              </Link>
            </li>
          </ul>
        </nav>

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            <Link href={`/${city.slug}`} className="hover:text-white">
              {city.name}, {city.country}
            </Link>{' '}
            · {month.name} {year}
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl md:text-6xl">
            Daylight in {city.name} in {month.name} {year}
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              label="Average daylight"
              value={formatDuration(stats.avg)}
              accent="text-daylight"
            />
            <StatCard
              label={`Longest day · ${ordinal(stats.maxDay)}`}
              value={
                stats.allMidnightSun ? '24h' : formatDuration(stats.max)
              }
              accent="text-sunrise"
            />
            <StatCard
              label={`Shortest day · ${ordinal(stats.minDay)}`}
              value={
                stats.allPolarNight ? '0h' : formatDuration(stats.min)
              }
              accent="text-sunset"
            />
          </div>

          {(stats.anyMidnightSun || stats.anyPolarNight) && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.7rem] uppercase tracking-widecaps text-white/85 backdrop-blur-sm">
              {stats.anyMidnightSun && '☀️ Midnight sun this month'}
              {stats.anyMidnightSun && stats.anyPolarNight && ' · '}
              {stats.anyPolarNight && '🌑 Polar night this month'}
            </p>
          )}
        </div>
      </section>

      {/* Calendar */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-white text-2xl sm:text-3xl">
              Day by day
            </h2>
            <div className="hidden gap-3 text-sm text-neutral-3 sm:flex">
              <Link
                href={`/${city.slug}/${prevMonth.slug}`}
                className="rounded-full border border-white/10 px-4 py-1.5 hover:border-white/25 hover:text-white"
              >
                ← {prevMonth.name}
              </Link>
              <Link
                href={`/${city.slug}/${nextMonth.slug}`}
                className="rounded-full border border-white/10 px-4 py-1.5 hover:border-white/25 hover:text-white"
              >
                {nextMonth.name} →
              </Link>
            </div>
          </div>

          <MonthCalendar
            days={days}
            firstWeekday={monthFirstWeekday(year, month.index)}
            timezone={city.timezone}
            todayDay={todayDay}
          />

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[0.65rem] uppercase tracking-widecaps text-neutral-4">
            <span><span className="text-sunrise">↑</span> Sunrise</span>
            <span><span className="text-sunset">↓</span> Sunset</span>
            <span><span className="text-daylight">●</span> Daylight</span>
            <span>Times shown in {city.timezone}</span>
          </div>

          {/* Mobile prev/next */}
          <div className="mt-6 flex gap-3 text-sm text-neutral-3 sm:hidden">
            <Link
              href={`/${city.slug}/${prevMonth.slug}`}
              className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center hover:border-white/25 hover:text-white"
            >
              ← {prevMonth.name}
            </Link>
            <Link
              href={`/${city.slug}/${nextMonth.slug}`}
              className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center hover:border-white/25 hover:text-white"
            >
              {nextMonth.name} →
            </Link>
          </div>
        </div>
      </section>

      {/* SEO + FAQ */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-balance text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {monthIntroHeading(month.name, city.name)}
              </h2>
              <div className="mt-5 space-y-4 max-w-prose text-base leading-relaxed text-neutral-2">
                {monthIntroParagraphs({
                  cityName: city.name,
                  country: city.country,
                  monthName: month.name,
                  year,
                  stats,
                  lat: city.lat,
                  timezone: city.timezone,
                  firstSunrise: days[0]?.sunrise,
                  firstSunset: days[0]?.sunset,
                  lastSunrise: days[days.length - 1]?.sunrise,
                  lastSunset: days[days.length - 1]?.sunset,
                }).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <FaqAccordion items={faq} />
          </div>
        </div>
      </section>

      {/* Features bar + footer reused */}
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

// ----- Presentation helpers -------------------------------------------------

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
        {label}
      </div>
      <div className={`mt-2 font-semibold text-2xl tabular-nums sm:text-3xl ${accent}`}>
        {value}
      </div>
    </div>
  )
}

function monthIntroHeading(monthName: string, cityName: string): string {
  return `Sunrise, sunset and daylight in ${cityName} during ${monthName}`
}

function monthIntroParagraphs(opts: {
  cityName: string
  country: string
  monthName: string
  year: number
  stats: MonthStats
  lat: number
  timezone: string
  firstSunrise?: Date
  firstSunset?: Date
  lastSunrise?: Date
  lastSunset?: Date
}): string[] {
  const {
    cityName, country, monthName, year, stats, lat, timezone,
    firstSunrise, firstSunset, lastSunrise, lastSunset,
  } = opts

  if (stats.allMidnightSun) {
    return [
      `Every day of ${monthName} ${year} in ${cityName}, ${country} is a full 24 hours of daylight. The sun never crosses below the horizon — this is the midnight sun, a consequence of ${cityName}'s extreme northern latitude of ${lat.toFixed(1)}°.`,
      `Local clock time still ticks normally, but the sky never fully darkens. Late-evening colour shifts replace the night, and "golden hour" effectively lasts for hours either side of midnight.`,
    ]
  }

  if (stats.allPolarNight) {
    return [
      `${cityName} is in continuous polar night for the entire month of ${monthName} ${year}. The sun does not rise above the horizon at any point, and what passes for "day" is a long blue twilight.`,
      `Sunrise will return only after the sun's path climbs high enough to break the horizon — typically several weeks after the December solstice, depending on latitude.`,
    ]
  }

  const firstSr = firstSunrise ? formatLocalTime(firstSunrise, timezone) : '—'
  const firstSs = firstSunset ? formatLocalTime(firstSunset, timezone) : '—'
  const lastSr = lastSunrise ? formatLocalTime(lastSunrise, timezone) : '—'
  const lastSs = lastSunset ? formatLocalTime(lastSunset, timezone) : '—'
  const trendShorter = stats.maxDay <= stats.minDay
  const trend = trendShorter ? 'shortening' : 'lengthening'

  return [
    `In ${cityName}, ${country}, daylight in ${monthName} ${year} averages ${formatDuration(stats.avg)} per day. The month opens with sunrise at ${firstSr} and sunset at ${firstSs}; it closes with sunrise at ${lastSr} and sunset at ${lastSs}.`,
    `Across the month the days are ${trend} — the longest falls on the ${ordinal(stats.maxDay)} with ${formatDuration(stats.max)} of daylight, while the shortest is the ${ordinal(stats.minDay)} at ${formatDuration(stats.min)}. The calendar above lists the exact sunrise, sunset and daylight length for every day.`,
    `All times are shown in ${cityName}'s local timezone (${timezone}). For a real-time view of the current sun position, see the ${cityName} page.`,
  ]
}

function pickElevationProxy(stats: MonthStats): number {
  // Map average daylight to a representative solar elevation for the
  // sky-gradient preview. Long days -> peak sun; short days -> low sun.
  const hours = stats.avg / 3600
  if (hours >= 16) return 55
  if (hours >= 13) return 35
  if (hours >= 10) return 18
  if (hours >= 7) return 8
  return -3 // twilight band
}
