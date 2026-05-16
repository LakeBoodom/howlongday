import { Logo } from '@/components/Logo'

// Placeholder "golden hour dusk" gradient — to be replaced by getSkyGradient(elevation)
const HERO_GRADIENT =
  'linear-gradient(180deg, #0e1830 0%, #1a2545 25%, #4a1f10 45%, #8b3010 60%, #d4612a 75%, #f08040 87%, #f5c070 95%, #fff0c0 100%)'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: HERO_GRADIENT, minHeight: '70vh' }}
      >
        {/* horizon glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
          style={{
            background:
              'radial-gradient(120% 100% at 50% 100%, rgba(240,128,64,0.55) 0%, rgba(240,128,64,0) 60%)',
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

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-32 text-center">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-widecaps text-white/90 backdrop-blur">
            Coming soon
          </span>
          <h1 className="mt-6 max-w-2xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Make the most of daylight.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Sunrise, sunset, golden hour, blue hour and daylight duration —
            for 50,000+ cities worldwide.
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
            <p className="mt-3 text-xs uppercase tracking-widecaps text-white/60">
              City search arrives with the v1 launch
            </p>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <ul className="grid grid-cols-2 gap-y-4 text-center text-xs uppercase tracking-widecaps text-neutral-3 sm:grid-cols-3 md:grid-cols-6">
            <li>200+ countries</li>
            <li>50,000+ cities</li>
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
          <p>© {new Date().getFullYear()} HowLongDay. All times in local timezone.</p>
        </div>
      </footer>
    </main>
  )
}
