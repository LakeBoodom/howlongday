/**
 * SVG sun arc.
 *
 * Bezier curve from (60, 320) over (480, -40) to (900, 320).
 *
 * Sun-dot x maps from solar azimuth:
 *   azimuth 90°  (east, sunrise)  → x 60
 *   azimuth 180° (south, noon)    → x 480
 *   azimuth 270° (west, sunset)   → x 900
 * Azimuth outside 90..270 (sun on the night-side hemisphere) pins to the nearest edge.
 *
 * Sun-dot y is solved on the bezier at the parameter t derived from x.
 * When the sun is below the horizon, the dot drops below the arc proportionally.
 *
 * Arc is dashed when sun is below horizon, solid when above.
 */

interface Props {
  azimuthDeg: number
  elevationDeg: number
}

const W = 960
const H = 360
const P0 = { x: 60, y: 320 }
const P1 = { x: 480, y: -40 }
const P2 = { x: 900, y: 320 }

function quadBezier(t: number): { x: number; y: number } {
  const mt = 1 - t
  return {
    x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
    y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
  }
}

export function SunArc({ azimuthDeg, elevationDeg }: Props) {
  // Map azimuth 90..270 to t 0..1; clamp outside (sun on hidden side).
  const azClamped = Math.max(90, Math.min(270, azimuthDeg))
  const t = (azClamped - 90) / 180
  const arcPoint = quadBezier(t)

  // Below-horizon: pull the dot below the baseline; cap so it stays on screen.
  const belowOffset = elevationDeg < 0 ? Math.min(80, Math.abs(elevationDeg) * 2) : 0
  const sunX = arcPoint.x
  const sunY = arcPoint.y + belowOffset

  const aboveHorizon = elevationDeg > 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 max-w-4xl"
      aria-hidden
    >
      <defs>
        <linearGradient id="sunarc-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB23D" />
          <stop offset="35%" stopColor="#FF6A00" />
          <stop offset="65%" stopColor="#FFD18A" />
          <stop offset="100%" stopColor="#3AA0FF" />
        </linearGradient>
        <radialGradient id="sunarc-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFC24D" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFC24D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
        fill="none"
        stroke="url(#sunarc-stroke)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={aboveHorizon ? '' : '8 6'}
        opacity={aboveHorizon ? 0.9 : 0.45}
      />

      {/* Endpoint dots — sunrise (warm) left, sunset (cool) right */}
      <circle cx={P0.x} cy={P0.y} r={6} fill="#FF8A00" />
      <circle cx={P2.x} cy={P2.y} r={6} fill="#3AA0FF" />

      {/* Sun: glow halo + bright core */}
      <circle cx={sunX} cy={sunY} r={32} fill="url(#sunarc-glow)" />
      <circle
        cx={sunX}
        cy={sunY}
        r={11}
        fill="#fff8e0"
        className={aboveHorizon ? 'sun-pulse' : ''}
      />
    </svg>
  )
}
