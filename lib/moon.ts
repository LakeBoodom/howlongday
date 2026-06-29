/**
 * Moon — SunCalc wrappers for moonrise/moonset, phase and illumination, plus a
 * precomputed full/new-moon table so "next full moon" needs zero per-render
 * compute (mirrors the ASTRO_EVENTS approach for solstices).
 *
 * Like the sun helpers, all times are UTC Date objects; render them through
 * Intl.DateTimeFormat with the city's IANA timezone for local clock times.
 */

import SunCalc from 'suncalc'

export interface MoonSnapshot {
  /** UTC Date — format with timezone. Invalid Date if the moon doesn't rise/set today. */
  moonrise: Date
  moonset: Date
  /** Illuminated fraction of the disc, 0..1. */
  illumination: number
  /** Phase 0..1: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
  phaseValue: number
  /** Human phase name, e.g. "Waxing Gibbous". */
  phaseName: string
  /** True if the moon is above the horizon at `date`. */
  isUp: boolean
  /** Moon altitude in degrees at `date`. */
  altitudeDeg: number
  /** Moon never sets today (circumpolar). */
  alwaysUp: boolean
  /** Moon never rises today. */
  alwaysDown: boolean
}

function isValid(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime())
}

/** Map a 0..1 phase value to its conventional name. */
export function moonPhaseName(phase: number): string {
  const p = ((phase % 1) + 1) % 1
  if (p < 0.03 || p > 0.97) return 'New Moon'
  if (p < 0.22) return 'Waxing Crescent'
  if (p < 0.28) return 'First Quarter'
  if (p < 0.47) return 'Waxing Gibbous'
  if (p < 0.53) return 'Full Moon'
  if (p < 0.72) return 'Waning Gibbous'
  if (p < 0.78) return 'Last Quarter'
  return 'Waning Crescent'
}

export function getMoonSnapshot(date: Date, lat: number, lon: number): MoonSnapshot {
  const times = SunCalc.getMoonTimes(date, lat, lon)
  const illum = SunCalc.getMoonIllumination(date)
  const pos = SunCalc.getMoonPosition(date, lat, lon)
  const altitudeDeg = pos.altitude * (180 / Math.PI)

  return {
    moonrise: times.rise ?? new Date(NaN),
    moonset: times.set ?? new Date(NaN),
    illumination: illum.fraction,
    phaseValue: illum.phase,
    phaseName: moonPhaseName(illum.phase),
    isUp: altitudeDeg > 0,
    altitudeDeg,
    alwaysUp: Boolean((times as { alwaysUp?: boolean }).alwaysUp),
    alwaysDown: Boolean((times as { alwaysDown?: boolean }).alwaysDown),
  }
}

/** Moon altitude (degrees) at an arbitrary instant — used for stargazing checks. */
export function moonAltitudeDeg(date: Date, lat: number, lon: number): number {
  return SunCalc.getMoonPosition(date, lat, lon).altitude * (180 / Math.PI)
}

// ---------------------------------------------------------------------------
// Precomputed full / new moon dates (UTC), 2026–2027. Generated offline from
// SunCalc (hourly phase scan). Date-level accuracy is fine for a "next full
// moon" label. Extend this table when the range runs out.
// ---------------------------------------------------------------------------

export interface MoonEvent {
  /** ISO date, UTC. */
  date: string
  kind: 'full' | 'new'
  /** Display label, e.g. "Aug 28, 2026". */
  label: string
}

function isoLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00Z`))
}

const FULL_MOON_DATES = [
  '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-02', '2026-05-01',
  '2026-05-31', '2026-06-30', '2026-07-29', '2026-08-28', '2026-09-26',
  '2026-10-26', '2026-11-24', '2026-12-24', '2027-01-22', '2027-02-20',
  '2027-03-22', '2027-04-20', '2027-05-20', '2027-06-18', '2027-07-18',
  '2027-08-17', '2027-09-16', '2027-10-15', '2027-11-14', '2027-12-13',
]

const NEW_MOON_DATES = [
  '2026-01-18', '2026-02-17', '2026-03-19', '2026-04-17', '2026-05-16',
  '2026-06-15', '2026-07-14', '2026-08-12', '2026-09-11', '2026-10-10',
  '2026-11-09', '2026-12-09', '2027-01-07', '2027-02-06', '2027-03-08',
  '2027-04-07', '2027-05-06', '2027-06-04', '2027-07-04', '2027-08-02',
  '2027-08-31', '2027-09-30', '2027-10-29', '2027-11-28', '2027-12-27',
]

export const MOON_EVENTS: MoonEvent[] = [
  ...FULL_MOON_DATES.map((d) => ({ date: d, kind: 'full' as const, label: isoLabel(d) })),
  ...NEW_MOON_DATES.map((d) => ({ date: d, kind: 'new' as const, label: isoLabel(d) })),
].sort((a, b) => a.date.localeCompare(b.date))

export interface UpcomingMoonEvent {
  label: string
  daysAway: number
  kind: 'full' | 'new'
}

function nextOfKind(now: Date, kind: 'full' | 'new'): UpcomingMoonEvent | null {
  for (const e of MOON_EVENTS) {
    if (e.kind !== kind) continue
    const d = new Date(`${e.date}T12:00:00Z`)
    if (d.getTime() > now.getTime()) {
      const daysAway = Math.max(
        0,
        Math.round((d.getTime() - now.getTime()) / 86_400_000),
      )
      return { label: e.label, daysAway, kind }
    }
  }
  return null
}

export function nextFullMoon(now: Date): UpcomingMoonEvent | null {
  return nextOfKind(now, 'full')
}

export function nextNewMoon(now: Date): UpcomingMoonEvent | null {
  return nextOfKind(now, 'new')
}
