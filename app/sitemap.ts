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
import { COUNTRY_HUBS } from '@/lib/countries'
import { NATIONAL_PARKS } from '@/lib/parks'

const GUIDE_SLUGS = [
  'longest-day-around-the-world',
  'best-cities-for-long-summer-evenings',
  'best-time-to-visit-us-national-parks',
]

const BASE = 'https://howlongday.com'

// Only the top N cities by population are advertised in the sitemap. The
// ~44k long-tail villages are ISR-on-demand and have negligible search
// demand, but crawlers walking them all 24/7 drove Vercel free-tier usage
// over its ISR / function-invocation limit. Tail pages still resolve on
// direct request — they are just not exposed to crawlers. Raise this once
// on a paid plan or after tail pages are made fully static.
const SITEMAP_CITY_LIMIT = 5000

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
    // Cap the advertised crawl surface to the top cities by population.
    const all = getTopCities(SITEMAP_CITY_LIMIT) as CityRow[]
    const entries: MetadataRoute.Sitemap = [
      {
        url: BASE,
        lastModified: today,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        // Timely topical hub — advertise prominently while the tournament is on.
        url: `${BASE}/world-cup-2026`,
        lastModified: today,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...COUNTRY_HUBS.map((c) => ({
        url: `${BASE}/country/${c.slug}`,
        lastModified: today,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...GUIDE_SLUGS.map((slug) => ({
        url: `${BASE}/guides/${slug}`,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...NATIONAL_PARKS.map((p) => ({
        url: `${BASE}/parks/${p.slug}`,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
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
    const top100Slugs = new Set(getTopCities(100).map((c) => c.slug))
    const top1000 = getTopCities(1000)
    const entries: MetadataRoute.Sitemap = []
    for (const c of top1000) {
      for (const m of MONTHS) {
        entries.push({
          url: `${BASE}/${c.slug}/${m.slug}`,
          lastModified: today,
          changeFrequency: 'monthly',
          // Top-100 city month pages get higher priority — these are the most
          // competitive planning queries. Cities 101-1000 are valuable but
          // slightly lower signal for Googlebot budget allocation.
          priority: top100Slugs.has(c.slug) ? 0.7 : 0.6,
        })
      }
    }
    return entries
  }

  return []
}
