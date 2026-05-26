/**
 * Dynamic sitemap with multiple sub-sitemaps.
 *
 * `generateSitemaps` makes Next emit:
 *   /sitemap.xml          â the sitemap-index, listing the children below
 *   /sitemap/cities.xml   â homepage + ~49k city pages
 *   /sitemap/months.xml   â top 100 cities Ã 12 months = 1,200 month pages
 *
 * Splitting matters because the combined list exceeds Google's 50k-URL
 * single-sitemap limit. Keeping each child well under 50k also leaves
 * headroom for future expansion (per-year pages, golden-hour pagesâ¦).
 *
 * Priority tiers:
 *   1.0   homepage
 *   0.9   top 1000 cities (prebuilt SSG)
 *   0.7   top 100 cities' month pages (prebuilt SSG)
 *   0.6   rest of cities (on-demand ISR)
 *   0.5   non-top-100 month pages (rendered on demand)
 */

import type { MetadataRoute } from 'next'
import { getTopCities } from '@/lib/cities'
import { MONTHS } from '@/lib/months'
import citiesData from '@/data/cities.json'

const BASE = 'https://howlongday.com'

interface CityRow {
  slug: string
}

export async function generateSitemaps() {
  return [{ id: 'cities' }, { id: 'months' }]
}

export default async function sitemap(
  { id }: { id: string },
): Promise<MetadataRoute.Sitemap> {
  const today = new Date()

  if (id === 'cities') {
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
        // Top-1000 cities are prebuilt SSG and refresh daily (sunrise/sunset
        // changes each day). The remaining ~48k tail cities use ISR and are
        // listed as 'weekly' to prevent crawlers from triggering a fresh ISR
        // write on every daily crawl — the main driver of Vercel ISR-Write
        // overage on the free tier.
        changeFrequency: topSlugs.has(c.slug) ? 'daily' : 'weekly',
        priority: topSlugs.has(c.slug) ? 0.9 : 0.6,
      })
    }
    if (entries.length > 49_500) {
      console.warn(
        `[sitemap:cities] approaching 50k URL limit: ${entries.length} entries`,
      )
    }
    return entries
  }

  if (id === 'months') {
    const top100 = getTopCities(100)
    const entries: MetadataRoute.Sitemap = []
    for (const c of top100) {
      for (const m of MONTHS) {
        entries.push({
          url: `${BASE}/${c.slug}/${m.slug}`,
          lastModified: today,
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
    }
    return entries
  }

  return []
}
