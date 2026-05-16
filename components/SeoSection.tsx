/**
 * SEO / content section under the data cards:
 *   Left  — H1, intro paragraph, bullet facts
 *   Right — FAQ accordion (FAQPage schema injected via JSON-LD)
 *
 * Question text is templated per-city and answers reference real data
 * from the SolarSnapshot.
 */

import type { City } from '@/lib/cities'
import {
  type SolarSnapshot,
  formatLocalTime,
  formatDuration,
} from '@/lib/astronomy'
import { FaqAccordion, type FaqEntry } from './FaqAccordion'

interface Props {
  city: City
  snap: SolarSnapshot
  monthLabel: string  // "May"
  isHighLatitude: boolean
}

function buildFaq({
  city,
  snap,
  monthLabel,
  isHighLatitude,
}: Props): FaqEntry[] {
  const sunset = formatLocalTime(snap.sunset, city.timezone)
  const sunrise = formatLocalTime(snap.sunrise, city.timezone)
  const goldenStart = formatLocalTime(snap.goldenHour, city.timezone)
  const dusk = formatLocalTime(snap.dusk, city.timezone)
  const daylight = formatDuration(snap.daylightSeconds)
  const peakLabel = city.lat >= 0 ? 'June 21' : 'December 21'
  const lowLabel = city.lat >= 0 ? 'December 21' : 'June 21'

  return [
    {
      q: `What time is sunset in ${city.name} today?`,
      a: snap.isMidnightSun
        ? `${city.name} is currently experiencing midnight sun — the sun stays above the horizon all 24 hours, so there is no sunset today.`
        : snap.isPolarNight
        ? `${city.name} is in polar night today — the sun never crosses the horizon, so there is no sunrise or sunset.`
        : `Today in ${city.name}, the sun sets at ${sunset} local time. Sunrise is at ${sunrise}, giving ${daylight} of daylight.`,
    },
    {
      q: `When is golden hour in ${city.name}?`,
      a: snap.isMidnightSun || snap.isPolarNight
        ? `Because of the extreme latitude (${city.lat.toFixed(1)}°), ${city.name} does not have a typical evening golden hour today.`
        : `Evening golden hour in ${city.name} begins at ${goldenStart} when the sun drops below 6° elevation, and ends at ${dusk} when the sky transitions to blue hour.`,
    },
    {
      q: `How long is daylight in ${city.name} in ${monthLabel}?`,
      a: `Today (${monthLabel}) ${city.name} has ${daylight} of daylight, sunrise at ${sunrise} and sunset at ${sunset}. The exact duration shifts a few minutes each day as the season changes.`,
    },
    {
      q: `When is the longest day of the year in ${city.name}?`,
      a: `${city.name}'s longest day falls on the ${peakLabel} solstice. The shortest day is around ${lowLabel}.`,
    },
    {
      q: `Does ${city.name} have midnight sun?`,
      a: isHighLatitude
        ? `Yes — at ${city.lat.toFixed(1)}° latitude, ${city.name} experiences periods of midnight sun in summer and polar night in winter. Today's status: ${
            snap.isMidnightSun
              ? 'midnight sun.'
              : snap.isPolarNight
              ? 'polar night.'
              : 'normal sunrise/sunset cycle.'
          }`
        : `No — ${city.name} is at ${city.lat.toFixed(1)}° latitude, well below the Arctic / Antarctic Circle (66.5°), so the sun rises and sets every day of the year.`,
    },
  ]
}

export function SeoSection(props: Props) {
  const { city, snap, monthLabel } = props
  const faqs = buildFaq(props)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const intro = snap.isMidnightSun
    ? `Today in ${city.name}, ${city.country}, the sun never sets — daylight lasts all 24 hours.`
    : snap.isPolarNight
    ? `Today in ${city.name}, ${city.country}, the sun does not rise — the entire day is below the horizon.`
    : `Today in ${city.name}, ${city.country}, the sun rises at ${formatLocalTime(
        snap.sunrise,
        city.timezone,
      )} and sets at ${formatLocalTime(snap.sunset, city.timezone)}. Daylight lasts ${formatDuration(
        snap.daylightSeconds,
      )}.`

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
            How long is the day in {city.name} today?
          </h1>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-neutral-2">
            {intro}
          </p>
          <ul className="mt-7 space-y-2.5 text-sm text-neutral-2">
            <li className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="uppercase tracking-widecaps text-[0.7rem] text-neutral-4">Latitude</span>
              <span className="tabular-nums">{city.lat.toFixed(2)}°</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="uppercase tracking-widecaps text-[0.7rem] text-neutral-4">Timezone</span>
              <span>{city.timezone}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="uppercase tracking-widecaps text-[0.7rem] text-neutral-4">Solar noon</span>
              <span className="tabular-nums">{formatLocalTime(snap.solarNoon, city.timezone)}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="uppercase tracking-widecaps text-[0.7rem] text-neutral-4">Sun elevation now</span>
              <span className="tabular-nums">{snap.elevationDeg.toFixed(1)}°</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="uppercase tracking-widecaps text-[0.7rem] text-neutral-4">Population</span>
              <span className="tabular-nums">{city.population.toLocaleString()}</span>
            </li>
          </ul>
        </div>
        <FaqAccordion items={faqs} />
      </div>
    </section>
  )
}
