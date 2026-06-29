/**
 * Editorial hub: Lapland & the Arctic North.
 *
 * The authority page for the /north/[place] destinations — 50 Nordic/Arctic
 * spots across Finnish, Swedish and Norwegian Lapland (plus Svalbard and the
 * southern ski regions), grouped by country, each flagged for midnight sun /
 * polar night / aurora, funnelling internal links to the destination pages
 * and to the existing gateway-city pages.
 *
 * Static: the flags come from the precomputed dataset.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { getArcticByCountry, type ArcticDestination } from '@/lib/arctic'

const YEAR = new Date().getUTCFullYear()
const CANONICAL = 'https://howlongday.com/guides/lapland-arctic-north'

export const metadata: Metadata = {
  title: { absolute: 'Lapland & the Arctic North: 50 Destinations' },
  description:
    'The midnight sun, polar night and aurora season for 50 of the best destinations across Finnish, Swedish and Norwegian Lapland — Levi, Åre, Abisko, Lofoten, Svalbard and more. A data-backed planner for the far north.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Lapland & the Arctic North: 50 Destinations',
    description:
      'Midnight sun, polar night and aurora season for 50 top destinations across Finnish, Swedish and Norwegian Lapland.',
    url: CANONICAL,
    type: 'article',
  },
}

const GATEWAYS: { slug: string; name: string }[] = [
  { slug: 'rovaniemi', name: 'Rovaniemi' },
  { slug: 'kittila', name: 'Kittilä' },
  { slug: 'inari', name: 'Inari' },
  { slug: 'kiruna', name: 'Kiruna' },
  { slug: 'gallivare', name: 'Gällivare' },
  { slug: 'ostersund', name: 'Östersund' },
  { slug: 'tromso', name: 'Tromsø' },
  { slug: 'bodo', name: 'Bodø' },
  { slug: 'alta', name: 'Alta' },
  { slug: 'narvik', name: 'Narvik' },
]

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium ${
        on ? 'border-daylight/30 bg-daylight/10 text-daylight' : 'border-white/10 text-neutral-4'
      }`}
    >
      {on ? label : `no ${label.toLowerCase()}`}
    </span>
  )
}

function CountryBlock({ title, items }: { title: string; items: ArcticDestination[] }) {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-white">
        {title} <span className="text-sm font-normal text-neutral-4">· {items.length}</span>
      </h2>
      <div className="mt-5 space-y-3">
        {items.map((d) => (
          <Link
            key={d.slug}
            href={`/north/${d.slug}`}
            className="block rounded-card border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="font-semibold text-white">{d.name}</span>
              <span className="text-xs text-neutral-4">{d.region}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-3">{d.knownFor}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Flag on={Boolean(d.midnightSun)} label="Midnight sun" />
              <Flag on={Boolean(d.polarNight)} label="Polar night" />
              <Flag on={Boolean(d.auroraSeason)} label="Aurora" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function ArcticNorthGuide() {
  const finland = getArcticByCountry('Finland')
  const sweden = getArcticByCountry('Sweden')
  const norway = getArcticByCountry('Norway')
  const total = finland.length + sweden.length + norway.length

  return (
    <>
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
          </ul>
        </nav>
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-14 sm:pt-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">Guide</p>
          <h1 className="mt-3 text-balance font-semibold text-white text-3xl sm:text-5xl">
            Lapland &amp; the Arctic North
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/85">
            {total} of the most rewarding destinations across Finnish, Swedish and
            Norwegian Lapland — from ski resorts like Levi and Åre to aurora
            havens like Abisko, the peaks of Lofoten and the high-Arctic extreme
            of Svalbard. Each one is tagged for the three things that define a
            far-north trip: midnight sun, polar night and aurora season.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
        <div className="space-y-4 text-base leading-relaxed text-neutral-2">
          <p>
            In the north, daylight is the trip. Above the Arctic Circle the sun
            never sets for weeks in summer and never rises for weeks in winter —
            and in the dark months between, the aurora takes over the sky. Use
            the tags to plan around what you want: the midnight sun for hiking
            and the white nights, the polar night and dark season for the
            northern lights, or simply the deep-snow ski months. Tap any place
            for its today&apos;s sun times, daylight by month and what to do.
          </p>
        </div>

        <CountryBlock title="Finnish Lapland" items={finland} />
        <CountryBlock title="Swedish Lapland & the North" items={sweden} />
        <CountryBlock title="Norway & Svalbard" items={norway} />

        {/* Gateway cities */}
        <div className="mt-14 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Gateway cities — sunrise, sunset &amp; moon
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {GATEWAYS.map((g) => (
              <Link
                key={g.slug}
                href={`/${g.slug}`}
                className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-card border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">More guides</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/guides/best-cities-for-long-summer-evenings" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              Best cities for long summer evenings →
            </Link>
            <Link href="/guides/longest-day-around-the-world" className="rounded-full border border-white/15 px-4 py-1.5 text-white/85 hover:border-white/30 hover:text-white">
              The longest day around the world →
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
