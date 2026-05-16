/**
 * Build data/cities.json from all-the-cities (GeoNames-derived) +
 * geo-tz (timezone resolution) + i18n-iso-countries (country names).
 *
 * Run: npm run build:cities
 *
 * Output schema:
 *   {
 *     id: number          // GeoNames cityId — stable across builds
 *     name: string        // display name in source language ("München")
 *     slug: string        // URL-safe ascii ("munchen", "cambridge-gb")
 *     country: string     // English country name
 *     countryCode: string // ISO 3166-1 alpha-2
 *     lat, lon: number
 *     timezone: string    // IANA tz ("Europe/Berlin")
 *     population: number
 *   }
 */

import cities from 'all-the-cities'
import tzlookup from 'tz-lookup'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json' with { type: 'json' }
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

countries.registerLocale(enLocale as any)

interface OutCity {
  id: number
  name: string
  slug: string
  country: string
  countryCode: string
  lat: number
  lon: number
  timezone: string
  population: number
}

// Population threshold — spec wants "50,000+ cities". cities5000 ≈ 50k.
const MIN_POP = 5000

// Nordic / German / Slavic letters that don't decompose under NFD —
// map them to ASCII transliterations before generic diacritic stripping.
const SPECIAL_CHARS: Record<string, string> = {
  ø: 'o', Ø: 'o',
  æ: 'ae', Æ: 'ae',
  å: 'a', Å: 'a',
  œ: 'oe', Œ: 'oe',
  ß: 'ss',
  đ: 'd', Đ: 'd',
  ð: 'd', Ð: 'd',
  þ: 'th', Þ: 'th',
  ł: 'l', Ł: 'l',
  ı: 'i', İ: 'i',
}

function slugify(name: string): string {
  let s = name
  for (const [k, v] of Object.entries(SPECIAL_CHARS)) {
    s = s.split(k).join(v)
  }
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip combining diacritics
    .toLowerCase()
    .replace(/[''’`]/g, '')            // strip apostrophes (n'djamena → ndjamena)
    .replace(/[^a-z0-9\s-]/g, ' ')     // anything else → space
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

console.log(`Loaded ${cities.length.toLocaleString()} cities from all-the-cities`)

const filtered = cities.filter((c) => c.population >= MIN_POP)
console.log(`After pop ≥ ${MIN_POP}: ${filtered.length.toLocaleString()}`)

// Sort by population desc — biggest city wins the canonical slug
filtered.sort((a, b) => b.population - a.population)

const out: OutCity[] = []
let tzMisses = 0
let i = 0
for (const c of filtered) {
  const [lon, lat] = c.loc.coordinates
  let timezone = 'UTC'
  try {
    timezone = tzlookup(lat, lon)
  } catch {
    tzMisses++
  }
  const countryName = countries.getName(c.country, 'en') || c.country
  const baseSlug = slugify(c.name)
  if (!baseSlug) continue // skip nameless entries
  out.push({
    id: c.cityId,
    name: c.name,
    slug: baseSlug,
    country: countryName,
    countryCode: c.country,
    lat,
    lon,
    timezone,
    population: c.population,
  })
  if (++i % 10000 === 0) console.log(`  …processed ${i.toLocaleString()}`)
}

console.log(`Timezone fallbacks to UTC: ${tzMisses}`)

// Dedup slugs: collision rules
//   1st  occurrence → keep base slug
//   2nd  → suffix with -<countrycode>
//   3rd+ → suffix with -<countrycode>-<id>
const seen = new Set<string>()
let collisionsCountry = 0
let collisionsId = 0
for (const c of out) {
  let s = c.slug
  if (seen.has(s)) {
    s = `${c.slug}-${c.countryCode.toLowerCase()}`
    collisionsCountry++
    if (seen.has(s)) {
      s = `${c.slug}-${c.countryCode.toLowerCase()}-${c.id}`
      collisionsId++
    }
  }
  seen.add(s)
  c.slug = s
}

console.log(`Slug collisions resolved with country suffix: ${collisionsCountry}`)
console.log(`Slug collisions resolved with id suffix:      ${collisionsId}`)

// Write
const outPath = join(process.cwd(), 'data', 'cities.json')
mkdirSync(dirname(outPath), { recursive: true })
const json = JSON.stringify(out)
writeFileSync(outPath, json)
console.log(`\nWrote ${outPath}`)
console.log(`  ${out.length.toLocaleString()} cities, ${(json.length / 1024 / 1024).toFixed(2)} MB`)
