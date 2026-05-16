/**
 * Astronomy — SunCalc wrappers.
 *
 * SunCalc gives times as UTC Date objects; we always render through
 * Intl.DateTimeFormat with the city's IANA timezone so the user sees
 * the local clock time.
 */

import SunCalc from 'suncalc'

export interface SolarSnapshot {
  /** -90° (nadir) to +90° (zenith). Above 0° = sun is above horizon. */
  elevationDeg: number
  /** 0° = N, 90° = E, 180° = S, 270° = W. */
  azimuthDeg: number

  // Today's main events (UTC Date — format with timezone for display)
  sunrise: Date
  sunset: Date
  solarNoon: Date

  // Golden hour: SunCalc defines these as sun-elevation = 6° crossings.
  // goldenHourEnd  = morning, sun rises through 6° (end of warm light)
  // goldenHour     = evening, sun drops through 6° (start of warm light)
  goldenHourEnd: Date
  goldenHour: Date

  // Civil twilight (sun at -6°)
  dawn: Date
  dusk: Date
  // Nautical twilight (sun at -12°)
  nauticalDawn: Date
  nauticalDusk: Date
  // Astronomical twilight (sun at -18°)
  nightEnd: Date
  night: Date

  /** sunset - sunrise in seconds. 86400 if midnight sun, 0 if polar night. */
  daylightSeconds: number

  isMidnightSun: boolean
  isPolarNight: boolean
  isAfterNoon: boolean
}

function isValid(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime())
}

export function getSolarSnapshot(
  date: Date,
  lat: number,
  lon: number,
): SolarSnapshot {
  const times = SunCalc.getTimes(date, lat, lon)
  const pos = SunCalc.getPosition(date, lat, lon)

  const elevationDeg = pos.altitude * (180 / Math.PI)
  // SunCalc azimuth: 0 = south, positive = west. Convert to compass (0 = north).
  const azimuthDeg = ((pos.azimuth * (180 / Math.PI)) + 180 + 360) % 360

  // Polar conditions: SunCalc returns Invalid Date for sunrise/sunset when
  // the sun never crosses the horizon on that day.
  const sunriseInvalid = !isValid(times.sunrise)
  const isMidnightSun = sunriseInvalid && elevationDeg > 0
  const isPolarNight = sunriseInvalid && elevationDeg <= 0

  let daylightSeconds: number
  if (isMidnightSun) {
    daylightSeconds = 86400
  } else if (isPolarNight) {
    daylightSeconds = 0
  } else if (isValid(times.sunrise) && isValid(times.sunset)) {
    daylightSeconds = (times.sunset.getTime() - times.sunrise.getTime()) / 1000
  } else {
    daylightSeconds = 0
  }

  const isAfterNoon = isValid(times.solarNoon)
    ? date.getTime() > times.solarNoon.getTime()
    : elevationDeg < 0 || azimuthDeg > 180

  return {
    elevationDeg,
    azimuthDeg,
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    goldenHourEnd: times.goldenHourEnd,
    goldenHour: times.goldenHour,
    dawn: times.dawn,
    dusk: times.dusk,
    nauticalDawn: times.nauticalDawn,
    nauticalDusk: times.nauticalDusk,
    nightEnd: times.nightEnd,
    night: times.night,
    daylightSeconds,
    isMidnightSun,
    isPolarNight,
    isAfterNoon,
  }
}

