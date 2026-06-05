/**
 * /[city]/[month] — month-specific daylight calendar pages.
 *
 * Each page targets the search intent "how long is daylight in {City} in
 * {Month}" — a high-volume long-tail query. We render a day-by-day calendar
 * grid, summary stats (average / longest / shortest day), and FAQPage JSON-LD.
 *
 * Build strategy: top 1000 cities × 12 months = 12,000 prebuilt pages.
 * Remaining city/month combinations render on-demand via ISR (revalidate=30d).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Logo } from '@/components/Logo'
import { MonthCalendar } from '@/components/MonthCalendar'
import { MonthBrowser } from '@/components/MonthBrowser'
import { FaqAccordion, type FaqEntry } from '@/components/FaqAccordion'

import { getCityBySlug, getTopCities, isTopCity } from '@/lib/cities'
import { MONTHS, getMonthBySlug, firstWeekday as monthFirstWeekday } from '@/lib/months'
import {
  getMonthlyDaylight,
  getYearlyMonthlySummaries,
  formatLocalTime,
  formatDuration,
  type DaySolarSnapshot,
} from '@/lib/astronomy'
import { getSkyGradient } from '@/lib/sky'

// 30-day ISR — monthly daylight stats are essentially year-bound and don't
// change within a month. The "today" highlight on the current month can lag
// by up to 30 days (acceptable trade-off vs. ISR Writes cost). New cities
// outside the prebuilt 1,200 still render on first request.
export const revalidate = 2592000

interface Params {
  city: string
  month: string
}

export async function generateStaticParams() {
  const topCities = getTopCities(1000)
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
  lat: number
  timezone: string
  firstSunset?: Date
  lastSunset?: Date
  firstDaylight?: number
  lastDaylight?: number
  totalDays?: number
}): FaqEntry[] {
  const {
    cityName, country, monthName, year, stats, hemisphere, lat, timezone,
    firstSunset, lastSunset, firstDaylight, lastDaylight, totalDays,
  } = opts

  const avgHours = stats.avg / 3600
  const firstSs = firstSunset ? formatLocalTime(firstSunset, timezone) : '—'
  const lastSs = lastSunset ? formatLocalTime(lastSunset, timezone) : '—'

  const dailyChangeSec =
    firstDaylight != null && lastDaylight != null && totalDays && totalDays > 1
      ? (lastDaylight - firstDaylight) / (totalDays - 1)
      : null
  const gaining = dailyChangeSec != null ? dailyChangeSec > 0 : stats.maxDay > stats.minDay
  const absChangeMin = dailyChangeSec != null ? Math.abs(dailyChangeSec / 60) : null
  const totalChangeMin =
    firstDaylight != null && lastDaylight != null
      ? Math.abs(lastDaylight - firstDaylight) / 60
      : null
  const totalChangeDesc =
    totalChangeMin != null
      ? totalChangeMin >= 60
        ? `${(totalChangeMin / 60).toFixed(1)} hours`
        : `${Math.round(totalChangeMin)} minutes`
      : null

  const faqs: FaqEntry[] = []

  // Q1: How long is daylight? (universal, high-value SEO query)
  faqs.push({
    q: `How long is daylight in ${cityName} in ${monthName}?`,
    a: stats.allMidnightSun
      ? `${cityName} is in midnight sun for the entire month of ${monthName} ${year} — daylight lasts all 24 hours every day.`
      : stats.allPolarNight
      ? `${cityName} is in polar night for the entire month of ${monthName} ${year} — the sun does not rise above the horizon.`
      : `Daylight in ${cityName} in ${monthName} ${year} averages ${formatDuration(stats.avg)} per day, ranging from ${formatDuration(stats.min)} on the ${ordinal(stats.minDay)} to ${formatDuration(stats.max)} on the ${ordinal(stats.maxDay)}.`,
  })

  // Q2: Longest day (planning-useful)
  faqs.push({
    q: `When is the longest day of ${monthName} in ${cityName}?`,
    a: stats.allMidnightSun
      ? `Every day in ${monthName} ${year} is equally long — 24 hours of daylight — because of ${cityName}'s extreme latitude.`
      : `The longest day in ${monthName} ${year} in ${cityName} is the ${ordinal(stats.maxDay)}, with ${formatDuration(stats.max)} of daylight.`,
  })

  // Q3: What time does it get dark? (highly searched planning query)
  if (!stats.allMidnightSun && !stats.allPolarNight) {
    faqs.push({
      q: `What time does it get dark in ${cityName} in ${monthName}?`,
      a: firstSs === lastSs
        ? `Sunset in ${cityName} during ${monthName} ${year} falls around ${firstSs}. Civil twilight — when it becomes fully dark — follows roughly 20–30 minutes after sunset.`
        : `Sunset in ${cityName} shifts from ${firstSs} at the start of ${monthName} to ${lastSs} by the end of the month. Civil twilight follows about 20–30 minutes after each sunset.`,
    })
  } else if (stats.allPolarNight) {
    faqs.push({
      q: `Is there any daylight in ${cityName} in ${monthName}?`,
      a: `No — ${cityName} is in polar night for the entire month of ${monthName} ${year}. The sun stays below the horizon all day, though a brief civil twilight around midday provides some dim natural light.`,
    })
  }

  // Q4: Activity / planning — contextual based on daylight level
  if (!stats.allMidnightSun && !stats.allPolarNight) {
    if (avgHours >= 14) {
      faqs.push({
        q: `Can I play golf or hike late in the day in ${cityName} in ${monthName}?`,
        a: `Yes — with sunset at ${lastSs} by the end of ${monthName}, there is plenty of light for after-work outdoor plans in ${cityName}. Golf rounds, evening hikes, and outdoor dining all benefit from the extended daylight.`,
      })
    } else if (avgHours >= 11 && gaining) {
      faqs.push({
        q: `Is ${monthName} a good time for outdoor activities in ${cityName}?`,
        a: `${monthName} is a good — and improving — month for outdoor plans in ${cityName}. Days are lengthening noticeably${absChangeMin && absChangeMin >= 2 ? `, gaining around ${Math.round(absChangeMin)} minutes per day` : ''}, and by the end of the month evening activities become increasingly viable. Sunset reaches ${lastSs} by month's end.`,
      })
    } else if (avgHours >= 11) {
      faqs.push({
        q: `What outdoor activities work well in ${cityName} in ${monthName}?`,
        a: `With around ${formatDuration(stats.avg)} of daylight per day, ${monthName} in ${cityName} supports most outdoor activities. Morning and evening both have usable light, with sunset around ${lastSs} by the end of the month.`,
      })
    } else if (avgHours >= 7 && !gaining) {
      faqs.push({
        q: `How should I plan outdoor activities in ${cityName} in ${monthName}?`,
        a: `As days shorten through ${monthName} in ${cityName}, outdoor activities are best planned around midday. Sunset falls around ${lastSs} by the end of the month — evening plans become limited. Hiking and sport work best in the middle of the day.`,
      })
    } else {
      faqs.push({
        q: `How do short days in ${monthName} affect plans in ${cityName}?`,
        a: `With only around ${formatDuration(stats.avg)} of daylight in ${monthName}, most natural light in ${cityName} falls in a narrow midday window. Outdoor plans need to centre on this window.${gaining ? ` The trend is upward from here — each week brings a few more minutes of light back.` : ` The December solstice marks the turning point after which every day grows longer.`}`,
      })
    }
  } else if (stats.allMidnightSun) {
    faqs.push({
      q: `What is it like to experience midnight sun in ${cityName}?`,
      a: `During ${monthName} ${year}, the sun never sets in ${cityName} — the sky stays bright all night. This makes it easy to be outdoors at any hour, but can disrupt sleep without blackout curtains. Golden hour lasts for hours around midnight, making it a favourite time for photographers.`,
    })
  }

  // Q5: Midnight sun only for high-latitude cities; rate-of-change for everyone else
  if (Math.abs(lat) >= 60 || stats.anyMidnightSun || stats.anyPolarNight) {
    faqs.push({
      q: `Does ${cityName} have midnight sun or polar night in ${monthName}?`,
      a: stats.allMidnightSun
        ? `Yes — ${cityName} is in midnight sun for the entire month of ${monthName} ${year}. The sun stays above the horizon all 24 hours every day.`
        : stats.anyMidnightSun
        ? `Yes — ${cityName} experiences midnight sun on some days in ${monthName} ${year}. The sun stays above the horizon all 24 hours on those days.`
        : stats.allPolarNight
        ? `Yes — ${cityName} is in polar night for all of ${monthName} ${year}. The sun does not rise above the horizon.`
        : stats.anyPolarNight
        ? `Yes — ${cityName} has some days of polar night in ${monthName} ${year}.`
        : `Not in ${monthName} — but ${cityName}'s latitude of ${lat.toFixed(1)}° means midnight sun and polar night occur in other months of the year.`,
    })
  } else if (absChangeMin != null && absChangeMin >= 1 && totalChangeDesc) {
    faqs.push({
      q: `How does daylight change through ${monthName} in ${cityName}?`,
      a: `Days ${gaining ? 'lengthen' : 'shorten'} by around ${absChangeMin.toFixed(0)} minute${absChangeMin >= 1.5 ? 's' : ''} per day through ${monthName} in ${cityName}. From the 1st to the last day of the month, the total shift is ${totalChangeDesc} of daylight${absChangeMin >= 3 ? ' — one of the fastest-changing months of the year' : ''}.`,
    })
  } else {
    faqs.push({
      q: `Is ${monthName} close to the longest or shortest day of the year in ${cityName}?`,
      a: avgHours >= 10
        ? `Yes — ${monthName} is near ${cityName}'s annual peak daylight around the June solstice. Days change by less than a minute per day, staying consistently bright throughout the month.`
        : `Yes — ${monthName} is near ${cityName}'s annual minimum daylight around the December solstice. Days change very slowly and stay consistently dark throughout the month.`,
    })
  }

  return faqs
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

  // Cross-month navigation visibility.
  //
  // Shown for the top-1000 SSG-prebuilt city set. For the ~48k tail cities
  // we hide both the chips and the 12-tile strip — letting Googlebot walk
  // chains from a tail-city month page would multiply ISR cost by 12× per
  // discovered city. Users typing a month URL directly still get the page.
  //
  // For top-1000 cities the math is bounded: ~10,800 potential month-page
  // ISR writes (10,800 = top-101..1000 × 12 months), revalidated every 30d,
  // well within Vercel's free-tier 200k/month limit.
  const cityIsPrebuilt = isTopCity(city.slug, 1000)
  const prevMonth = cityIsPrebuilt ? MONTHS[(month.index + 11) % 12] : null
  const nextMonth = cityIsPrebuilt ? MONTHS[(month.index + 1) % 12] : null

  const monthSummaries = cityIsPrebuilt
    ? getYearlyMonthlySummaries(city.lat, city.lon, year)
    : null

  const faq = buildFaq({
    cityName: city.name,
    country: city.country,
    monthName: month.name,
    year,
    stats,
    hemisphere: hemisphereOf(city.lat),
    lat: city.lat,
    timezone: city.timezone,
    firstSunset: days[0]?.sunset,
    lastSunset: days[days.length - 1]?.sunset,
    firstDaylight: days[0]?.daylightSeconds,
    lastDaylight: days[days.length - 1]?.daylightSeconds,
    totalDays: days.length,
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
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-semibold text-white text-2xl sm:text-3xl">
              Day by day
            </h2>
            {prevMonth && nextMonth && (
              <div className="hidden gap-2 text-sm text-neutral-3 sm:flex">
                <Link
                  href={`/${city.slug}/${prevMonth.slug}`}
                  aria-label={`Previous month — ${prevMonth.name}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-white"
                >
                  ← {prevMonth.short}
                </Link>
                <Link
                  href={`/${city.slug}/${nextMonth.slug}`}
                  aria-label={`Next month — ${nextMonth.name}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:text-white"
                >
                  {nextMonth.short} →
                </Link>
              </div>
            )}
          </div>

          <MonthCalendar
            days={days}
            firstWeekday={monthFirstWeekday(year, month.index)}
            timezone={city.timezone}
            todayDay={todayDay}
          />

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[0.65rem] uppercase tracking-widecaps text-neutral-4">
            <span className="hidden sm:inline"><span className="text-sunrise">↑</span> Sunrise</span>
            <span className="hidden sm:inline"><span className="text-sunset">↓</span> Sunset</span>
            <span><span className="text-daylight">●</span> Daylight</span>
            <span className="hidden sm:inline">Times shown in {city.timezone}</span>
            <span className="sm:hidden text-neutral-4">Rotate for sunrise &amp; sunset times · {city.timezone}</span>
          </div>
        </div>
      </section>

      {monthSummaries && (
        <MonthBrowser
          citySlug={city.slug}
          cityName={city.name}
          year={year}
          summaries={monthSummaries}
          currentMonthIndex={month.index}
          highlightLabel="Viewing"
        />
      )}

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
                  firstDaylight: days[0]?.daylightSeconds,
                  lastDaylight: days[days.length - 1]?.daylightSeconds,
                  totalDays: days.length,
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
  firstDaylight?: number
  lastDaylight?: number
  totalDays?: number
}): string[] {
  const {
    cityName, country, monthName, year, stats, lat, timezone,
    firstSunrise, firstSunset, lastSunrise, lastSunset,
    firstDaylight, lastDaylight, totalDays,
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

  const paragraphs: string[] = []

  // --- Paragraph 1: overview ---
  paragraphs.push(
    `In ${cityName}, ${country}, daylight in ${monthName} ${year} averages ${formatDuration(stats.avg)} per day. The month opens with sunrise at ${firstSr} and sunset at ${firstSs}; it closes with sunrise at ${lastSr} and sunset at ${lastSs}.`,
  )

  // --- Paragraph 2: rate of change ---
  const dailyChangeSec =
    firstDaylight != null && lastDaylight != null && totalDays && totalDays > 1
      ? (lastDaylight - firstDaylight) / (totalDays - 1)
      : null

  if (dailyChangeSec != null) {
    const absMin = Math.abs(dailyChangeSec / 60)
    const totalChangeMin =
      Math.abs((lastDaylight ?? 0) - (firstDaylight ?? 0)) / 60
    const totalChangeH = totalChangeMin / 60
    const gaining = dailyChangeSec > 0
    const totalDesc =
      totalChangeH >= 1
        ? `${totalChangeH.toFixed(1)} hour${totalChangeH >= 1.5 ? 's' : ''}`
        : `${Math.round(totalChangeMin)} minutes`

    let trendSentence: string
    if (absMin < 0.8) {
      const isLongDay = stats.avg > 10 * 3600
      trendSentence = `Daylight barely shifts from one day to the next in ${monthName} — ${cityName} is near its annual ${isLongDay ? 'peak' : 'minimum'}, with changes of less than a minute per day.`
    } else if (absMin < 3) {
      trendSentence = `Days are ${gaining ? 'lengthening' : 'shortening'} by around ${absMin.toFixed(0)} minute${absMin >= 1.5 ? 's' : ''} per day through ${monthName}, adding up to a total shift of ${totalDesc} from the 1st to the last day of the month.`
    } else {
      trendSentence = `Days are ${gaining ? 'gaining' : 'losing'} around ${Math.round(absMin)} minutes each day — making ${monthName} one of the fastest-changing months of the year in ${cityName}. From start to finish the month sees a total ${gaining ? 'gain' : 'loss'} of ${totalDesc} of daylight.`
    }
    paragraphs.push(trendSentence)
  } else {
    const trendShorter = stats.maxDay <= stats.minDay
    const trend = trendShorter ? 'shortening' : 'lengthening'
    paragraphs.push(
      `Across the month the days are ${trend} — the longest falls on the ${ordinal(stats.maxDay)} with ${formatDuration(stats.max)} of daylight, while the shortest is the ${ordinal(stats.minDay)} at ${formatDuration(stats.min)}.`,
    )
  }

  // --- Paragraph 3: planning context ---
  const avgHours = stats.avg / 3600
  const gaining = dailyChangeSec != null ? dailyChangeSec > 0 : stats.maxDay > stats.minDay

  if (avgHours >= 15) {
    paragraphs.push(
      `With sunset falling after ${lastSs.split(':')[0]}:00 for much of the month, ${monthName} is prime time for outdoor plans in ${cityName}. After-work golf rounds, evening hikes, and long outdoor dinners are all within reach — make the most of it.`,
    )
  } else if (avgHours >= 12) {
    paragraphs.push(
      `${monthName} offers a solid daily window for outdoor activity in ${cityName}. With around ${Math.round(avgHours)} hours of daylight, there is light both in the morning and the evening for most plans.`,
    )
  } else if (avgHours >= 8) {
    if (gaining) {
      paragraphs.push(
        `For anyone waiting out the darker months in ${cityName}, ${monthName} brings welcome progress. Each passing week adds a noticeable chunk of light — by the end of the month, evening plans begin to feel realistic again.`,
      )
    } else {
      paragraphs.push(
        `As days shorten through ${monthName}, outdoor activity in ${cityName} is best planned around midday. Early evenings darken quickly — hiking, cycling and outdoor sport work best in the middle of the day.`,
      )
    }
  } else {
    // Dark winter
    if (gaining) {
      paragraphs.push(
        `The short days in ${monthName} are felt strongly at ${cityName}'s latitude — most usable daylight is compressed into the midday window. The encouraging news: the trend is upward from here, and each week in ${monthName} reclaims a few more minutes of light.`,
      )
    } else {
      paragraphs.push(
        `At ${cityName}'s latitude, ${monthName} is among the darkest months of the year. Most daylight falls in a narrow midday window — plan any outdoor activity between ${firstSr} and ${firstSs} to make the most of it. The December solstice marks the turning point after which every day grows a little longer.`,
      )
    }
  }

  // --- Paragraph 4: timezone note ---
  paragraphs.push(
    `All times are shown in ${cityName}'s local timezone (${timezone}). For a real-time view of the current sun position, see the ${cityName} today page.`,
  )

  return paragraphs
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
