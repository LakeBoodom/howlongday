'use client'

/**
 * Client-side city autocomplete.
 *
 * Loads /cities-search.json (~500 KB, ~100 KB gzipped) on first focus —
 * not on initial page load — so users who never search don't pay the
 * download cost. Once loaded the search runs entirely client-side.
 *
 * Matching strategy:
 *   1. lowercase + strip accents on both query and city name
 *   2. score: exact match > startsWith > word-boundary contains > contains
 *   3. tie-break by population (descending)
 *
 * Keyboard:
 *   ↓ / ↑   move highlight
 *   Enter   navigate to highlighted result
 *   Esc     close dropdown
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchCity {
  slug: string
  name: string
  country: string
  countryCode: string
  population: number
}

interface NormalizedCity extends SearchCity {
  _n: string // lowercase + accent-stripped name
  _c: string // lowercase + accent-stripped country
}

const MAX_RESULTS = 8

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .toLowerCase()
}

function scoreMatch(city: NormalizedCity, q: string): number {
  if (!q) return 0
  const n = city._n
  if (n === q) return 1000
  if (n.startsWith(q)) return 800 - n.length
  // word-boundary contains, e.g. "york" in "new york"
  if (n.includes(' ' + q) || n.includes('-' + q)) return 600 - n.length
  if (n.includes(q)) return 400 - n.length
  // also match against country, weaker
  if (city._c.startsWith(q)) return 200 - n.length
  return 0
}

interface Props {
  /** placeholder text */
  placeholder?: string
  /** visually hidden label for screen readers */
  label?: string
  /** which UI variant: 'hero' is the homepage giant input, 'nav' is compact */
  variant?: 'hero' | 'nav'
}

export function CitySearch({
  placeholder = 'Search a city — Helsinki, Tokyo, Reykjavik…',
  label = 'Search cities',
  variant = 'hero',
}: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<NormalizedCity[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  // Lazy-load the index on first focus.
  const ensureLoaded = async () => {
    if (data !== null || loading) return
    setLoading(true)
    try {
      const res = await fetch('/cities-search.json', { cache: 'force-cache' })
      const raw = (await res.json()) as SearchCity[]
      const normed: NormalizedCity[] = raw.map((c) => ({
        ...c,
        _n: normalize(c.name),
        _c: normalize(c.country),
      }))
      setData(normed)
    } catch (err) {
      // Network or parse error — leave data as null; input still works
      // as a typeable field that just doesn't show suggestions.
      console.error('[CitySearch] failed to load index', err)
    } finally {
      setLoading(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const results = useMemo<NormalizedCity[]>(() => {
    if (!data || !q.trim()) return []
    const qn = normalize(q.trim())
    const scored: Array<{ c: NormalizedCity; s: number }> = []
    for (const c of data) {
      const s = scoreMatch(c, qn)
      if (s > 0) {
        scored.push({ c, s })
        if (scored.length > MAX_RESULTS * 4) break // cap work for very common substrings
      }
    }
    // Final sort: score desc, then population desc
    scored.sort((a, b) => b.s - a.s || b.c.population - a.c.population)
    return scored.slice(0, MAX_RESULTS).map((x) => x.c)
  }, [data, q])

  // Reset highlight when results change
  useEffect(() => {
    setActiveIdx(0)
  }, [q])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const r = results[activeIdx]
      if (r) {
        e.preventDefault()
        setOpen(false)
        inputRef.current?.blur()
        router.push(`/${r.slug}`)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && q.trim().length > 0

  // Style variants
  const containerCls =
    variant === 'hero'
      ? 'relative w-full'
      : 'relative w-full max-w-xs'
  const inputWrapperCls =
    variant === 'hero'
      ? 'flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur focus-within:border-white/35'
      : 'flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-sm focus-within:border-white/30'
  const inputCls =
    variant === 'hero'
      ? 'flex-1 bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none sm:text-base'
      : 'flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none'

  return (
    <div ref={containerRef} className={containerCls}>
      <label className="sr-only" htmlFor="city-search-input">{label}</label>
      <div className={inputWrapperCls}>
        <svg
          className={variant === 'hero' ? 'h-5 w-5 text-white/70' : 'h-4 w-4 text-white/60'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          id="city-search-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={q}
          placeholder={placeholder}
          className={inputCls}
          onFocus={() => {
            ensureLoaded()
            setOpen(true)
          }}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="city-search-listbox"
          role="combobox"
        />
        {loading && (
          <span className="text-[0.65rem] uppercase tracking-widecaps text-white/55">
            Loading…
          </span>
        )}
      </div>

      {showDropdown && (
        <ul
          id="city-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto overflow-hidden rounded-2xl border border-white/10 bg-bg-deepest/95 shadow-2xl backdrop-blur-lg"
        >
          {results.length === 0 && data !== null && (
            <li className="px-4 py-3 text-sm text-neutral-3">
              No matches. Try a different spelling.
            </li>
          )}
          {results.length === 0 && data === null && (
            <li className="px-4 py-3 text-sm text-neutral-3">
              {loading ? 'Loading cities…' : 'Type a city name to search.'}
            </li>
          )}
          {results.map((c, idx) => (
            <li key={c.slug} role="option" aria-selected={idx === activeIdx}>
              <Link
                href={`/${c.slug}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex items-center justify-between gap-4 px-4 py-3 text-sm transition ${
                  idx === activeIdx
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-2 hover:bg-white/[0.06]'
                }`}
              >
                <span className="truncate font-medium">{c.name}</span>
                <span className="shrink-0 text-[0.7rem] uppercase tracking-widecaps text-neutral-4">
                  {c.country}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
