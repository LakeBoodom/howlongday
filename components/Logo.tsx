type Variant = 'full' | 'compact' | 'icon'

interface LogoProps {
  variant?: Variant
  className?: string
}

/**
 * HowLongDay logo:
 *  - SVG arc: warm orange dot (sunrise) → glowing sun (top) → cool blue dot (sunset)
 *  - Wordmark: "Howlongday" Inter SemiBold
 *  - Tagline: "MAKE THE MOST OF DAYLIGHT" Inter Regular, wide tracking, #A7B0C0
 */
export function Logo({ variant = 'full', className = '' }: LogoProps) {
  const Arc = (
    <svg
      viewBox="0 0 120 60"
      className="h-9 w-auto"
      role="img"
      aria-label="HowLongDay arc"
    >
      <defs>
        <linearGradient id="hld-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB23D" />
          <stop offset="35%" stopColor="#FF6A00" />
          <stop offset="65%" stopColor="#FFD18A" />
          <stop offset="100%" stopColor="#3AA0FF" />
        </linearGradient>
        <radialGradient id="hld-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC24D" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#FFC24D" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFC24D" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* arc: from (10,50) up over (60,6) to (110,50) */}
      <path
        d="M 10 50 Q 60 -8 110 50"
        fill="none"
        stroke="url(#hld-arc)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* sunrise endpoint */}
      <circle cx="10" cy="50" r="3.2" fill="#FF8A00" />
      {/* sunset endpoint */}
      <circle cx="110" cy="50" r="3.2" fill="#3AA0FF" />

      {/* sun glow */}
      <circle cx="60" cy="9" r="14" fill="url(#hld-sun-glow)" />
      {/* sun dot */}
      <circle cx="60" cy="9" r="4.5" fill="#FFC24D" className="sun-pulse" />
    </svg>
  )

  if (variant === 'icon') {
    return <span className={className}>{Arc}</span>
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Arc}
      <div className="flex flex-col leading-none">
        <span className="font-semibold text-[1.45rem] tracking-tight text-white">
          Howlongday
        </span>
        {variant === 'full' && (
          <span className="mt-1.5 text-[0.65rem] font-normal uppercase tracking-widecaps text-neutral-3">
            Make the most of daylight
          </span>
        )}
      </div>
    </div>
  )
}
