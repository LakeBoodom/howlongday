'use client'

/**
 * LocalSnapshot — "Right now in [your city]" section on the homepage.
 *
 * Server renders with the Helsinki default (passed as props), then on mount
 * silently requests the browser's geolocation. If the user approves, fetches
 * /api/nearby and swaps the display to their actual city. If denied or on
 * error, the Helsinki default stays — no flicker, no error state shown.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface CitySnapshot {
  name: string
  slug: string
  country: string
  sunrise: string
  sunset: string
  solarNoon: string
  daylight: string
  isMidnightSun: boolean
  isPolarNight: boolean
}

interface Props {
  defaultCity: CitySnapshot
}

export function LocalSnapshot({ defaultCity }: Props) {
  const [city, setCity] = useState<CitySnapshot>(defaultCity)
  const [status, setStatus] = useState<'idle' | 'detecting' | 'done'>('idle')

  useEffect(() => {
    if (!navigator.geolocation) return
    setStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/nearby?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          )
          if (res.ok) {
            const data: CitySnapshot = await res.json()
            setCity(data)
          }
        } catch {
          // silently fall back to default
        } finally {
          setStatus('done')
        }
      },
      () => {
        // permission denied or unavailable — keep default
        setStatus('done')
      },
      { timeout: 6000 },
    )
  }, [])

  const isLocal = status === 'done' && city.slug !== defaultCity.slug

  return (
    <section className="border-t border-white/5 bg-bg-deepest">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Right now in{' '}
            <span className={isLocal ? 'text-daylight' : ''}>{city.name}</span>
            {status === 'detecting' && (
              <span className="ml-3 text-sm font-normal text-neutral-4 animate-pulse">
                detecting location…
              </span>
            )}
          </h2>
          <Link
            href={`/${city.slug}`}
            className="text-sm font-medium text-daylight hover:text-white shrink-0"
          >
            See full {city.name} page →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <SnapCard
            label="Sunrise"
            value={city.isMidnightSun ? 'All day' : city.sunrise}
            color="text-sunrise"
          />
          <SnapCard
            label="Sunset"
            value={city.isPolarNight ? 'No sun' : city.sunset}
            color="text-sunset"
          />
          <SnapCard label="Solar Noon" value={city.solarNoon} />
          <SnapCard label="Daylight" value={city.daylight} color="text-daylight" />
        </div>
      </div>
    </section>
  )
}

function SnapCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        {label}
      </div>
      <div className={`mt-3 font-semibold text-3xl tabular-nums ${color ?? 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
