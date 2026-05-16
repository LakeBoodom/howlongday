/**
 * Primary 4-card grid: Sunrise / Sunset / Solar Noon / Daylight Duration.
 * Duration card has gold-tinted background + progress bar (% of annual peak).
 */

import type { City } from '@/lib/cities'
import {
  type SolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'

interface Props {
  snap: SolarSnapshot
  city: City
  daylightPct: number      // 0..100
  peakDateLabel: string    // "Jun 21"
}

function Card({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        {label}
      </div>
      <div
        className={`mt-3 font-semibold text-3xl tabular-nums sm:text-4xl ${
          valueClass ?? 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function DaylightCard({
  duration,
  pct,
  peakDateLabel,
}: {
  duration: string
  pct: number
  peakDateLabel: string
}) {
  const clampedPct = Math.max(0, Math.min(100, pct))
  return (
    <div
      className="rounded-card border p-5 backdrop-blur-sm"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,209,138,0.10) 0%, rgba(255,209,138,0.04) 100%)',
        borderColor: 'rgba(255,209,138,0.25)',
      }}
    >
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        Daylight Duration
      </div>
      <div className="mt-3 font-semibold text-3xl tabular-nums text-daylight sm:text-4xl">
        {duration}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clampedPct}%`,
            background:
              'linear-gradient(90deg, #FF8A00 0%, #FFD18A 60%, #FFC24D 100%)',
          }}
        />
      </div>
      <div className="mt-2 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
        {clampedPct.toFixed(0)}% of peak · {peakDateLabel}
      </div>
    </div>
  )
}

export function DataCards({ snap, city, daylightPct, peakDateLabel }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card
        label="Sunrise"
        value={formatLocalTime(snap.sunrise, city.timezone)}
        valueClass="text-sunrise"
      />
      <Card
        label="Sunset"
        value={formatLocalTime(snap.sunset, city.timezone)}
        valueClass="text-sunset"
      />
      <Card
        label="Solar Noon"
        value={formatLocalTime(snap.solarNoon, city.timezone)}
      />
      <DaylightCard
        duration={formatDuration(snap.daylightSeconds)}
        pct={daylightPct}
        peakDateLabel={peakDateLabel}
      />
    </div>
  )
}
