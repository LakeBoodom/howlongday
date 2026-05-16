/**
 * /sitemap.xml — manually-rendered sitemap-index.
 *
 * Why a route handler instead of relying on Next.js auto-generation:
 *   The `generateSitemaps` API in app/sitemap.ts produces the child
 *   sitemaps at /sitemap/cities.xml and /sitemap/months.xml, but Next 14
 *   does NOT also emit /sitemap.xml as the sitemap-index. Without this
 *   route, /sitemap.xml gets caught by the dynamic /[city]/page.tsx
 *   route and returns the branded 404 page — which is exactly what
 *   Google Search Console saw when it tried to fetch it ("Fetch failed").
 *
 * The folder name `sitemap.xml/` plus the static route handler wins over
 * the dynamic `[city]` segment, so this fires for the literal request
 * `GET /sitemap.xml`.
 */

const BASE = 'https://howlongday.com'

// Static — the index URLs don't change between deploys, only the child
// sitemaps' contents (which Next regenerates as needed).
export const dynamic = 'force-static'

export function GET() {
  const children = [
    { loc: `${BASE}/sitemap/cities.xml` },
    { loc: `${BASE}/sitemap/months.xml` },
  ]

  const today = new Date().toISOString().slice(0, 10)
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    (c) => `  <sitemap>
    <loc>${c.loc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
