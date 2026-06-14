/**
 * Sun profile — precomputed per-city annual constants (data/sun-profiles.json)
 * plus the content builder that turns them into latitude-banded prose.
 *
 * Zero SunCalc calls at render: the page reads a profile and the live "today"
 * snapshot it already computes. See SUN_PROFILES_SPEC.md.
 */

import { formatLocalTime, type SolarSnapshot } from '@/lib/astronomy'
import profilesData from '@/data/sun-profiles.json'

export interface SunProfile {
  maxDayMin: number
  minDayMin: number
  longest: [number, number]   // [month, day]
  shortest: [number, number]
  category: 'always-dark' | 'white-nights' | 'extreme'
  midnightSun: boolean
  polarNight: boolean
  monthlyAvgMin: number[]
  earliestSunrise?: [number, number, number]  // [month, day, minOfDay]
  latestSunrise?: [number, number, number]
  earliestSunset?: [number, number, number]
  latestSunset?: [number, number, number]
}

/** Live "today" values the page already has from its server snapshot. */
export interface TodaySun {
  sunrise: string        // "05:54"
  sunset: string         // "18:47"
  goldenStart: string    // evening golden-hour start "18:16"
  goldenMinsEvening: number
  getsDarkTonight: boolean
  nightStart: string     // astro night begins "20:06" ("" if none)
  nightEnd: string       // astro night ends "04:35" ("" if none)
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function durMin(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`
}
function monthDay(md: [number, number] | [number, number, number]): string {
  return `${MONTHS[md[0] - 1]} ${md[1]}`
}
function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export interface KeyDate { label: string; date: string; detail: string }
export interface DaylightContent {
  heading: string
  character: string
  darkness: { heading: string; text: string }
  golden: { heading: string; text: string }
  keyDates: KeyDate[]
  eqOfTimeNote: string | null
}

interface CityLike { name: string; country: string; lat: number }

export function buildDaylightContent(
  city: CityLike,
  p: SunProfile,
  today: TodaySun,
): DaylightContent {
  const swing = p.maxDayMin - p.minDayMin
  const absLat = Math.abs(city.lat)
  const hemisphereSummer = city.lat >= 0 ? 'June' : 'December'
  const place = city.name === city.country ? city.name : `${city.name}, ${city.country}`

  // --- Paragraph 1: annual character ---
  let character: string
  if (p.category === 'extreme') {
    character =
      `${place} sits at ${absLat.toFixed(1)}° — beyond the polar circle. ` +
      `Its day doesn't just lengthen and shorten, it disappears entirely: the longest "day" reaches ${durMin(p.maxDayMin)} of light around ${monthDay(p.longest)}, ` +
      `while the shortest collapses to ${durMin(p.minDayMin)} near ${monthDay(p.shortest)}. ` +
      `That is the most extreme daylight cycle on Earth — full midnight sun in summer and polar night in winter.`
  } else if (p.category === 'white-nights') {
    character =
      `${place} lies far enough north (${absLat.toFixed(1)}°) for dramatic seasons. ` +
      `The longest day, ${monthDay(p.longest)}, brings ${durMin(p.maxDayMin)} of light; the shortest, ${monthDay(p.shortest)}, gives only ${durMin(p.minDayMin)} — ` +
      `a swing of ${durMin(swing)} across the year. In high summer the nights never fully darken, while midwinter days are short and low.`
  } else if (absLat < 23.5) {
    const steadiness = swing < 30
      ? `its daylight barely changes across the year`
      : `its daylight stays remarkably steady across the year`
    character =
      `${place} sits at just ${absLat.toFixed(1)}°, in the tropics — so ${steadiness}. ` +
      `The longest day, ${monthDay(p.longest)}, brings ${durMin(p.maxDayMin)} of light, and even the shortest, ${monthDay(p.shortest)}, still gives ${durMin(p.minDayMin)} — ` +
      `a swing of only ${durMin(swing)} between midsummer and midwinter. Unlike high-latitude cities, where the day stretches and collapses with the seasons, ${city.name} keeps almost the same rhythm all year.`
  } else {
    const seasons = swing >= 360 ? 'strong, dramatic seasons' : 'clear but moderate seasons'
    character =
      `${place} sits at ${absLat.toFixed(1)}°, with ${seasons}. ` +
      `Daylight peaks at ${durMin(p.maxDayMin)} on the longest day (${monthDay(p.longest)}) and dips to ${durMin(p.minDayMin)} on the shortest (${monthDay(p.shortest)}) — ` +
      `a swing of ${durMin(swing)} between ${hemisphereSummer} and the opposite solstice.`
  }

