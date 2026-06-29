/**
 * Moon + stargazing panel for city pages.
 *
 * Two server-rendered sections (crawlable depth, no client JS):
 *  1. "Moon tonight" — phase, illuminated %, moonrise/moonset, next full moon.
 *  2. "Stargazing tonight" — the true-darkness window (astronomical night) plus
 *     a moon-interference readout and a plain-language verdict.
 *
 * Cheap: a handful of SunCalc moon calls; the full/new-moon dates are a static
 * table (lib/moon). Reuses the already-computed solar snapshot for the twilight
 * window so no extra sun compute is needed.
 */

import type { City } from '@/lib/cities'
import { type SolarSnapshot, formatLocalTime } from '@/lib/astronomy'
import { getMoonSnapshot, moonAltitudeDeg, nextFullMoon } from '@/lib/moon'

interface Props {
  city: City
  snap: SolarSnapshot
}

function pct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

export function MoonPanel({ city, snap }: Props) {
  const now = new Date()
  const moon = getMoonSnapshot(now, city.lat, city.lon)
  const full = nextFullMoon(now)

  const tz = city.timezone
  const moonrise = moon.alwaysUp
    ? 'Up all day'
    : moon.alwaysDown
      ? 'Below horizon'
      : formatLocalTime(moon.moonrise, tz)
  const moonset = moon.alwaysUp
    ? 'Up all day'
    : moon.alwaysDown
      ? '—'
      : formatLocalTime(moon.moonset, tz)

  // --- Stargazing: darkness window + moon interference --------------------
  const hasAstroDark = !snap.isMidnightSun && isValid(snap.night) && isValid(snap.nightEnd)
  const darkStart = formatLocalTime(snap.night, tz)
  const darkEnd = formatLocalTime(snap.nightEnd, tz)

  // Sample the moon at the start of astronomical night (or now) to judge whether
  // moonlight will wash out the sky during the dark window.
  const sampleInstant = hasAstroDark && isValid(snap.night) ? snap.night : now
  const moonUpDuringDark = moonAltitudeDeg(sampleInstant, city.lat, city.lon) > 0
  const brightMoon = moon.illumination >= 0.6
  const dimMoon = moon.illumination <= 0.3

  let darkWindow: string
  let verdict: string
  let moonNote: string

  if (snap.isMidnightSun) {
    darkWindow = 'No darkness — midnight sun'
    verdict = 'Not tonight'
    moonNote = 'The sky never gets dark enough for stars at this time of year.'
  } else if (snap.isPolarNight) {
    darkWindow = 'Dark all day — polar night'
    verdict = moonUpDuringDark && brightMoon ? 'Bright moon' : 'Excellent'
    moonNote = moonUpDuringDark && brightMoon
      ? `The moon is up and ${pct(moon.illumination)} lit, which will brighten the sky.`
      : `Long, dark nights — and the moon is ${pct(moon.illumination)} lit, so the sky stays dark.`
  } else if (!hasAstroDark) {
    darkWindow = 'No true darkness tonight'
    verdict = 'Limited'
    moonNote = 'The sun stays close to the horizon all night, so the sky only reaches twilight — faint objects stay hidden.'
  } else {
    darkWindow = `${darkStart} – ${darkEnd}`
    if (!moonUpDuringDark) {
      verdict = 'Good'
      moonNote = `The moon is below the horizon at the start of the dark window, so it won't wash out the sky — a good night for faint stars.`
    } else if (dimMoon) {
      verdict = 'Good'
      moonNote = `The moon is up but only ${pct(moon.illumination)} lit, so moonlight stays low.`
    } else if (brightMoon) {
      verdict = 'Bright moon'
      moonNote = `A bright moon (${pct(moon.illumination)} lit) is up during the dark window, washing out fainter stars.`
    } else {
      verdict = 'Fair'
      moonNote = `The moon is up and ${pct(moon.illumination)} lit — some moonlight, but brighter stars and planets show well.`
    }
  }

  return (
    <section className="mx-auto mt-4 max-w-5xl px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Moon tonight */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
            Moon tonight
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-white">{moon.phaseName}</span>
            <span className="text-sm text-neutral-3 tabular-nums">{pct(moon.illumination)} lit</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Moonrise</div>
              <div className="mt-1 font-semibold tabular-nums text-white">{moonrise}</div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Moonset</div>
              <div className="mt-1 font-semibold tabular-nums text-white">{moonset}</div>
            </div>
          </div>
          {full && (
            <div className="mt-4 text-xs text-neutral-4">
              Next full moon: {full.label}
              {full.daysAway > 0 ? ` · ${full.daysAway} day${full.daysAway === 1 ? '' : 's'} away` : ' · tonight'}
            </div>
          )}
        </div>

        {/* Stargazing tonight */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
              Stargazing tonight
            </div>
            <span className="rounded-full border border-white/15 px-3 py-0.5 text-xs font-medium text-daylight">
              {verdict}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Dark-sky window</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-white">{darkWindow}</div>
            {hasAstroDark && (
              <div className="mt-0.5 text-xs text-neutral-4">
                Astronomical night — the sun is more than 18° below the horizon.
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-2">{moonNote}</p>
        </div>
      </div>
    </section>
  )
}

function isValid(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime())
}
