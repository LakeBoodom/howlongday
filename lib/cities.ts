/**
 * City data lookups — SERVER-ONLY.
 *
 * Imports the full 8 MB cities.json. This is fine for:
 *   - Server components (city pages, RSC)
 *   - generateStaticParams() at build time
 *   - API routes
 *
 * NEVER import this from a client component — it would ship 8 MB to the browser.
 * For client search/autocomplete, build a trimmed dataset (top 5k + indexes)
 * and serve via a separate /api/cities/search route or precomputed JSON.
 */

import citiesData from '@/data/cities.json'

export interface City {
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

const ALL = citiesData as City[]

// O(1) lookup. Built once at module load.
const bySlug: Map<string, City> = new Map(ALL.map((c) => [c.slug, c]))

export function getCityBySlug(slug: string): City | null {
  return bySlug.get(slug) ?? null
}

export function getAllSlugs(): string[] {
  return ALL.map((c) => c.slug)
}

/** Top N cities by population — used for prebuilt static params and pills. */
export function getTopCities(n: number): City[] {
  return ALL.slice(0, n)
}

/**
 * Is the given slug in the top N by population? Used to gate behaviour that
 * should only happen on prebuilt (SSG) pages — e.g. prev/next month
 * navigation, which on non-prebuilt cities would trigger ISR writes for the
 * whole 12-month chain.
 */
const topSlugCache: Map<number, Set<string>> = new Map()
export function isTopCity(slug: string, n: number): boolean {
  let set = topSlugCache.get(n)
  if (!set) {
    set = new Set(ALL.slice(0, n).map((c) => c.slug))
    topSlugCache.set(n, set)
  }
  return set.has(slug)
}

export function getCitiesByCountry(countryCode: string): City[] {
  return ALL.filter((c) => c.countryCode === countryCode.toUpperCase())
}

export function getCityCount(): number {
  return ALL.length
}
