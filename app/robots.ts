import type { MetadataRoute } from 'next'

/**
 * robots.txt
 *
 * Search engines that drive real traffic (Google, Bing, DuckDuckGo,
 * Apple) are allowed full crawl. Everything else gets a crawl-delay,
 * and the high-volume commercial SEO / AI scrapers are blocked
 * outright.
 *
 * Why: the site has ~49k city pages, of which only the top 1000 are
 * prebuilt (SSG). The ~48k long-tail pages render on-demand via ISR,
 * and every uncached crawl hit is a serverless function invocation +
 * ISR write. Aggressive scrapers (Ahrefs, Semrush, AI crawlers, etc.)
 * were systematically walking the entire long tail 24/7, driving
 * Vercel free-tier usage over its limit. These bots bring zero search
 * traffic, so blocking them removes the cost with no SEO downside.
 */

const BLOCKED_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'AhrefsBot',
  'SemrushBot',
  'DotBot',
  'MJ12bot',
  'DataForSeoBot',
  'BLEXBot',
  'PetalBot',
  'SeekportBot',
  'MegaIndex',
  'Barkrowler',
  'ZoominfoBot',
  'serpstatbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Real search engines — full access.
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      // High-volume commercial SEO / AI scrapers — blocked outright.
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: '/' })),
      // Everyone else — allowed, but throttled to protect ISR budget.
      { userAgent: '*', allow: '/', crawlDelay: 10 },
    ],
    sitemap: 'https://howlongday.com/sitemap.xml',
    host: 'https://howlongday.com',
  }
}
