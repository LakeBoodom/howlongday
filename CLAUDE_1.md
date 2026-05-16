# HowLongDay.com — CLAUDE.md

## Project overview
SEO-driven programmatic site showing sunrise, sunset, golden hour, blue hour, and daylight duration for 50,000+ cities worldwide. Each city gets its own statically generated page. Primary monetization: AdSense. Primary growth: organic Google search.

## Tech stack
- **Framework**: Next.js 14 (App Router, SSG / ISR)
- **Hosting**: Vercel
- **Data**: Open-Meteo Astronomy API (free, no key needed)
- **Sun position**: SunCalc library (npm: suncalc)
- **City database**: GeoNames `cities15000.txt` (~50k cities, pre-processed to JSON)
- **Styling**: Tailwind CSS
- **Fonts**: Inter SemiBold (600) + Inter Regular (400) — Google Fonts
- **Analytics**: Vercel Analytics + Google Search Console

---

## Brand system

### Logo
The logo consists of:
1. **SVG arc** — smooth bezier curve from a warm orange dot (sunrise, left) through a glowing sun dot (current/top) to a cool blue dot (sunset, right)
2. **Wordmark** — "Howlongday" in Inter SemiBold, white
3. **Tagline** — "MAKE THE MOST OF DAYLIGHT" in Inter Regular, wide letter-spacing, color #A7B0C0

Arc stroke gradient: `#FFB23D → #FF6A00 → #FFD18A → #3AA0FF`
Sun dot: `#FFC24D` with radial glow/shadow

Logo component `/components/Logo.tsx` renders:
- Full version (arc + wordmark + tagline) for hero/marketing
- Compact version (arc + wordmark, no tagline) for navbar desktop
- Icon only (arc SVG) for navbar mobile

### Typography
| Use | Font | Weight |
|-----|------|--------|
| Logo / headings / city name | Inter | SemiBold 600 |
| Body text | Inter | Regular 400 |
| Data values (times, durations) | Inter | SemiBold 600 |
| Small caps labels | Inter | Medium 500, letter-spacing 0.12em, uppercase |

Google Fonts import: `Inter:wght@400;500;600`

### Color palette
```
ARC GRADIENT:      #FFB23D → #FF6A00 → #FFD18A → #3AA0FF
SUN GLOW:          #FFC24D
SUNRISE accent:    #FF8A00   (warm orange — sunrise time values)
SUNSET accent:     #3AA0FF   (cool blue — sunset time values)
DAYLIGHT GOLD:     #FFD18A   (duration card highlight)

BG deepest:        #0B1220
BG mid:            #1E2533
NEUTRAL 1:         #FFFFFF
NEUTRAL 2:         #E6EAF2
NEUTRAL 3:         #A7B0C0
NEUTRAL 4:         #6B778C
NEUTRAL 5:         #1E2533
NEUTRAL 6:         #0B1220

TEXT primary:      #FFFFFF
TEXT muted:        #A7B0C0
TEXT dim:          #6B778C
CARD bg:           rgba(255,255,255,0.04)
CARD border:       rgba(255,255,255,0.08)
CARD radius:       16px
```

---

## Dynamic CSS sky (hero background)

**CRITICAL: No stock photos. No external images ever. Pure CSS gradients + SVG only.**

The hero sky is generated from the city's real-time solar elevation angle, making every city and every time of day visually unique.

### Sky states — implement in `/lib/sky.ts`

