/**
 * Build public/cities-search.json — a trimmed search index for the
 * client-side autocomplete.
 *
 * Run: npm run build:search-index
 *
 * Input:  data/cities.json (49k cities, ~8 MB)
 * Output: public/cities-search.json (top 5000 cities, ~250-350 KB)
 *
 * We keep only the fields the client needs to display a result and
 * link to its page. Population stays so we can break ties (e.g.
 * "York" → York, UK comes before smaller Yorks).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

interface City {
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

interface SearchCity {
  slug: string
  name: string
  country: string
  countryCode: string
  population: number
}

const TOP_N = 5000

/**
 * Hand-curated extras — small places that wouldn't make the top-N cut by
 * population alone but matter to Heikki or to specific user cohorts.
 * Slugs must exist in data/cities.json.
 */
const EXTRA_SLUGS = [
  'ristiina', // Heikki spends a lot of time there
]

const root = process.cwd()
const inPath = join(root, 'data', 'cities.json')
const outDir = join(root, 'public')
const outPath = join(outDir, 'cities-search.json')

const all = JSON.parse(readFileSync(inPath, 'utf8')) as City[]

// cities.json is already sorted by population descending (build-cities.ts).
// Defensive resort to guarantee that invariant.
all.sort((a, b) => b.population - a.population)

const seen = new Set<string>()
const selected: City[] = []
for (const c of all.slice(0, TOP_N)) {
  if (!seen.has(c.slug)) {
    seen.add(c.slug)
    selected.push(c)
  }
}
// Append hand-curated extras (dedup against the top-N list)
const bySlug = new Map(all.map((c) => [c.slug, c]))
for (const slug of EXTRA_SLUGS) {
  if (seen.has(slug)) continue
  const c = bySlug.get(slug)
  if (!c) {
    console.warn(`[search-index] EXTRA_SLUGS entry "${slug}" not in cities.json — skipped`)
    continue
  }
  selected.push(c)
  seen.add(slug)
}

const top: SearchCity[] = selected.map((c) => ({
  slug: c.slug,
  name: c.name,
  country: c.country,
  countryCode: c.countryCode,
  population: c.population,
}))

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, JSON.stringify(top))

const sizeKB = (Buffer.byteLength(JSON.stringify(top), 'utf8') / 1024).toFixed(1)
console.log(
  `[search-index] wrote ${top.length} cities → ${outPath} (${sizeKB} KB)`,
)
console.log(`[search-index] smallest city: ${top[top.length - 1].name} (${top[top.length - 1].population.toLocaleString()})`)
