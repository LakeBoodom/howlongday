# Sun Profiles — content-depth spec (cost-first)

Goal: add genuinely-unique per-city content (annual character, key sun dates,
darkness, golden hour) to fix thin/duplicate content — **without** increasing
Vercel Fluid Active CPU. Net effect on CPU is neutral-to-negative (we remove
more per-render astronomy than we add).

## Core idea

The new content (longest/shortest day, earliest/latest sunrise & sunset,
"does it get dark", max daylight, monthly averages) are **annual constants for
a city** — they don't change between renders. So:

1. Compute them **once, offline** in a Node script.
2. Bake them into a compact `data/sun-profiles.json`, keyed by city slug.
3. The page render just **reads** the value → 0 SunCalc calls for deep content.

Reading a number from a map costs ~0 CPU. The Fluid Active CPU meter (the one
that breached the free tier) does not move.

## Data file: `data/sun-profiles.json`

Keyed by slug. Compact integers (no formatted strings — format at render, which
is trivial string work the page already does). Times stored as local
minute-of-day (DST-correct for that specific date). Dates stored as month+day.

```
"bengaluru": {
  "maxDayMin": 773,            // longest-day daylight, minutes (12h53m)  -> also replaces getMaxDaylight
  "minDayMin": 681,            // shortest-day daylight (11h21m)
  "longest":  [6,22],          // [month, day]
  "shortest": [12,22],
  "earliestSunrise": [5,27,353],  // [month, day, minOfDay]  05:53
  "latestSunset":    [7,3,1131],  // 18:51
  "earliestSunset":  [11,12,1071],// 17:51
  "latestSunrise":   [1,17,407],  // 06:47
  "darkness": "always",        // "always" | "white-nights" | "midnight-sun" | "polar-night"
  "monthlyAvgMin": [ ... 12 ints ... ]  // replaces getYearlyMonthlySummaries for MonthBrowser
}
```

Size: ~120–160 bytes/city. Scope decides total (see below).

## Per-render server cost (getTimes-equivalent ops)

| Render path | Today | After profiles |
|---|---|---|
| city `generateMetadata` (live "today") | 2 | 2 |
| city page snapshot (live "today") | 2 | 2 |
| city page `getMaxDaylight` | 1 | 0 (from profile) |
| city page deep content block | n/a (no content today) | 0 (from profile) |
| city page `getYearlyMonthlySummaries` (top-1000 only) | 12 | 0 (from profile) |
| **Tail city total** | **5** | **4** |
| **Top-1000 city total** | **17** | **4** |

Optional extra win: wrap the "today" snapshot in React `cache()` so
`generateMetadata` and the page share one computation → top-1000 drops to **2**,
tail to **2**. Net: the highest-traffic pages get ~75–88% *less* server
astronomy than today, while gaining a large content block.

The live "today" sunrise/sunset snapshot stays server-side (SEO-critical: it's
in the HTML and FAQ JSON-LD). That ~2 ops is the irreducible floor.

## Other cost axes — unaffected

- No new URLs, no new pages → no change to ISR writes or function-invocation
  count (the bot-walking axis fixed today).
- Crawl surface unchanged.
- Pairs with noindex-the-thin-tail: fewer indexed pages → fewer bot ISR writes.

## The one real cost: file size / build

`cities.json` is already ~8 MB and strains local `next build` (sandbox hangs;
we rely on Vercel's 8 GB build anyway). Mitigation by scope:

- Profiles for **top 1000** (SSG set): ~0.15 MB. Trivial.
- Profiles for **top 5000** (current sitemap surface): ~0.75 MB. Fine.
- Profiles for **all 49k**: ~7 MB. Doubles the data weight; Vercel build OK,
  but worsens the local-build situation further.

Recommendation: generate profiles for the **indexed set only** and gate the
deep content block on "profile exists". Tail pages render exactly as today
(no profile, no extra cost). This minimizes file size, build risk, and keeps
tail CPU flat — while the noindex decision handles the tail separately.

## Precompute script: `scripts/build-sun-profiles.mjs`

- Offline, one-time (and re-run once a year — sun dates shift ≤1 day with the
  leap cycle). Never runs on Vercel.
- Loads `cities.json`, loops the chosen top-N, scans 365 days per city
  (daylight in seconds is tz-independent; sunrise/sunset local minute-of-day
  via the city IANA tz), finds extremes, classifies darkness, writes the file.
- Runtime: top-5000 ≈ seconds–minutes; all-49k ≈ tens of minutes (Intl
  formatting dominates) — irrelevant since it's offline.
- Can be wired to the existing `howlongday-*` scheduled-task pattern for the
  yearly refresh.

## Rollout

1. Write + run `build-sun-profiles.mjs` for chosen N → commit `sun-profiles.json`.
2. Add `lib/sunProfile.ts` loader (`getSunProfile(slug)`).
3. New `components/DaylightProfile.tsx` (server component): character paragraph
   + darkness + golden-hour + key-dates grid, latitude-banded prose.
4. Replace `getMaxDaylight` + `getYearlyMonthlySummaries` reads with profile.
5. Latitude-aware FAQ variation + single-H1 fix (from earlier audit).
6. Verify on contrasting cities (Bengaluru / Helsinki / Reykjavík / Singapore),
   confirm op-count via a render trace, then deploy.

## Open decisions

- **Scope N**: top 1000 / top 5000 / all 49k.
- **Include `cache()` snapshot dedupe** (drops to 2 ops): yes/no.
- **Tail pages**: leave as-is (recommended) vs. also give them profiles.
