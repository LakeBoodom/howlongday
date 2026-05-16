import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://howlongday.com/sitemap.xml',
    host: 'https://howlongday.com',
  }
}
