import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { getCityBySlug } from '@/lib/cities'
import {
  getSolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'
import { getSkyGradient } from '@/lib/sky'

export const revalidate = 3600

// Featured cities, hand-picked to span the latitude range
const FEATURED = [
  { slug: 'helsinki', tagline: 'White nights' },
  { slug: 'tokyo', tagline: 'Bright early' },
  { slug: 'reykjavik', tagline: 'Near the Arctic' },
  { slug: 'tromso', tagline: 'Midnight sun' },
  { slug: 'dubai', tagline: 'Desert dusk' },
  { slug: 'singapore', tagline: 'Equator constant' },
  { slug: 'new-york-city', tagline: 'East coast' },
  { slug: 'sydney', tagline: 'Southern winter' },
]

export default function Home() {
  const now = new Date()
  const helsinki = getCityBySlug('helsinki')!
  const snap = getSolarSnapshot(now, helsinki.lat, helsinki.lon)
  const sky = getSkyGradient(snap.elevationDeg, snap.isAfterNoon)

  return (
    <main className="min-h-screen">
      {/* Hero with live Helsinki sky */}
      <section
        className="relative overflow-hidden"
        style={{ background: sky.gradient, minHeight: 'clamp(620px, 78vh, 820px)' }}
      >
        {/* horizon glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-80"
          style={{
            background: `radial-gradient(120% 100% at 50% 100%, ${sky.glowColor} 0%, transparent 65%)`,
            opacity: sky.glowOpacity,
          }}
        />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Logo variant="compact" />
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li className="cursor-default">Today</li>
            <li className="cursor-default text-white/50">Explore</li>
            <li className="cursor-default text-white/50">API</li>
          </ul>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-28">
          <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Make the most of daylight.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Sunrise, sunset, golden hour, blue hour and daylight duration —
            for 49,000+ cities worldwide.
          </p>

          <div className="mt-10 w-full max-w-md">
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <svg
                className="h-5 w-5 text-white/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                disabled
                placeholder="Search a city — Helsinki, Tokyo, Reykjavik…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
              />
            </div>
            <p className="mt-3 text-[0.7rem] uppercase tracking-widecaps text-white/55">
              Pick a city below — instant search arrives soon
            </p>
          </div>

          {/* Popular city pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {FEATURED.map((f) => {
              const city = getCityBySlug(f.slug)
              if (!city) return null
              return (
                <Link
                  key={f.slug}
                  href={`/${f.slug}`}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/20"
                >
                  {city.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Live snapshot — proof the data is real */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Right now in Helsinki
            </h2>
            <Link
              href="/helsinki"
              className="text-sm font-medium text-daylight hover:text-white"
            >
              See full Helsinki page →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Snap label="Sunrise" value={formatLocalTime(snap.sunrise, helsinki.timezone)} color="text-sunrise" />
            <Snap label="Sunset" value={formatLocalTime(snap.sunset, helsinki.timezone)} color="text-sunset" />
            <Snap label="Solar Noon" value={formatLocalTime(snap.solarNoon, helsinki.timezone)} />
            <Snap label="Daylight" value={formatDuration(snap.daylightSeconds)} color="text-daylight" />
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <ul className="grid grid-cols-2 gap-y-4 text-center text-[0.7rem] uppercase tracking-widecaps text-neutral-3 sm:grid-cols-3 md:grid-cols-6">
            <li>200+ countries</li>
            <li>49,000+ cities</li>
            <li>Astronomical precision</li>
            <li>Golden &amp; Blue hour</li>
            <li>Free API</li>
            <li>Free forever</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <p>© {new Date().getFullYear()} HowLongDay. All times in city's local timezone.</p>
        </div>
      </footer>
    </main>
  )
}

function Snap({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        {label}
      </div>
      <div className={`mt-3 font-semibold text-3xl tabular-nums ${color ?? 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
