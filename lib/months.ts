/**
 * Month metadata for /[city]/[month] sub-pages.
 *
 * Slugs are lowercase English month names. We keep this small and explicit
 * rather than computing it at runtime — it's used by generateStaticParams,
 * sitemap generation, and the month page itself.
 */

export interface Month {
  /** URL slug: 'january' .. 'december' */
  slug: string
  /** Display name: 'January' .. 'December' */
  name: string
  /** Short label: 'Jan' .. 'Dec' */
  short: string
  /** 0-indexed month (0 = Jan). */
  index: number
}

export const MONTHS: Month[] = [
  { slug: 'january',   name: 'January',   short: 'Jan', index: 0  },
  { slug: 'february',  name: 'February',  short: 'Feb', index: 1  },
  { slug: 'march',     name: 'March',     short: 'Mar', index: 2  },
  { slug: 'april',     name: 'April',     short: 'Apr', index: 3  },
  { slug: 'may',       name: 'May',       short: 'May', index: 4  },
  { slug: 'june',      name: 'June',      short: 'Jun', index: 5  },
  { slug: 'july',      name: 'July',      short: 'Jul', index: 6  },
  { slug: 'august',    name: 'August',    short: 'Aug', index: 7  },
  { slug: 'september', name: 'September', short: 'Sep', index: 8  },
  { slug: 'october',   name: 'October',   short: 'Oct', index: 9  },
  { slug: 'november',  name: 'November',  short: 'Nov', index: 10 },
  { slug: 'december',  name: 'December',  short: 'Dec', index: 11 },
]

const bySlug = new Map(MONTHS.map((m) => [m.slug, m]))

export function getMonthBySlug(slug: string): Month | null {
  return bySlug.get(slug.toLowerCase()) ?? null
}

/** Number of days in `month` (0-indexed) of `year`. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

/**
 * Weekday index of the 1st of `month` in `year` (UTC).
 * Returns 0 = Sunday, 6 = Saturday. We render the calendar Monday-first,
 * so callers will normalize.
 */
export function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 1)).getUTCDay()
}
