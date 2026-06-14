/**
 * DaylightProfile — annual "character" content under the hero.
 *
 * All values come from the precomputed sun profile + the page's existing
 * server snapshot (passed in as `today`). Zero SunCalc calls here.
 */

import type { City } from '@/lib/cities'
import {
  buildDaylightContent,
  type SunProfile,
  type TodaySun,
} from '@/lib/sunProfile'

interface Props {
  city: City
  profile: SunProfile
  today: TodaySun
  year: number
}

export function DaylightProfile({ city, profile, today, year }: Props) {
  const c = buildDaylightContent(city, profile, today)

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <h2 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {c.heading}
      </h2>
      <p className="mt-5 max-w-prose text-base leading-relaxed text-neutral-2">
        {c.character}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold text-white">{c.darkness.heading}</h3>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-neutral-2">
            {c.darkness.text}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{c.golden.heading}</h3>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-neutral-2">
            {c.golden.text}
          </p>
        </div>
      </div>

      <h3 className="mt-12 text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        Key sun dates in {city.name}, {year}
      </h3>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {c.keyDates.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <p className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
              {k.label}
            </p>
            <p className="mt-1.5 text-lg font-semibold text-white">{k.date}</p>
            <p className="mt-0.5 text-sm tabular-nums text-neutral-3">{k.detail}</p>
          </div>
        ))}
      </div>

      {c.eqOfTimeNote && (
        <p className="mt-6 max-w-prose border-l-2 border-white/15 pl-4 text-sm leading-relaxed text-neutral-3">
          {c.eqOfTimeNote}
        </p>
      )}
    </section>
  )
}
