/**
 * Composed hero section: CSS sky gradient + radial horizon glow + stars + sun arc.
 * Renders {children} (nav, headlines, cards) on top.
 */

import type { SkyConfig } from '@/lib/sky'
import { SunArc } from './SunArc'
import { StarField } from './StarField'

interface Props {
  sky: SkyConfig
  azimuthDeg: number
  elevationDeg: number
  isMidnightSun?: boolean
  isPolarNight?: boolean
  children: React.ReactNode
}

function hexWithAlpha(hex: string, alpha: number): string {
  // Accept #rgb / #rrggbb. Append alpha as 2-digit hex.
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const a = Math.max(0, Math.min(255, Math.round(alpha * 255)))
    .toString(16)
    .padStart(2, '0')
  return `#${h}${a}`
}

export function HeroSky({
  sky,
  azimuthDeg,
  elevationDeg,
  isMidnightSun,
  isPolarNight,
  children,
}: Props) {
  const glowFill =
    sky.glowOpacity > 0 && sky.glowColor !== 'transparent'
      ? hexWithAlpha(sky.glowColor, sky.glowOpacity)
      : 'transparent'

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ background: sky.gradient, minHeight: 'clamp(620px, 78vh, 820px)' }}
    >
      <StarField intensity={sky.starIntensity} />

      <SunArc azimuthDeg={azimuthDeg} elevationDeg={elevationDeg} />

      {/* Horizon glow at the bottom of the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80"
        style={{
          background: `radial-gradient(120% 100% at 50% 100%, ${glowFill} 0%, transparent 65%)`,
        }}
      />

      {/* Polar badges */}
      {(isMidnightSun || isPolarNight) && (
        <div className="pointer-events-none absolute right-6 top-24 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widecaps backdrop-blur ${
              isMidnightSun
                ? 'border-amber-200/40 bg-amber-300/10 text-amber-100'
                : 'border-indigo-200/30 bg-indigo-300/10 text-indigo-100'
            }`}
          >
            {isMidnightSun ? '☀️ Midnight Sun' : '🌑 Polar Night'}
          </span>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </section>
  )
}
