/**
 * GET /api/nearby?lat=XX&lon=YY
 *
 * Returns the nearest city (by Euclidean distance on lat/lon) plus today's
 * solar snapshot for that city. Used by the homepage LocalSnapshot client
 * component to replace the default Helsinki card with the user's own city.
 *
 * Performance note: iterating ~49k cities with a simple distance comparison
 * takes ~1–2 ms server-side — well within acceptable API route latency.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSolarSnapshot, formatLocalTime, formatDuration } from '@/lib/astronomy'
import citiesData from '@/data/cities.json'

interface CityRow {
  name: string
  slug: string
  country: string
  lat: number
  lon: number
  timezone: string
}

const cities = citiesData as CityRow[]

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
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lon = parseFloat(searchParams.get('lon') ?? '')

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const city = findNearestCity(lat, lon)
  const now = new Date()
  const snap = getSolarSnapshot(now, city.lat, city.lon)

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
        // Cache for 10 minutes — solar times don't change meaningfully faster
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
      },
    },
  )
}
