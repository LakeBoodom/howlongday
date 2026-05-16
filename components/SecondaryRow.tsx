/**
 * Secondary 4-card row:
 *   1. Golden hour (morning + evening windows)
 *   2. Blue hour
 *   3. Countdown to next solstice/equinox
 *   4. Local fact (midnight sun, polar night, delta to darkest day, etc.)
 */

import type { City } from '@/lib/cities'
import { type SolarSnapshot, formatLocalTime } from '@/lib/astronomy'

interface Props {
  snap: SolarSnapshot
  city: City
  /** "Jun 21, 2026" */
  nextSolstice: { label: string; daysAway: number; kind: 'solstice' | 'equinox' }
  localFact: string
}

function SmallCard({
  label,
  primary,
  hint,
}: {
  label: string
  primary: string
  hint?: string
}) {
  return (
    <div className="rounded-card border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <div className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
        {label}
      </div>
      <div className="mt-2.5 font-semibold text-lg tabular-nums text-white">
        {primary}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-neutral-4">{hint}</div>
      )}
    </div>
  )
}

function timeRange(a: Date, b: Date, timezone: string): string {
  return `${formatLocalTime(a, timezone)} – ${formatLocalTime(b, timezone)}`
}

export function SecondaryRow({ snap, city, nextSolstice, localFact }: Props) {
  const goldenMorning = timeRange(snap.dawn, snap.goldenHourEnd, city.timezone)
  const goldenEvening = timeRange(snap.goldenHour, snap.dusk, city.timezone)
  const blueMorning = timeRange(snap.nauticalDawn, snap.dawn, city.timezone)
  const blueEvening = timeRange(snap.dusk, snap.nauticalDusk, city.timezone)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SmallCard
        label="Golden Hour"
        primary={goldenEvening}
        hint={`Morning: ${goldenMorning}`}
      />
      <SmallCard
        label="Blue Hour"
        primary={blueEvening}
        hint={`Morning: ${blueMorning}`}
      />
      <SmallCard
        label={`Next ${nextSolstice.kind}`}
        primary={nextSolstice.label}
        hint={`${nextSolstice.daysAway} days away`}
      />
      <SmallCard label="Did you know" primary={localFact} />
    </div>
  )
}
