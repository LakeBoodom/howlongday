/**
 * GET /api/nearby
 *
 * Returns the nearest city + today's solar snapshot for the visitor.
 *
 * Location source, in order:
 *   1. ?lat=&lon= query params  — used by the optional "use exact location"
 *      opt-in (browser geolocation), which the user must click.
 *   2. Vercel IP-geolocation headers (x-vercel-ip-latitude/longitude) — the
 *      default, server-side, NO browser permission prompt.
 *   3. Neither available (e.g. local dev) → 204, client keeps its default city.
 *
 * Caching: responses are per-visitor (IP-derived), so they MUST be `private`
 * — never let the shared CDN cache one visitor's city and serve it to others.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSolarSnapshot, formatLocalTime, formatDuration } from '@/lib/astronomy'
import citiesData from '@/data/cities.json'

export const dynamic = 'force-dynamic'

interface CityRow {
  name: string
  slug: string
  country: string
  lat: number
  lon: number
  timezone: string
}

const cities = citiesData as CityRow[]

function validCoord(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) && !isNaN(lon) &&
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  )
}

function coordsFrom(req: NextRequest): { lat: number; lon: number } | null {
  const sp = new URL(req.url).searchParams
  const qLat = parseFloat(sp.get('lat') ?? '')
  const qLon = parseFloat(sp.get('lon') ?? '')
  if (validCoord(qLat, qLon)) return { lat: qLat, lon: qLon }

  const hLat = parseFloat(req.headers.get('x-vercel-ip-latitude') ?? '')
  const hLon = parseFloat(req.headers.get('x-vercel-ip-longitude') ?? '')
  if (validCoord(hLat, hLon)) return { lat: hLat, lon: hLon }

  return null
}

function findNearestCity(lat: number, lon: number): CityRow {
  let best = cities[0]
  let bestDist = Infinity
  for (const c of cities) {
    const dlat = c.lat - lat
    const dlon = c.lon - lon
    const dist = dlat * dlat + dlon * dlon
    if (dist < bestDist) {
      bestDist = dist
      best = c
    }
  }
  return best
}

export async function GET(req: NextRequest) {
  const coords = coordsFrom(req)
  if (!coords) {
    // No location available — client keeps its server-rendered default city.
    return new NextResponse(null, { status: 204 })
  }

  const city = findNearestCity(coords.lat, coords.lon)
  const snap = getSolarSnapshot(new Date(), city.lat, city.lon)

  return NextResponse.json(
    {
      name: city.name,
      slug: city.slug,
      country: city.country,
      sunrise: snap.isMidnightSun ? '—' : formatLocalTime(snap.sunrise, city.timezone),
      sunset: snap.isPolarNight ? '—' : formatLocalTime(snap.sunset, city.timezone),
      solarNoon: formatLocalTime(snap.solarNoon, city.timezone),
      daylight: formatDuration(snap.daylightSeconds),
      isMidnightSun: snap.isMidnightSun,
      isPolarNight: snap.isPolarNight,
    },
    {
      headers: {
        // Per-visitor (IP-derived) — must stay private so the CDN never serves
        // one visitor's city to another. Browser may reuse for 5 min.
        'Cache-Control': 'private, max-age=300',
      },
    },
  )
}
