/**
 * Smoke test for lib/astronomy + lib/sky + lib/cities.
 * Run: npm run test:astro
 *
 * Verifies 5 reference cities at 2026-05-16 12:00 UTC.
 */

import { getCityBySlug } from '../lib/cities'
import {
  getSolarSnapshot,
  formatLocalTime,
  formatDuration,
  getMaxDaylight,
} from '../lib/astronomy'
import { getSkyGradient } from '../lib/sky'

const FIXED_DATE = new Date('2026-05-16T12:00:00Z')

const targets = ['helsinki', 'tromso', 'reykjavik', 'dubai', 'singapore', 'sydney']

console.log(`Probe date (UTC): ${FIXED_DATE.toISOString()}\n`)

for (const slug of targets) {
  const city = getCityBySlug(slug)
  if (!city) {
    console.log(`❌ ${slug.padEnd(12)} — not in dataset`)
    continue
  }
  const snap = getSolarSnapshot(FIXED_DATE, city.lat, city.lon)
  const sky = getSkyGradient(snap.elevationDeg, snap.isAfterNoon)
  const maxDay = getMaxDaylight(city.lat, city.lon, 2026)
  const pct = ((snap.daylightSeconds / maxDay) * 100).toFixed(1)

  console.log(
    `${city.name} (${city.country}) — lat ${city.lat.toFixed(2)} tz ${city.timezone}`,
  )
  console.log(`  Local clock now:   ${formatLocalTime(FIXED_DATE, city.timezone)}`)
  console.log(`  Sunrise:           ${formatLocalTime(snap.sunrise, city.timezone)}`)
  console.log(`  Sunset:            ${formatLocalTime(snap.sunset, city.timezone)}`)
  console.log(`  Solar noon:        ${formatLocalTime(snap.solarNoon, city.timezone)}`)
  console.log(`  Daylight:          ${formatDuration(snap.daylightSeconds)} (${pct}% of annual peak)`)
  console.log(`  Sun elevation:     ${snap.elevationDeg.toFixed(1)}°  azimuth ${snap.azimuthDeg.toFixed(0)}°`)
  console.log(`  Sky phase:         ${sky.phase}`)
  if (snap.isMidnightSun) console.log(`  ☀️  MIDNIGHT SUN`)
  if (snap.isPolarNight) console.log(`  🌑  POLAR NIGHT`)
  console.log()
}
