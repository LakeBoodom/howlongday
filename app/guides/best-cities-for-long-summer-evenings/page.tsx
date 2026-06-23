/**
 * Editorial guide: Best European Cities for Long Summer Evenings.
 *
 * Ranks a curated set of European cities by midsummer daylight (June-solstice
 * day length) and shows how late the sun sets on the solstice — the practical
 * measure of a "long summer evening". Data computed from SunCalc; static.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { getCityBySlug, type City } from '@/lib/cities'
import {
  getSolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

const YEAR = new Date().getUTCFullYear()
const CANONICAL =
  'https://howlongday.com/guides/best-cities-for-long-summer-evenings'

// June solstice (noon UTC) — the longest day in the Northern Hemisphere.
const SOLSTICE = new Date(Date.UTC(YEAR, 5, 21, 12))

const CITY_SLUGS = [
  'tromso', 'reykjavik', 'helsinki', 'oslo', 'stockholm', 'tallinn',
  'copenhagen', 'riga', 'edinburgh', 'dublin', 'amsterdam', 'berlin',
  'warsaw', 'london', 'prague', 'vienna', 'paris', 'madrid', 'rome',
  'lisbon', 'athens',
]

export const metadata: Metadata = {
  title: {
    absolute: 'Best European Cities for Long Summer Evenings',
  },
  description:
    'Where in Europe does the summer sun stay up latest? A ranked guide to the cities with the longest midsummer days and latest sunsets — from Nordic white nights to the late Mediterranean dusk.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Best European Cities for Long Summer Evenings',
    description:
      'European cities ranked by midsummer daylight and how late the sun sets.',
    url: CANONICAL,
    type: 'article',
  },
}

interface Row {
  city: City
  daylightSeconds: number
  sunset: string
  midnightSun: boolean
}

export default function LongSummerEveningsGuide() {
  const rows: Row[] = CITY_SLUGS.map((slug) => getCityBySlug(slug))
    .filter((c): c is City => c !== null)
    .map((city) => {
      const snap = getSolarSnapshot(SOLSTICE, city.lat, city.lon)
      return {
        city,
        daylightSeconds: snap.isMidnightSun ? 86_400 : snap.daylightSeconds,
        sunset: snap.isMidnightSun ? '—' : formatLocalTime(snap.sunset, city.timezone),
        midnightSun: snap.isMidnightSun,
      }
    })
    .sort((a, b) => b.daylightSeconds - a.daylightSeconds)

  return (
    <>
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
          </ul>
        </nav>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            Guide
          </p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl">
            Best European cities for long summer evenings
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85">
            Long, lingering evenings are one of the great pleasures of a European
            summer. Here are {rows.length} cities ranked by how much daylight
            they get on the June solstice — and how late the sun goes down.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <div className="space-y-4 text-base leading-relaxed text-neutral-2">
          <p>
            The further north you go, the longer the midsummer day — and above
            the Arctic Circle the sun does not set at all. But the late-evening
            light is wonderful well beyond the Nordics: even Mediterranean cities
            enjoy a long, warm dusk in June. The table below ranks each city by
            its longest day, with the solstice sunset time so you can see exactly
            how late the light lasts.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-card border border-white/10">
          <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium text-daylight">Longest day</th>
                <th className="px-4 py-3 font-medium text-sunset">Sunset, Jun 21</th>
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
                  <td className="px-4 py-3 text-daylight">
                    {r.midnightSun ? '24h (midnight sun)' : formatDuration(r.daylightSeconds)}
                  </td>
                  <td className="px-4 py-3 text-sunset">
                    {r.midnightSun ? 'No sunset' : r.sunset}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-neutral-4">
          Figures are for the June solstice ({YEAR}); sunset times are in each
          city&apos;s local timezone. Tap any city for today&apos;s sunrise,
          sunset, golden hour and a 7-day forecast.
        </p>

        <div className="mt-10 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Keep exploring
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/longest-day-around-the-world" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              The longest day around the world →
            </Link>
            <Link href="/country/finland" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Daylight in Finland
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
