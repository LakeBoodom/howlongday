/**
 * Moon + stargazing (and, in aurora zones, aurora) panel.
 *
 * Two server-rendered sections (crawlable depth, no client JS):
 *  1. "Moon tonight" — phase, illuminated %, moonrise/moonset, next full moon.
 *  2. "Stargazing tonight" / "Stargazing & aurora tonight" — the true-darkness
 *     window (astronomical night), a moon-interference readout, and a plain
 *     verdict. In aurora zones (high latitude) the copy speaks to the northern
 *     lights, since dark + clear + low-moon is exactly the aurora condition.
 *
 * Generic over location (city, national park, Arctic destination): pass
 * lat/lon/timezone plus the already-computed solar snapshot so no extra sun
 * compute is needed.
 */

import { type SolarSnapshot, formatLocalTime } from '@/lib/astronomy'
import { getMoonSnapshot, moonAltitudeDeg, nextFullMoon } from '@/lib/moon'

interface Props {
  lat: number
  lon: number
  timezone: string
  snap: SolarSnapshot
  /** High-latitude location where the aurora is a realistic draw. */
  auroraZone?: boolean
  /** Render inside a content article (no own max-width/padding) with a heading. */
  embedded?: boolean
  /** Section heading shown in embedded mode. */
  heading?: string
}

function pct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`
}

function isValid(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime())
}

export function MoonPanel({ lat, lon, timezone: tz, snap, auroraZone = false, embedded = false, heading }: Props) {
  const now = new Date()
  const moon = getMoonSnapshot(now, lat, lon)
  const full = nextFullMoon(now)

  const moonrise = moon.alwaysUp ? 'Up all day' : moon.alwaysDown ? 'Below horizon' : formatLocalTime(moon.moonrise, tz)
  const moonset = moon.alwaysUp ? 'Up all day' : moon.alwaysDown ? '—' : formatLocalTime(moon.moonset, tz)

  // --- Darkness window + moon interference --------------------------------
  const hasAstroDark = !snap.isMidnightSun && isValid(snap.night) && isValid(snap.nightEnd)
  const darkStart = formatLocalTime(snap.night, tz)
  const darkEnd = formatLocalTime(snap.nightEnd, tz)
  const sampleInstant = hasAstroDark && isValid(snap.night) ? snap.night : now
  const moonUpDuringDark = moonAltitudeDeg(sampleInstant, lat, lon) > 0
  const brightMoon = moon.illumination >= 0.6
  const dimMoon = moon.illumination <= 0.3

  const subject = auroraZone ? 'aurora' : 'the night sky'
  const title = auroraZone ? 'Stargazing & aurora tonight' : 'Stargazing tonight'

  let darkWindow: string
  let verdict: string
  let note: string

  if (snap.isMidnightSun) {
    darkWindow = 'No darkness — midnight sun'
    verdict = 'Not tonight'
    note = auroraZone
      ? 'The midnight sun keeps the sky bright around the clock — the aurora can’t be seen until the dark nights return in autumn.'
      : 'The sky never gets dark enough for stars at this time of year.'
  } else if (snap.isPolarNight) {
    darkWindow = 'Dark all day — polar night'
    verdict = brightMoon && moonUpDuringDark ? 'Bright moon' : 'Excellent'
    note = auroraZone
      ? (brightMoon && moonUpDuringDark
          ? `Dark around the clock — prime aurora conditions, though a ${pct(moon.illumination)}-lit moon will brighten the sky.`
          : `Dark around the clock — prime aurora hunting whenever the skies are clear, and the moon is only ${pct(moon.illumination)} lit.`)
      : `Polar night — long, dark hours, with the moon ${pct(moon.illumination)} lit.`
  } else if (!hasAstroDark) {
    darkWindow = 'No true darkness tonight'
    verdict = 'Limited'
    note = auroraZone
      ? 'The sky only reaches twilight tonight — still a touch too light for the aurora. It sharpens as the nights draw in.'
      : 'The sun stays close to the horizon all night, so the sky only reaches twilight — faint objects stay hidden.'
  } else {
    darkWindow = `${darkStart} – ${darkEnd}`
    if (!moonUpDuringDark) {
      verdict = 'Good'
      note = `The moon is below the horizon at the start of the dark window, so it won’t wash out the sky — a good night for ${subject} when skies are clear.`
    } else if (dimMoon) {
      verdict = 'Good'
      note = `The moon is up but only ${pct(moon.illumination)} lit, so moonlight stays low — good for ${subject} on a clear night.`
    } else if (brightMoon) {
      verdict = 'Bright moon'
      note = `A bright moon (${pct(moon.illumination)} lit) is up during the dark window, washing out fainter ${auroraZone ? 'aurora and stars' : 'stars'}.`
    } else {
      verdict = 'Fair'
      note = `The moon is up and ${pct(moon.illumination)} lit — some moonlight, but ${auroraZone ? 'a strong aurora still shows well' : 'brighter stars and planets show well'}.`
    }
  }

  const grid = (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Moon tonight */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">Moon tonight</div>
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

        {/* Stargazing / aurora tonight */}
        <div className="rounded-card border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">{title}</div>
            <span className="rounded-full border border-white/15 px-3 py-0.5 text-xs font-medium text-daylight">{verdict}</span>
          </div>
          <div className="mt-3">
            <div className="text-[0.7rem] uppercase tracking-widecaps text-neutral-4">Dark-sky window</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-white">{darkWindow}</div>
            {hasAstroDark && (
              <div className="mt-0.5 text-xs text-neutral-4">Astronomical night — the sun is more than 18° below the horizon.</div>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-2">{note}</p>
        </div>
      </div>
  )

  if (embedded) {
    return (
      <div className="mt-12">
        {heading && <h2 className="mb-5 text-xl font-semibold text-white">{heading}</h2>}
        {grid}
      </div>
    )
  }

  return <section className="mx-auto mt-4 max-w-5xl px-6">{grid}</section>
}