```typescript
export interface SkyConfig {
  gradient: string
  glowColor: string
  glowOpacity: number
  showStars: boolean
  starIntensity: number // 0.0 – 1.0
}

export function getSkyGradient(solarElevationDeg: number, isAfterNoon: boolean): SkyConfig {

  // ASTRONOMICAL NIGHT — elevation < -18°
  if (solarElevationDeg < -18) return {
    gradient: 'linear-gradient(180deg, #020408 0%, #04091a 40%, #060d20 100%)',
    glowColor: 'transparent', glowOpacity: 0,
    showStars: true, starIntensity: 1.0,
  }

  // NAUTICAL TWILIGHT — -18° to -12°
  if (solarElevationDeg < -12) return {
    gradient: 'linear-gradient(180deg, #020810 0%, #07132b 50%, #0d1f3a 100%)',
    glowColor: '#1a3a6b', glowOpacity: 0.2,
    showStars: true, starIntensity: 0.7,
  }

  // BLUE HOUR — -12° to -4°
  if (solarElevationDeg < -4) return {
    gradient: 'linear-gradient(180deg, #060e24 0%, #0e2248 40%, #1a3a6b 75%, #2a5a8a 100%)',
    glowColor: '#3a6bc4', glowOpacity: 0.4,
    showStars: true, starIntensity: 0.3,
  }

  // GOLDEN HOUR DAWN — 0° to 6°, before noon
  if (solarElevationDeg < 6 && !isAfterNoon) return {
    gradient: 'linear-gradient(180deg, #0e1830 0%, #2d1f3d 30%, #6b2d1a 55%, #c4622d 72%, #e8943a 85%, #f5c876 95%, #fff2c8 100%)',
    glowColor: '#e8943a', glowOpacity: 0.5,
    showStars: false, starIntensity: 0,
  }

  // GOLDEN HOUR DUSK — 0° to 6°, after noon
  if (solarElevationDeg < 6 && isAfterNoon) return {
    gradient: 'linear-gradient(180deg, #0e1830 0%, #1a2545 25%, #4a1f10 45%, #8b3010 60%, #d4612a 75%, #f08040 87%, #f5c070 95%, #fff0c0 100%)',
    glowColor: '#f08040', glowOpacity: 0.55,
    showStars: false, starIntensity: 0,
  }

  // LOW SUN — 6° to 20°
  if (solarElevationDeg < 20) return {
    gradient: 'linear-gradient(180deg, #0a1628 0%, #1a3555 30%, #2a5580 60%, #5a8ab0 82%, #a0c0d8 93%, #d0e8f0 100%)',
    glowColor: '#f0c060', glowOpacity: 0.3,
    showStars: false, starIntensity: 0,
  }

  // HIGH SUN — 20° to 50°
  if (solarElevationDeg < 50) return {
    gradient: 'linear-gradient(180deg, #0a1f3d 0%, #1a4080 25%, #2a6ab0 55%, #4a90d0 80%, #80b8e8 100%)',
    glowColor: '#ffe080', glowOpacity: 0.2,
    showStars: false, starIntensity: 0,
  }

  // PEAK SUN — 50°+ (equatorial / midsummer)
  return {
    gradient: 'linear-gradient(180deg, #0d2545 0%, #1a50a0 30%, #3080d0 65%, #60a8e8 88%, #a0d0f0 100%)',
    glowColor: '#fff5a0', glowOpacity: 0.15,
    showStars: false, starIntensity: 0,
  }
}
```

### Special sky cases
- **Midnight sun** (lat > 66.5°, sun never sets in summer): Use golden-hour-dawn gradient even at midnight. Show badge "☀️ Midnight Sun" on hero.
- **Polar night** (lat > 66.5°, sun never rises in winter): Use astronomical night all day. Show badge "🌑 Polar Night" on hero.

### Star field (CSS only, no canvas)
```tsx
// StarField.tsx — render only when showStars: true
// 10 radial-gradient dots at hardcoded positions, opacity from starIntensity
const STAR_POSITIONS = [
  { x: '15%', y: '12%', size: '1px' },
  { x: '28%', y: '8%',  size: '1px' },
  { x: '42%', y: '15%', size: '1px' },
  { x: '67%', y: '6%',  size: '1.5px' },
  { x: '78%', y: '18%', size: '1px' },
  { x: '88%', y: '10%', size: '1.5px' },
  { x: '8%',  y: '25%', size: '1px' },
  { x: '54%', y: '22%', size: '1px' },
  { x: '35%', y: '5%',  size: '1px' },
  { x: '92%', y: '28%', size: '1px' },
]
```

### Sun arc SVG — `/components/SunArc.tsx`
```tsx
// Arc: SVG bezier from (60, 320) → control (480, -40) → (900, 320)
// Sun dot x position: map solar azimuth 130°–230° → SVG x 60–900
// Sun dot y position: solve for y on bezier at that x (parametric)
// Sun dot: circle r=10, fill #fff8e0, glow with filter: drop-shadow
// Animate: CSS keyframes pulse on sun dot when elevation > 0°
// Endpoint dots: left = #FF8A00 (sunrise), right = #3AA0FF (sunset)
// Arc stroke: linearGradient sunrise-orange → midday-gold → sunset-blue
// Dashed when sun below horizon, solid when above
```

---

## URL structure
```
/[city-slug]                    → main city page (today)
/[city-slug]/[month]            → e.g. /helsinki/june
/[city-slug]/[year]             → e.g. /helsinki/2026
/[city-slug]/golden-hour        → golden hour focus page
/country/[country-slug]         → country overview
/country/[country-slug]/[city]  → aliases → canonical /[city]
```
Slugs: lowercase hyphenated. Duplicates: `cambridge-uk` / `cambridge-us`.

---

## Page anatomy (city page)

### 1. Hero (500px)
- Background: `getSkyGradient()` CSS gradient — no images
- SVG sun arc with real solar position
- Horizon glow radial overlay
- Stars CSS layer (conditional)
- Nav: Logo left | Today / Map / Explore / API right
- Search: glassmorphism input, city autocomplete, centered bottom of hero

### 2. City header
- `{City}` Inter SemiBold 40px + `{Country}` muted inline
- Date "Friday, May 15, 2026" — uppercase, letter-spaced, dim