/** "05:42" in the given IANA timezone. Returns "—" for Invalid Date. */
export function formatLocalTime(
  date: Date,
  timezone: string,
  locale: string = 'en-US',
): string {
  if (!isValid(date)) return '—'
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** "Friday, May 16, 2026" in the given IANA timezone. */
export function formatLocalDate(
  date: Date,
  timezone: string,
  locale: string = 'en-US',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** "18h 44m" — for daylight duration display. */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '0h 0m'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `${h}h ${m}m`
}

/**
 * Approximation of the city's annual maximum daylight, used to render the
 * "X% of peak" progress bar. We sample the local summer solstice for the
 * hemisphere — accurate within a few minutes.
 */
export function getMaxDaylight(lat: number, lon: number, year: number): number {
  // Solstice noon UTC. June 21 ≈ NH peak, December 21 ≈ SH peak.
  const month = lat >= 0 ? 5 : 11 // 0-indexed
  const peak = new Date(Date.UTC(year, month, 21, 12))
  const times = SunCalc.getTimes(peak, lat, lon)
  if (!isValid(times.sunrise) || !isValid(times.sunset)) {
    // Midnight sun on the solstice
    return 86400
  }
  return (times.sunset.getTime() - times.sunrise.getTime()) / 1000
}

// ---------------------------------------------------------------------------
// Yearly daylight series
// ---------------------------------------------------------------------------

export interface DaylightPoint {
  /** 1-indexed day of year (1..365 or 1..366). */
  dayOfYear: number
  /** Noon UTC for that calendar day. */
  date: Date
  /** 0..86400. 0 for polar night, 86400 for midnight sun. */
  daylightSeconds: number
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

/**
 * Sample daylight length for every day of `year`. One SunCalc call per day,
 * anchored to local noon (UTC noon is a fine proxy here — daylight length on
 * a calendar day is the same to the second). Handles polar night and
 * midnight sun the same way `getSolarSnapshot` does.
 *
 * Returns 365 or 366 entries.
 */
export function getYearlyDaylight(
  lat: number,
  lon: number,
  year: number,
): DaylightPoint[] {
  const total = daysInYear(year)
  const startMs = Date.UTC(year, 0, 1, 12) // Jan 1 noon UTC
  const points: DaylightPoint[] = new Array(total)

  for (let i = 0; i < total; i++) {
    const d = new Date(startMs + i * 86_400_000)
    const times = SunCalc.getTimes(d, lat, lon)
    const sunriseInvalid = !isValid(times.sunrise)

    let daylightSeconds: number
    if (sunriseInvalid) {
      // Determine polar-night vs midnight-sun by sampling sun elevation at
      // local solar noon (azimuth peak, brightest moment of the day).
      const pos = SunCalc.getPosition(d, lat, lon)
      const elevationDeg = pos.altitude * (180 / Math.PI)
      daylightSeconds = elevationDeg > 0 ? 86400 : 0
    } else if (isValid(times.sunset)) {
      daylightSeconds = (times.sunset.getTime() - times.sunrise.getTime()) / 1000
    } else {
      daylightSeconds = 0
    }

    points[i] = { dayOfYear: i + 1, date: d, daylightSeconds }
  }

  return points
}

/** 0-indexed day of year for `date` (UTC). */
export function dayOfYearUTC(date: Date): number {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  return Math.floor((date.getTime() - start) / 86_400_000)
}

// ---------------------------------------------------------------------------
// Monthly daylight series
// ---------------------------------------------------------------------------

export interface DaySolarSnapshot {
  /** 1..31 — day of month */
  day: number
  /** Noon UTC for this calendar day */
  date: Date
  /** UTC Date — format with timezone for display. Invalid Date in polar conditions. */
  sunrise: Date
  sunset: Date
  /** 0..86400. 86400 for midnight sun, 0 for polar night. */
  daylightSeconds: number
  isMidnightSun: boolean
  isPolarNight: boolean
}

/**
 * Sample sunrise/sunset/daylight for every day of `month` (0-indexed) in
 * `year`. Always anchors on UTC noon — daylight length is the same as
 * what you'd measure from local-noon, to the second, and timezone is
 * applied only when formatting times for display.
 */
export function getMonthlyDaylight(
  lat: number,
  lon: number,
  year: number,
  month: number,
): DaySolarSnapshot[] {
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const days: DaySolarSnapshot[] = new Array(totalDays)

  for (let d = 1; d <= totalDays; d++) {
    const dateUtc = new Date(Date.UTC(year, month, d, 12))
    const times = SunCalc.getTimes(dateUtc, lat, lon)
    const sunriseInvalid = !isValid(times.sunrise)

    let daylightSeconds: number
    let isMidnightSun = false
    let isPolarNight = false

    if (sunriseInvalid) {
      const pos = SunCalc.getPosition(dateUtc, lat, lon)
      const elevationDeg = pos.altitude * (180 / Math.PI)
      if (elevationDeg > 0) {
        daylightSeconds = 86400
        isMidnightSun = true
      } else {
        daylightSeconds = 0
        isPolarNight = true
      }
    } else if (isValid(times.sunset)) {
      daylightSeconds = (times.sunset.getTime() - times.sunrise.getTime()) / 1000
    } else {
      daylightSeconds = 0
    }

    days[d - 1] = {
      day: d,
      date: dateUtc,
      sunrise: times.sunrise,
      sunset: times.sunset,
      daylightSeconds,
      isMidnightSun,
      isPolarNight,
    }
  }

  return days
}
