'use client'

/**
 * LocalSnapshot — "Right now in [your city]" section on the homepage.
 *
 * Server renders with the default city (passed as props). On mount it calls
 * /api/nearby with NO browser-permission prompt — the endpoint infers an
 * approximate location from the visitor's IP (Vercel geo headers) and returns
 * their nearest city. A visitor who wants pinpoint accuracy can opt in via the
 * "use exact location" link, which is the only thing that triggers the browser
 * geolocation prompt. If anything fails, the default city stays.
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

  // On load: silent IP-based lookup, no permission prompt.
  useEffect(() => {
    let cancelled = false
    setStatus('detecting')
    fetch('/api/nearby')
      .then((res) => (res.status === 200 ? res.json() : null))
      .then((data: CitySnapshot | null) => {
        if (!cancelled && data?.slug) setCity(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStatus('done')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Opt-in: only this triggers the browser geolocation permission prompt.
  function useExactLocation() {
    if (!navigator.geolocation) return
    setStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/nearby?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          )
          if (res.status === 200) {
            const data: CitySnapshot = await res.json()
            if (data?.slug) setCity(data)
          }
        } catch {
          // keep current city
        } finally {
          setStatus('done')
        }
      },
      () => setStatus('done'),
      { timeout: 6000 },
    )
  }

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

        <button
          type="button"
          onClick={useExactLocation}
          className="mt-2 text-[0.8rem] text-neutral-4 underline decoration-white/20 underline-offset-2 hover:text-neutral-2"
        >
          Not your city? Use exact location
        </button>

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
