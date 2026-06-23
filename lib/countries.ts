/**
 * Curated country hubs (/country/[slug]).
 *
 * We deliberately do NOT generate a hub for every country in the dataset —
 * only this hand-picked set, so each is a real, useful landing page rather
 * than thin programmatic filler. Expand this list as demand is proven in GSC.
 *
 * `code` is the ISO countryCode as it appears in data/cities.json.
 */

export interface CountryHub {
  slug: string
  code: string
  name: string
}

export const COUNTRY_HUBS: CountryHub[] = [
  { slug: 'united-states', code: 'US', name: 'the United States' },
  { slug: 'united-kingdom', code: 'GB', name: 'the United Kingdom' },
  { slug: 'india', code: 'IN', name: 'India' },
  { slug: 'finland', code: 'FI', name: 'Finland' },
  { slug: 'norway', code: 'NO', name: 'Norway' },
  { slug: 'spain', code: 'ES', name: 'Spain' },
  { slug: 'france', code: 'FR', name: 'France' },
  { slug: 'italy', code: 'IT', name: 'Italy' },
  { slug: 'japan', code: 'JP', name: 'Japan' },
  { slug: 'australia', code: 'AU', name: 'Australia' },
]

const bySlug = new Map(COUNTRY_HUBS.map((c) => [c.slug, c]))

export function getCountryHub(slug: string): CountryHub | null {
  return bySlug.get(slug.toLowerCase()) ?? null
}
