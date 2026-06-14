// Offline precompute of per-city annual "sun profiles".
// Run once (and yearly). Never runs on Vercel.
//   node scripts/build-sun-profiles.mjs [topN]
// Writes data/sun-profiles.json keyed by slug.
//
// Stores compact integers; the page render reads these (0 SunCalc calls).
// Times are local minute-of-day (DST-correct for that date). Dates are [month,day].

import SunCalc from 'suncalc'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const YEAR = Number(process.argv[3]) || 2026
const TOP_N = Number(process.argv[2]) || 5000

const cities = JSON.parse(readFileSync(join(ROOT, 'data/cities.json'), 'utf8'))
  .slice()
  .sort((a, b) => b.population - a.population)
  .slice(0, TOP_N)

const isValid = (d) => d instanceof Date && !isNaN(d.getTime())
const DAYS = (() => {
  const leap = (YEAR % 4 === 0 && YEAR % 100 !== 0) || YEAR % 400 === 0
  return leap ? 366 : 365
})()

function profileFor(city) {
  const { lat, lon, timezone } = city
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const dmf = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, month: 'numeric', day: 'numeric',
  })
  const minOfDay = (d) => {
    const p = fmt.formatToParts(d)
    const h = +p.find((x) => x.type === 'hour').value
    const m = +p.find((x) => x.type === 'minute').value
    return h * 60 + m
  }
  const monthDay = (d) => {
    const p = dmf.formatToParts(d)
    return [+p.find((x) => x.type === 'month').value, +p.find((x) => x.type === 'day').value]
  }

  let longest = { sec: -1, date: null }
  let shortest = { sec: Infinity, date: null }
  // Rank by a midnight-wrap-safe value (raw clock minute adjusted ±1440 when
  // the event falls on a different local calendar day than the noon anchor —
  // e.g. high-latitude sunsets that cross past midnight). Store raw clock
  // minute for display.
  let eSunrise = { rank: Infinity, min: 0, date: null }
  let lSunrise = { rank: -Infinity, min: 0, date: null }
  let eSunset = { rank: Infinity, min: 0, date: null }
  let lSunset = { rank: -Infinity, min: 0, date: null }
  let hasMidnightSun = false, hasPolarNight = false, hasWhiteNights = false

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(Date.UTC(YEAR, 0, 1, 12) + i * 86_400_000)
    const t = SunCalc.getTimes(d, lat, lon)
    const srInvalid = !isValid(t.sunrise)

    let sec
    if (srInvalid) {
      const elev = SunCalc.getPosition(d, lat, lon).altitude
      if (elev > 0) { sec = 86400; hasMidnightSun = true }
      else { sec = 0; hasPolarNight = true }
    } else if (isValid(t.sunset)) {
      sec = (t.sunset - t.sunrise) / 1000
      if (!isValid(t.night)) hasWhiteNights = true
      const anchorDay = monthDay(d)[1]
      const srMin = minOfDay(t.sunrise)
      const ssMin = minOfDay(t.sunset)
      const srRank = srMin - (monthDay(t.sunrise)[1] !== anchorDay ? 1440 : 0)
      const ssRank = ssMin + (monthDay(t.sunset)[1] !== anchorDay ? 1440 : 0)
      if (srRank < eSunrise.rank) eSunrise = { rank: srRank, min: srMin, date: d }
      if (srRank > lSunrise.rank) lSunrise = { rank: srRank, min: srMin, date: d }
      if (ssRank < eSunset.rank) eSunset = { rank: ssRank, min: ssMin, date: d }
      if (ssRank > lSunset.rank) lSunset = { rank: ssRank, min: ssMin, date: d }
    } else { sec = 0 }

    if (sec > longest.sec) longest = { sec, date: d }
    if (sec < shortest.sec) shortest = { sec, date: d }
  }

  const monthlyAvgMin = Array.from({ length: 12 }, (_, m) => {
    const d = new Date(Date.UTC(YEAR, m, 15, 12))
    const t = SunCalc.getTimes(d, lat, lon)
    let s
    if (!isValid(t.sunrise)) s = SunCalc.getPosition(d, lat, lon).altitude > 0 ? 86400 : 0
    else if (isValid(t.sunset)) s = (t.sunset - t.sunrise) / 1000
    else s = 0
    return Math.round(s / 60)
  })

  const category = (hasMidnightSun || hasPolarNight) ? 'extreme'
    : hasWhiteNights ? 'white-nights' : 'always-dark'

  const out = {
    maxDayMin: Math.round(longest.sec / 60),
    minDayMin: Math.round(shortest.sec / 60),
    longest: monthDay(longest.date),
    shortest: monthDay(shortest.date),
    category,
    midnightSun: hasMidnightSun,
    polarNight: hasPolarNight,
    monthlyAvgMin,
  }
  if (eSunrise.date) out.earliestSunrise = [...monthDay(eSunrise.date), eSunrise.min]
  if (lSunrise.date) out.latestSunrise = [...monthDay(lSunrise.date), lSunrise.min]
  if (eSunset.date) out.earliestSunset = [...monthDay(eSunset.date), eSunset.min]
  if (lSunset.date) out.latestSunset = [...monthDay(lSunset.date), lSunset.min]
  return out
}

const t0 = Date.now()
const result = {}
for (let i = 0; i < cities.length; i++) {
  result[cities[i].slug] = profileFor(cities[i])
  if (i % 500 === 0) process.stderr.write(`  ${i}/${cities.length}\r`)
}
writeFileSync(join(ROOT, 'data/sun-profiles.json'), JSON.stringify(result))
const kb = (Buffer.byteLength(JSON.stringify(result)) / 1024).toFixed(0)
console.error(`\nDone: ${cities.length} cities, ${kb} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s`)
