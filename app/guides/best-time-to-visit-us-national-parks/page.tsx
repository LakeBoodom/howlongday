/**
 * Editorial hub: Best Time to Visit US National Parks.
 *
 * The authority page for the /parks/[park] pilot — a ranked overview of the
 * curated parks with their recommended season and computed midsummer daylight,
 * funnelling internal links down to each park's detailed planner page.
 *
 * Static: best-season and solstice-daylight figures are date-stable.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { NATIONAL_PARKS } from '@/lib/parks'
import { getSolarSnapshot, formatDuration } from '@/lib/astronomy'

const YEAR = new Date().getUTCFullYear()
const CANONICAL = 'https://howlongday.com/guides/best-time-to-visit-us-national-parks'

// June solstice (noon UTC) — longest day for these Northern-Hemisphere parks.
const SOLSTICE = new Date(Date.UTC(YEAR, 5, 21, 12))

export const metadata: Metadata = {
  title: { absolute: 'Best Time to Visit US National Parks' },
  description:
    'When to visit America’s most popular national parks — the best season for each, plus real daylight hours and golden-hour timing. A practical, data-backed planner for Yosemite, the Grand Canyon, Zion, Yellowstone and more.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Best Time to Visit US National Parks',
    description:
      'The best season for each major US national park, with real daylight and golden-hour data.',
    url: CANONICAL,
    type: 'article',
  },
}

export default function NationalParksGuide() {
  const tableRows = NATIONAL_PARKS.map((p) => {
    const snap = getSolarSnapshot(SOLSTICE, p.lat, p.lon)
    return {
      slug: p.slug,
      shortName: p.shortName,
      state: p.state,
      bestSeason: p.bestSeason,
      solsticeDaylight: snap.isMidnightSun ? '21h+ (near midnight sun)' : formatDuration(snap.daylightSeconds),
    }
  }).sort((a, b) => {
    // Sort by the numeric solstice daylight descending where possible.
    const an = parseFloat(a.solsticeDaylight)
    const bn = parseFloat(b.solsticeDaylight)
    return (isNaN(bn) ? 99 : bn) - (isNaN(an) ? 99 : an)
  })

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
            Best time to visit US national parks
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85">
            The right month makes or breaks a national park trip — it&apos;s the
            difference between wildflower meadows and closed roads, or a dawn
            hike and a midday heatstroke. Here&apos;s the recommended season for
            {' '}{NATIONAL_PARKS.length} of America&apos;s most popular parks, with
            real daylight and golden-hour data to plan around.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <div className="space-y-4 text-base leading-relaxed text-neutral-2">
          <p>
            Two things drive the timing of a park visit: access and daylight.
            High-country roads like Glacier&apos;s Going-to-the-Sun or Rocky
            Mountain&apos;s Trail Ridge open only once the snow clears, while the
            desert parks flip the logic — summer is the season to avoid. Layered
            on top is daylight: how many usable hours you have for a long trail,
            and when the golden light falls for photographs. The table below
            ranks the parks by their midsummer daylight; tap any park for its
            month-by-month daylight, golden-hour times and signature hikes.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-card border border-white/10">
          <table className="w-full min-w-[34rem] text-left text-sm tabular-nums">
            <thead>
              <tr className="border-b border-white/10 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                <th className="px-4 py-3 font-medium">Park</th>
                <th className="px-4 py-3 font-medium">Best season</th>
                <th className="px-4 py-3 font-medium text-daylight">Midsummer daylight</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => (
                <tr key={r.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/parks/${r.slug}`} className="text-white hover:text-daylight">
                      {r.shortName}
                    </Link>
                    <span className="ml-2 text-xs text-neutral-4">{r.state}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-2 [font-variant-numeric:normal]">{r.bestSeason}</td>
                  <td className="px-4 py-3 text-daylight">{r.solsticeDaylight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-neutral-4">
          Daylight figures are for the June solstice ({YEAR}), computed for each
          park&apos;s coordinates. Northern parks like Denali and Glacier get the
          longest days; southern parks are more even year-round. Tap any park for
          its full month-by-month planner.
        </p>

        <div className="mt-10 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Keep exploring
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/best-cities-for-long-summer-evenings" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Best cities for long summer evenings →
            </Link>
            <Link href="/guides/longest-day-around-the-world" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              The longest day around the world →
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