### 3. Primary data cards (4-column)
| Card | Font color |
|------|-----------|
| Sunrise HH:MM | #FF8A00 |
| Sunset HH:MM | #3AA0FF |
| Solar Noon HH:MM | #FFFFFF |
| Daylight Duration 18h 44m | #FFD18A, gold-tinted card bg |

Duration card: progress bar (% of city's annual max daylight), sub-label "peaks Jun 21".

### 4. Secondary row (4-column)
- Golden Hour window
- Blue Hour window
- Countdown to next solstice/equinox
- Context card: fun local fact (midnight sun, polar night, daylight vs darkest day delta)

### 5. Popular cities pills
Horizontal scroll, ~12 cities. Active: gold border + text.

### 6. SEO section (2-column)
Left: H1 prose + bullet facts
Right: FAQ accordion (schema.org FAQPage)

Target queries per city:
- "What time is sunset in {City} today?"
- "When is golden hour in {City}?"
- "How long is daylight in {City} in [month]?"
- "When is the longest day of the year in {City}?"
- "Does {City} have midnight sun?"

### 7. Features bar
`200+ countries · Astronomical precision · 50,000+ cities · Golden & Blue hour · Free API · Free forever`

---

## Data fetching

### Open-Meteo (server-side, cached 24h)
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &daily=sunrise,sunset,daylight_duration
  &timezone=auto&forecast_days=1
```

### SunCalc (solar position + twilight times)
```typescript
import SunCalc from 'suncalc'
const times = SunCalc.getTimes(date, lat, lon)
const pos   = SunCalc.getPosition(now, lat, lon)
// elevation degrees: pos.altitude * (180 / Math.PI)
// golden hour: elevation 0°–6°
// blue hour:   elevation -6°–(-4°)
```

### City database `/data/cities.json`
Source: GeoNames `cities15000.txt`
Schema: `{ name, slug, country, countryCode, lat, lon, timezone, population }`
~50,000 records. Loaded at build time only.

---

## Static generation
- `generateStaticParams()` → all 50k slugs → full SSG build
- `revalidate = 86400` (ISR, refresh daily)
- All times rendered in city's local timezone server-side

---

## SEO
```html
<title>How Long Is the Day in {City} Today? | HowLongDay</title>
<meta name="description" content="Today in {City}, {Country}: sunrise {time}, sunset {time}. Daylight: {duration}. Golden hour: {range}. Blue hour: {range}.">
<link rel="canonical" href="https://howlongday.com/{slug}">
```
Schema.org: `FAQPage` per city, `BreadcrumbList` in nav.
Auto-generated XML sitemap → submit to Search Console on launch.

---

## Monetization
- AdSense: 1 leaderboard below hero, 1 rectangle in SEO section
- Responsive units only. No ads above the fold on mobile.

---

## File structure
```
/app
  /[city]/page.tsx
  /[city]/[month]/page.tsx
  /country/[country]/page.tsx
  /layout.tsx                   ← Inter font, Vercel Analytics
  /page.tsx                     ← homepage, geo-detect or default Helsinki
/lib
  /cities.ts                    ← lookup, slug gen, duplicate handling
  /astronomy.ts                 ← Open-Meteo + SunCalc wrappers
  /sky.ts                       ← getSkyGradient() — CSS sky system
  /seo.ts                       ← generateMetadata() helpers
/data
  /cities.json                  ← 50k cities
/components
  /Logo.tsx                     ← SVG arc logo, full/compact/icon variants
  /HeroSky.tsx                  ← CSS sky + arc + stars + glow, composed
  /SunArc.tsx                   ← SVG arc with real sun position
  /StarField.tsx                ← CSS-only stars
  /DataCards.tsx                ← 4-card primary grid
  /SecondaryRow.tsx             ← golden/blue hour + context card
  /CitySearch.tsx               ← autocomplete (client component)
  /SeoSection.tsx               ← prose + FAQ accordion
  /FaqItem.tsx                  ← accordion item + schema markup
  /Pill.tsx
```

---

## Non-goals (v1)
- User accounts / saved cities
- Map view
- Weather data
- Photography features
- Native app
- Multilingual (English only)

---

## Launch checklist
- [x] Domain: howlongday.com registered
- [ ] Cloudflare DNS configured
- [ ] Vercel project → GitHub (LakeBoodom)
- [ ] 50k pages building without errors
- [ ] Dynamic sky: tested for day / golden / blue / night states
- [ ] Sun arc position accurate (test: Helsinki, Dubai, Reykjavik, Singapore, Tromsø)
- [ ] Midnight sun + polar night badges rendering
- [ ] Core Web Vitals green
- [ ] Sitemap submitted to Google Search Console
- [ ] AdSense approved + units placed
- [ ] FAQPage schema validated (Rich Results Test)
- [ ] robots.txt allows full indexing
