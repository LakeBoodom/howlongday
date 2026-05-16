/**
 * CSS-only star field — 10 hardcoded radial dots.
 * Intensity 0..1 multiplies the base opacity.
 */

const STARS = [
  { x: '15%', y: '12%', size: 1 },
  { x: '28%', y: '8%', size: 1 },
  { x: '42%', y: '15%', size: 1 },
  { x: '67%', y: '6%', size: 1.5 },
  { x: '78%', y: '18%', size: 1 },
  { x: '88%', y: '10%', size: 1.5 },
  { x: '8%', y: '25%', size: 1 },
  { x: '54%', y: '22%', size: 1 },
  { x: '35%', y: '5%', size: 1 },
  { x: '92%', y: '28%', size: 1 },
] as const

export function StarField({ intensity }: { intensity: number }) {
  if (intensity <= 0) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.x,
            top: s.y,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.85 * intensity,
            boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,${0.5 * intensity})`,
          }}
        />
      ))}
    </div>
  )
}