  // --- Paragraph 2: darkness ---
  let darkness: { heading: string; text: string }
  if (p.category === 'extreme') {
    darkness = {
      heading: `Does it get dark in ${city.name}?`,
      text:
        `Only part of the year. Around the summer solstice the sun never sets — full midnight sun — so there is no darkness at all. ` +
        `In deep winter the opposite happens: the sun stays below the horizon and the city sits in polar night, lit only by a dim twilight at midday.`,
    }
  } else if (p.category === 'white-nights') {
    darkness = {
      heading: `Does it get dark in ${city.name}?`,
      text:
        `Not fully, in high summer. Around ${hemisphereSummer} the sun dips just below the horizon but never far enough for true night — the famous "white nights," when the sky stays a deep blue till dawn. ` +
        `The rest of the year it does get properly dark; tonight, ${today.getsDarkTonight ? `astronomical night runs from about ${today.nightStart} to ${today.nightEnd}` : `the sky never reaches full darkness`}.`,
    }
  } else {
    darkness = {
      heading: `Does it get dark in ${city.name}?`,
      text:
        `Yes — ${city.name} reaches full darkness every night of the year. This evening, true astronomical night begins around ${today.nightStart} and lasts until first light at ${today.nightEnd}. ` +
        `There are no white nights here: the sun drops well below the horizon, so the sky goes completely dark — good for stargazing in every season.`,
    }
  }

  // --- Paragraph 3: golden hour ---
  const golden = {
    heading: `Golden hour in ${city.name}`,
    text:
      absLat < 30
        ? `Golden hour is short and steady here — roughly ${today.goldenMinsEvening} minutes before sunset (today from about ${today.goldenStart} to ${today.sunset}) and a matching window after sunrise. Because ${city.name} is near the equator, the sun sets at a steep, near-vertical angle, so the warm light fades fast.`
        : absLat < 55
        ? `This evening, golden hour runs about ${today.goldenMinsEvening} minutes, from roughly ${today.goldenStart} to sunset at ${today.sunset}, with a matching window after sunrise. Its length grows through summer as the sun tracks a shallower path to the horizon.`
        : `At ${absLat.toFixed(1)}° the sun sets at a shallow angle, so golden hour is long and lingering — today about ${today.goldenMinsEvening} minutes from ${today.goldenStart} to ${today.sunset}, and in midsummer it can stretch for hours, prized by photographers.`,
  }

  // --- Key dates ---
  const keyDates: KeyDate[] = [
    { label: 'Longest day', date: monthDay(p.longest), detail: durMin(p.maxDayMin) },
    { label: 'Shortest day', date: monthDay(p.shortest), detail: durMin(p.minDayMin) },
  ]
  if (p.earliestSunrise) keyDates.push({ label: 'Earliest sunrise', date: monthDay(p.earliestSunrise), detail: hhmm(p.earliestSunrise[2]) })
  if (p.latestSunset) keyDates.push({ label: 'Latest sunset', date: monthDay(p.latestSunset), detail: hhmm(p.latestSunset[2]) })
  if (p.earliestSunset) keyDates.push({ label: 'Earliest sunset', date: monthDay(p.earliestSunset), detail: hhmm(p.earliestSunset[2]) })
  if (p.latestSunrise) keyDates.push({ label: 'Latest sunrise', date: monthDay(p.latestSunrise), detail: hhmm(p.latestSunrise[2]) })

