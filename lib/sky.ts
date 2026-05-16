/**
 * Dynamic CSS sky — pure gradient + glow, no images, no canvas.
 *
 * Picks one of 8 phases based on the sun's current elevation angle.
 * Spec source: CLAUDE_1.md > "Dynamic CSS sky".
 */

export type SkyPhase =
  | 'astronomical-night'
  | 'nautical-twilight'
  | 'blue-hour'
  | 'golden-dawn'
  | 'golden-dusk'
  | 'low-sun'
  | 'high-sun'
  | 'peak-sun'

export interface SkyConfig {
  phase: SkyPhase
  /** Top-to-bottom CSS gradient (180deg) — apply as `background`. */
  gradient: string
  /** Horizon glow color. Use in a radial-gradient overlay near the horizon. */
  glowColor: string
  /** Opacity 0–1 for the glow overlay. */
  glowOpacity: number
  /** Whether to render the CSS star layer. */
  showStars: boolean
  /** Star opacity multiplier 0–1. */
  starIntensity: number
}

export function getSkyGradient(
  solarElevationDeg: number,
  isAfterNoon: boolean,
): SkyConfig {
  // ASTRONOMICAL NIGHT — elevation < -18°
  if (solarElevationDeg < -18) {
    return {
      phase: 'astronomical-night',
      gradient: 'linear-gradient(180deg, #020408 0%, #04091a 40%, #060d20 100%)',
      glowColor: 'transparent',
      glowOpacity: 0,
      showStars: true,
      starIntensity: 1.0,
    }
  }

  // NAUTICAL TWILIGHT — -18° to -12°
  if (solarElevationDeg < -12) {
    return {
      phase: 'nautical-twilight',
      gradient: 'linear-gradient(180deg, #020810 0%, #07132b 50%, #0d1f3a 100%)',
      glowColor: '#1a3a6b',
      glowOpacity: 0.2,
      showStars: true,
      starIntensity: 0.7,
    }
  }

  // BLUE HOUR — -12° to -4°
  if (solarElevationDeg < -4) {
    return {
      phase: 'blue-hour',
      gradient:
        'linear-gradient(180deg, #060e24 0%, #0e2248 40%, #1a3a6b 75%, #2a5a8a 100%)',
      glowColor: '#3a6bc4',
      glowOpacity: 0.4,
      showStars: true,
      starIntensity: 0.3,
    }
  }

  // GOLDEN HOUR DAWN — 0° to 6° (interpret -4° to 6° before noon as dawn)
  if (solarElevationDeg < 6 && !isAfterNoon) {
    return {
      phase: 'golden-dawn',
      gradient:
        'linear-gradient(180deg, #0e1830 0%, #2d1f3d 30%, #6b2d1a 55%, #c4622d 72%, #e8943a 85%, #f5c876 95%, #fff2c8 100%)',
      glowColor: '#e8943a',
      glowOpacity: 0.5,
      showStars: false,
      starIntensity: 0,
    }
  }

  // GOLDEN HOUR DUSK — 0° to 6°, after noon
  if (solarElevationDeg < 6 && isAfterNoon) {
    return {
      phase: 'golden-dusk',
      gradient:
        'linear-gradient(180deg, #0e1830 0%, #1a2545 25%, #4a1f10 45%, #8b3010 60%, #d4612a 75%, #f08040 87%, #f5c070 95%, #fff0c0 100%)',
      glowColor: '#f08040',
      glowOpacity: 0.55,
      showStars: false,
      starIntensity: 0,
    }
  }

  // LOW SUN — 6° to 20°
  if (solarElevationDeg < 20) {
    return {
      phase: 'low-sun',
      gradient:
        'linear-gradient(180deg, #0a1628 0%, #1a3555 30%, #2a5580 60%, #5a8ab0 82%, #a0c0d8 93%, #d0e8f0 100%)',
      glowColor: '#f0c060',
      glowOpacity: 0.3,
      showStars: false,
      starIntensity: 0,
    }
  }

  // HIGH SUN — 20° to 50°
  if (solarElevationDeg < 50) {
    return {
      phase: 'high-sun',
      gradient:
        'linear-gradient(180deg, #0a1f3d 0%, #1a4080 25%, #2a6ab0 55%, #4a90d0 80%, #80b8e8 100%)',
      glowColor: '#ffe080',
      glowOpacity: 0.2,
      showStars: false,
      starIntensity: 0,
    }
  }

  // PEAK SUN — 50°+ (equatorial / midsummer noon)
  return {
    phase: 'peak-sun',
    gradient:
      'linear-gradient(180deg, #0d2545 0%, #1a50a0 30%, #3080d0 65%, #60a8e8 88%, #a0d0f0 100%)',
    glowColor: '#fff5a0',
    glowOpacity: 0.15,
    showStars: false,
    starIntensity: 0,
  }
}
