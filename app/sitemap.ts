/**
 * Dynamic sitemap.xml — homepage + all 49k city pages.
 *
 * Single-file sitemap (under Google's 50k URL / 50 MB limits).
 * lastModified = today so search engines re-crawl recent updates.
 *
 * Priority tiers:
 *   1.0   homepage
 *   0.9   top 1000 cities (prebuilt SSG)
 *   0.6   rest (on-demand ISR)
 */

import type { MetadataRoute } from 'next'
import { getTopCities, getCityCount } from '@/lib/cities'
import citiesData from '@/data/cities.json'

const BASE = 'https://howlongday.com'

interface CityRow {
  slug: string
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date()
  const topSlugs = new Set(getTopCities(1000).map((c) => c.slug))
  const all = citiesData as CityRow[]

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  for (const c of all) {
    entries.push({
      url: `${BASE}/${c.slug}`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: topSlugs.has(c.slug) ? 0.9 : 0.6,
    })
  }

  // Sanity guard against future expansion: warn if we approach Google's 50k limit
  if (entries.length > 49_500) {
    console.warn(
      `[sitemap] approaching 50k URL limit: ${entries.length} entries — consider splitting into sitemap-index`,
    )
  }
  void getCityCount

  return entries
}
