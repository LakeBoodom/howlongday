# HowLongDay — seuraavat askeleet

> Päivitetty 2026-05-26. Vaiheet 1–5 deployattu, howlongday.com elossa.
> Avaa tämä uudessa Cowork-sessiossa ja sano: "jatketaan NEXT_SESSION.md:n mukaan".

## Tilanne nyt

- howlongday.com elossa (apex, ilman www, SSL Let's Encryptiltä Vercelin kautta)
- 1000 kaupunkia prebuilt-SSG, ~48k ISR on-demand (city: revalidate 24h, month: revalidate 30d)
- Sitemap 49 020 URLia toimii — top-1000 `changeFrequency: daily`, hännän kaupungit `weekly`
- Etusivu: live Helsinki-hero + 8 popular city pillsiä + "Right now in Helsinki" -snapshot
- Kaupunkisivu (esim /helsinki, /tokyo, /rovaniemi): hero CSS-sky + real-time sun arc + 4×4 datacards + SEO-prose + FAQ JSON-LD
- Kuukausisivu (esim /helsinki/november): day-by-day calendar + stats + FAQ
- Stack: Next.js 14, Tailwind, SunCalc only, tz-lookup, GeoNames-derived data
- Vercel team `lakeboodoms-projects`, project `howlongday`, GitHub `LakeBoodom/howlongday`
- Build time 1000 sivulle: 55 s

### Tehty 2026-05-26: Vercel ISR Writes -ylityksen korjaus
Sitemap listasi kaikki ~48k hännän kaupunkia `changeFrequency: 'daily'`, mikä sai Googlebotit
crawlaamaan ne päivittäin → jokainen crawl-vierailu = uusi ISR-kirjoitus → 300% free tier (200k/kk).
**Korjaus:** hännän kaupungit vaihdettu `'weekly'`-taajuuteen → ~7x vähemmän kirjoituksia.
Commit `81b7038360` pushattiin suoraan GitHub-selaimen kautta (sandbox-verkon rajoitusten takia).

## Seuraava sessio — Pala 5: Kalenteri-feature (~1.5 h)

Tämä on **uusi prioriteetti** Heikin pyynnöstä. Suuri SEO-hyöty: matchaa search intent "how long is daylight in Helsinki in November" -tyyppisille kyselyille. Pala 5 (search) ja Pala 6 (Search Console) siirtyvät tämän jälkeen.

### 5a. Vuosigraafi kaupunkisivulle (~30 min)

**Tavoite:** Yksi visualisaatio joka näyttää koko vuoden päivänpituuden U-käyränä Helsingille / Tokyolle / mille tahansa kaupungille. Today-piste highlightataan, solstice/equinox merkitään.

**Toteutus:**
1. `lib/astronomy.ts`: lisää `getYearlyDaylight(lat, lon, year): Array<{date, daylightSeconds}>` — 365 SunCalc-kutsua. Käsittele midnight sun (86400) ja polar night (0) edge caset.
2. `components/YearlyDaylight.tsx`: inline SVG line chart, ei deps. Koko ~840×220 px. X-akseli: 12 kuukauden labelit. Y-akseli: 0-24h asteikko (käytä `Math.ceil(max / 6) * 6` jotta välit ovat siistejä). Käyrä: linear gradient sunrise-orange → daylight-gold → sunset-blue. "Today" piste: kullainen circle + pulse. Solstice + equinox vertikaaliset viivat.
3. `app/[city]/page.tsx`: lisää komponentti SeoSection:in jälkeen, ennen Features-baria. Header: "Daylight throughout the year".

### 5b. Per-kuukausi -alasivut /[city]/[month] (~1 h)

**Tavoite:** 1200 uutta SEO-sivua (12 kuukautta × top 100 kaupunkia). URL: `/helsinki/november`, `/tokyo/january` etc.

**Toteutus:**
1. `lib/months.ts`: vakio MONTHS = [{slug, name, index, days(year)}, ...] tammikuusta joulukuuhun.
2. `app/[city]/[month]/page.tsx`:
   - `generateStaticParams`: top 100 kaupunkia × 12 kuukautta = 1200 prebuilt
   - `dynamicParams = true` muille
   - Komponentit (uudelleenkäytetään pääsivun komponentteja missä mahdollista)
   - **Calendar grid komponentti**: 5-6 rivin grid, jokainen solu = päivä, näyttää sunrise/sunset/daylight kompaktisti
   - Header: "Daylight in {City} in {Month} {year}" + average/longest/shortest day badge
   - FAQ adaptoidaan: "How long is daylight in {City} in {Month}?"
   - Canonical: `/[city]/[month]`
3. `app/sitemap.ts`: lisää /[city]/[month] -URLit top 100 kaupungeille (1200 entryä). Sitemap kasvaa ~50 220 URLiin — vielä alle 50k+ rajan? VARMISTA: 50 220 > 50k, joten **pitää jakaa sitemap-indeksiksi**. Yksinkertaisin tapa: kaksi sitemappia, `/sitemap-cities.xml` ja `/sitemap-months.xml`, root /sitemap.xml on sitemap-index.

### 5c. Etusivulinkit kalenteri-feature -mainos

**Tavoite:** Käyttäjä löytää kalenteriominaisuuden etusivulta.

**Toteutus:**
1. Lisää etusivun "Right now in Helsinki" -osion alle pieni preview-vuosigraafi Helsingille (luo komponentista mini-variantti)
2. CTA: "See how daylight changes month-by-month in any city →"

### Verifiointi

- TS-check + push
- Sample: /helsinki, /helsinki/november (Helsingin marraskuu = ~6h daylight, dramaattinen), /tokyo/january, /rovaniemi/december (polar night näkyy kalenterissa)
- Tarkista sitemap-index ei riko Google Search Consolea

## Tämän jälkeen

### Pala 6 — Hakutoiminto + polish (~1 h)
- `components/CitySearch.tsx`: client-side autocomplete trimmatusta top-5k -indeksistä (server endpoint `/api/cities/search` tai precomputed JSON `/data/cities-search.json` ~500 KB)
- Per-page popular pills variation (näytä same-country kaupunkeja)
- Mobiilinavigaatio
- 404-sivun polish

### Pala 7 — Indeksointi & monetisaatio (~30 min + odotus)
- Submit sitemap Google Search Consoleen
- Rich Results Test FAQPage:lle
- AdSense (odota 2-3 kk sivun ikääntymistä ennen apply)
- robots.txt verifiointi
- Update CLAUDE_1.md launch checklist

## Tekninen muistilista uudelle sessiolle

- Sandbox **ei pysty pushaamaan GitHubiin** — `github.com` on blockattu sandbox-verkossa
- Jos `.git/HEAD.lock` tai `.git/index.lock` roikkuu: poista terminaalissa `rm -f .git/HEAD.lock .git/index.lock`
- **Vaihtoehto git-pushille:** käytä GitHub REST API:a selaimen kautta (Claude in Chrome + javascript_tool) — toimii käyttäjän GitHub-sessiolla tai PAT-tokenilla Authorization-headerissä
- Sandboxin `npm run build` jää muistihuipulle cities.json:n takia → luota Vercel-buildiin, käytä `npx tsc --noEmit` paikallisesti
- Layout käyttää `<link rel=stylesheet>` Inter-fontille (ei `next/font/google`) jotta sandbox-build ei kaadu Google Fonts -fetch:iin
- ISR Writes -budjetti free tierissä: 200 000/kk — top-1000 SSG prebuilt, hännän kaupungit 24h ISR, kuukausisivut 30d ISR