  // --- Equation-of-time note (only when earliest sunset ≠ shortest-day month) ---
  let eqOfTimeNote: string | null = null
  if (p.earliestSunset && p.latestSunrise && p.earliestSunset[0] !== p.shortest[0]) {
    eqOfTimeNote =
      `Notice the earliest sunset (${monthDay(p.earliestSunset)}) and latest sunrise (${monthDay(p.latestSunrise)}) don't fall on the shortest day — ` +
      `a quirk of the "equation of time" that surprises most people who track it.`
  }

  return {
    heading: `Daylight in ${city.name} through the year`,
    character,
    darkness,
    golden,
    keyDates,
    eqOfTimeNote,
  }
}

export interface FaqEntry { q: string; a: string }

export function buildLatitudeFaq(city: CityLike, p: SunProfile): FaqEntry[] {
  const swing = p.maxDayMin - p.minDayMin
  const out: FaqEntry[] = []

  if (p.category === 'extreme') {
    out.push({
      q: `When does the midnight sun and polar night happen in ${city.name}?`,
      a: `${city.name} has both. Around the ${city.lat >= 0 ? 'June' : 'December'} solstice the sun never sets (midnight sun), and around the opposite solstice it never rises (polar night). The longest day reaches ${durMin(p.maxDayMin)} and the shortest just ${durMin(p.minDayMin)}.`,
    })
  } else if (p.category === 'white-nights') {
    out.push({
      q: `Does it ever get fully dark in ${city.name} in summer?`,
      a: `Barely. Near the summer solstice ${city.name} has "white nights" — the sun stays close enough to the horizon that the sky never reaches true astronomical darkness. Full night returns as the season turns.`,
    })
  } else if (swing < 45) {
    out.push({
      q: `Why does daylight stay so constant in ${city.name}?`,
      a: `${city.name} is close to the equator (${Math.abs(city.lat).toFixed(1)}°), where the sun's path changes little through the year. Daylight only swings ${durMin(swing)} between the longest and shortest day, so sunrise and sunset stay near the same time year-round.`,
    })
  }

  if (p.earliestSunset && p.earliestSunset[0] !== p.shortest[0]) {
    out.push({
      q: `When is the earliest sunset of the year in ${city.name}?`,
      a: `The earliest sunset falls around ${monthDay(p.earliestSunset)}, at ${hhmm(p.earliestSunset[2])} — not on the shortest day (${monthDay(p.shortest)}). This is the "equation of time": the solar day and the clock day drift apart by up to about 15 minutes through the year.`,
    })
  }

  return out
}

// --- Loader + today helper -------------------------------------------------

const profiles = profilesData as unknown as Record<string, SunProfile>

/** Precomputed annual profile for a city, or null (long-tail cities have none). */
export function getSunProfile(slug: string): SunProfile | null {
  return profiles[slug] ?? null
}

function valid(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime())
}

/** Derive the live "today" strings the content builder needs from the page's
 *  existing server snapshot — no extra SunCalc calls. */
export function todaySunFrom(snap: SolarSnapshot, timezone: string): TodaySun {
  const goldenMinsEvening =
    valid(snap.goldenHour) && valid(snap.sunset)
      ? Math.round((snap.sunset.getTime() - snap.goldenHour.getTime()) / 60000)
      : 0
  const getsDarkTonight = valid(snap.night)
  return {
    sunrise: formatLocalTime(snap.sunrise, timezone),
    sunset: formatLocalTime(snap.sunset, timezone),
    goldenStart: formatLocalTime(snap.goldenHour, timezone),
    goldenMinsEvening,
    getsDarkTonight,
    nightStart: getsDarkTonight ? formatLocalTime(snap.night, timezone) : '',
    nightEnd: valid(snap.nightEnd) ? formatLocalTime(snap.nightEnd, timezone) : '',
  }
}
