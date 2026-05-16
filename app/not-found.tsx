/**
 * Branded 404 page.
 *
 * Lands here when:
 *   - User mistypes a city slug (e.g., /helsink)
 *   - User hits any path that doesn't match a route
 *
 * Goal: keep them on the site by giving them a working search +
 * a few high-recognition cities to click through.
 */

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { CitySearch } from '@/components/CitySearch'
import { getCityBySlug } from '@/lib/cities'

const SUGGESTED = [
  { slug: 'helsinki', tagline: 'White nights' },
  { slug: 'tokyo', tagline: 'Bright early' },
  { slug: 'new-york-city', tagline: 'East coast' },
  { slug: 'london', tagline: 'Long northern dusk' },
  { slug: 'dubai', tagline: 'Desert dusk' },
  { slug: 'singapore', tagline: 'Equator constant' },
  { slug: 'sydney', tagline: 'Southern flip' },
  { slug: 'reykjavik', tagline: 'Polar light' },
]

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #0B1220 0%, #1a2545 40%, #2a5a8a 80%, #3AA0FF 100%)',
          minHeight: 'clamp(560px, 70vh, 720px)',
        }}
      >
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-7">
          <Link href="/" aria-label="HowLongDay home">
            <Logo variant="compact" />
          </Link>
          <ul className="hidden gap-7 text-sm font-medium text-white/85 md:flex">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
          </ul>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-20 text-center sm:pt-28">
          <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-white/70">
            404 · No city by that name
          </p>
          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
            We couldn't find that page.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85">
            Try searching for a city — we cover 49,000+ worldwide.
          </p>

          <div className="mt-10 w-full max-w-md">
            <CitySearch placeholder="Search a city — Helsinki, Tokyo, Reykjavik…" />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {SUGGESTED.map((s) => {
              const city = getCityBySlug(s.slug)
              if (!city) return null
              return (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/20"
                >
                  {city.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <p>© {new Date().getFullYear()} HowLongDay.</p>
        </div>
      </footer>
    </main>
  )
}
