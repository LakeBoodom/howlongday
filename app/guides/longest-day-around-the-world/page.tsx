/**
 * Editorial guide: Longest Day of the Year Around the World.
 *
 * A data-driven, linkable "authority" page — ranks a curated global set of
 * cities by their annual longest day (the summer-solstice daylight length for
 * their hemisphere), computed from SunCalc, with internal links to each city.
 * Static (data is annual), so it prebuilds with zero runtime cost.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { getCityBySlug, type City } from '@/lib/cities'
import { getMaxDaylight, formatDuration } from '@/lib/astronomy'

const YEAR = new Date().getUTCFullYear()
const CANONICAL = 'https://howlongday.com/guides/longest-day-around-the-world'

// Curated to span the latitude range, Arctic to sub-Antarctic.
const CITY_SLUGS = [
  'tromso', 'reykjavik', 'anchorage', 'helsinki', 'oslo', 'stockholm',
  'saint-petersburg', 'london', 'berlin', 'paris', 'new-york-city',
  'tokyo', 'los-angeles', 'cairo', 'mumbai', 'singapore', 'nairobi',
  'rio-de-janeiro', 'cape-town', 'sydney', 'buenos-aires', 'queenstown',
  'ushuaia',
]

export const metadata: Metadata = {
  title: {
    absolute: 'The Longest Day of the Year Around the World',
  },
  description:
    'How long is the longest day where you are? A ranked comparison of summer-solstice daylight in cities from the Arctic to Patagonia — from 24-hour midnight sun to a steady 12 hours at the equator.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'The Longest Day of the Year Around the World',
    description:
      'Summer-solstice daylight ranked, from Arctic midnight sun to the equator.',
    url: CANONICAL,
    type: 'article',
  },
}

interface Row {
  city: City
  longestSeconds: number
  whenLabel: string
}

export default function LongestDayGuide() {
  const rows: Row[] = CITY_SLUGS.map((slug) => getCityBySlug(slug))
    .filter((c): c is City => c !== null)
    .map((city) => ({
      city,
      longestSeconds: getMaxDaylight(city.lat, city.lon, YEAR),
      whenLabel: city.lat >= 0 ? `June 21` : `December 21`,
    }))
    .sort((a, b) => b.longestSeconds - a.longestSeconds)

  const top = rows[0]
  const equatorial = rows.find((r) => Math.abs(r.city.lat) < 10)

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a1f3d 0%, #1a4080 50%, #e8943a 140%)' }}
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
          </ul>
        </nav>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            Guide
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl">
            The longest day of the year around the world
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85">
            On the summer solstice, the length of the longest day depends almost
            entirely on latitude. Near the poles the sun never sets; at the
            equator the day barely changes all year. Here is how {rows.length}{' '}
            cities compare.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <div className="space-y-4 text-base leading-relaxed text-neutral-2">
          <p>
            The summer solstice — around <strong>June 21</strong> in the
            Northern Hemisphere and <strong>December 21</strong> in the Southern
            — is the day the sun climbs highest and stays up longest. The further
            you are from the equator, the more extreme the effect.
          </p>
          {top && (
            <p>
              At the top of the list, <Link href={`/${top.city.slug}`} className="text-daylight underline-offset-2 hover:underline">{top.city.name}</Link>{' '}
              gets {top.longestSeconds >= 86_399 ? 'a full 24 hours of daylight — the midnight sun' : `${formatDuration(top.longestSeconds)} of daylight`} on its longest day.
              {equatorial && (
                <> Near the equator, <Link href={`/${equatorial.city.slug}`} className="text-daylight underline-offset-2 hover:underline">{equatorial.city.name}</Link> barely moves from {formatDuration(equatorial.longestSeconds)} — about 12 hours, all year round.</>
              )}
            </p>
          )}
        </div>

        <div className="mt-10 overflow-x-auto rounded-card border border-white/10">
          <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Latitude</th>
                <th className="px-4 py-3 font-medium text-daylight">Longest day</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.city.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-neutral-4">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/${r.city.slug}`} className="text-white hover:text-daylight">
                      {r.city.name}
                    </Link>
                    <span className="ml-2 text-xs text-neutral-4">{r.city.country}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-3">{r.city.lat.toFixed(1)}°</td>
                  <td className="px-4 py-3 text-daylight">
                    {r.longestSeconds >= 86_399 ? '24h (midnight sun)' : formatDuration(r.longestSeconds)}
                  </td>
                  <td className="px-4 py-3 text-neutral-3">{r.whenLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-neutral-4">
          Longest-day figures are the daylight length on each city&apos;s summer
          solstice ({YEAR}), computed from its latitude and longitude. Tap any
          city for today&apos;s sunrise, sunset and a 7-day forecast.
        </p>

        <div className="mt-10 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Keep exploring
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/best-cities-for-long-summer-evenings" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Best cities for long summer evenings →
            </Link>
            <Link href="/country/norway" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Daylight in Norway
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
