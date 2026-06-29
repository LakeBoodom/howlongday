/**
 * US National Parks — curated dataset for the "best time to visit" +
 * hiking-daylight-planner pilot.
 *
 * Each park carries real coordinates + IANA timezone so the page can compute
 * genuine sun data (daylight length per month, golden hour, today's
 * sunrise/sunset) via lib/astronomy — the unique, non-templated depth that
 * separates these pages from thin AI content. The editorial fields
 * (intro, whenToVisit, hikes, daylightNote) are hand-written.
 *
 * `nearestCitySlug` must exist in data/cities.json so the internal link
 * resolves to a real city page (verified at authoring time).
 */

export interface SignatureHike {
  /** Trail name. */
  name: string
  /** Round-trip distance in miles. */
  miles: number
  /** Typical time to complete, hours (for the daylight planner framing). */
  hours: number
  /** One-line curated description. */
  note: string
}

export interface NationalPark {
  slug: string
  /** Full name, e.g. "Yosemite National Park". */
  name: string
  /** Short name for headings/tables, e.g. "Yosemite". */
  shortName: string
  state: string
  lat: number
  lon: number
  /** IANA timezone for local-time display. */
  timezone: string
  /** Curated intro paragraph. */
  intro: string
  /** Curated guidance on when to go. */
  whenToVisit: string
  /** Plain-language ideal window, e.g. "Late May to October". */
  bestSeason: string
  /** 0-indexed months considered ideal (used to highlight the monthly table). */
  bestMonths: number[]
  /** Curated note tying daylight hours to trip planning. */
  daylightNote: string
  /** A few signature hikes for the daylight-planner table. */
  hikes: SignatureHike[]
  /** Slug of a nearby city page for internal linking. */
  nearestCitySlug: string
  /** Display name of the nearest city. */
  nearestCityName: string
}

export const NATIONAL_PARKS: NationalPark[] = [
  {
    slug: 'yosemite',
    name: 'Yosemite National Park',
    shortName: 'Yosemite',
    state: 'California',
    lat: 37.8651,
    lon: -119.5383,
    timezone: 'America/Los_Angeles',
    intro:
      'Granite walls, giant sequoias and the highest waterfalls in North America make Yosemite Valley one of the most photographed places on Earth. The park spans 3,000 feet of valley floor up to 13,000-foot peaks, so conditions and daylight change dramatically with the season.',
    whenToVisit:
      'Late May and June are peak waterfall season, when snowmelt sends Yosemite Falls and the Mist Trail thundering. The high country along Tioga Road only opens once the snow clears — usually late May to early July — and stays accessible into October. September and October bring thinner crowds and crisp light, though the falls slow to a trickle by late summer.',
    bestSeason: 'May–June (waterfalls) and September–October',
    bestMonths: [4, 5, 8, 9],
    daylightNote:
      'Midsummer gives you well over 14 hours of daylight in the valley — enough to climb Half Dome and still descend before dark. By October daylight drops under 11 hours, so long cable routes need an early, headlamp-ready start.',
    hikes: [
      { name: 'Mist Trail to Vernal & Nevada Falls', miles: 5.4, hours: 5, note: 'Steep, wet granite steps beside two roaring falls.' },
      { name: 'Half Dome (cables)', miles: 16, hours: 11, note: 'Iconic full-day climb; permit required for the cables.' },
      { name: 'Mirror Lake', miles: 2, hours: 1, note: 'Easy valley-floor stroll with Half Dome reflections in spring.' },
    ],
    nearestCitySlug: 'fresno',
    nearestCityName: 'Fresno',
  },
  {
    slug: 'grand-canyon',
    name: 'Grand Canyon National Park',
    shortName: 'Grand Canyon',
    state: 'Arizona',
    lat: 36.0544,
    lon: -112.1401,
    timezone: 'America/Phoenix',
    intro:
      'A mile deep and up to eighteen miles across, the Grand Canyon is the defining landscape of the American Southwest. The South Rim is open all year; the higher, cooler North Rim runs a short mid-May to mid-October season.',
    whenToVisit:
      'Spring (March–May) and fall (September–November) are ideal: mild on the rim and survivable below it. Summer bakes the inner canyon past 100°F, making rim-to-river hikes genuinely dangerous in the midday heat — go at dawn or not at all. Winter brings snow and solitude to the South Rim.',
    bestSeason: 'March–May and September–November',
    bestMonths: [2, 3, 4, 8, 9, 10],
    daylightNote:
      'Arizona skips daylight saving, so summer sunrises come early — by 5:15 a.m. in June. Start any below-rim hike in that first cool light; with 14+ hours of daylight you have margin, but the limiting factor here is heat, not darkness.',
    hikes: [
      { name: 'South Kaibab to Ooh Aah Point', miles: 1.8, hours: 2, note: 'Big views for little effort; turn around at the overlook.' },
      { name: 'Bright Angel to Plateau Point', miles: 12, hours: 8, note: 'Strenuous all-day descent; summer-dangerous — water and dawn start essential.' },
      { name: 'Rim Trail', miles: 2, hours: 1, note: 'Flat, paved and shuttle-served along the canyon edge.' },
    ],
    nearestCitySlug: 'flagstaff',
    nearestCityName: 'Flagstaff',
  },
  {
    slug: 'zion',
    name: 'Zion National Park',
    shortName: 'Zion',
    state: 'Utah',
    lat: 37.2982,
    lon: -113.0263,
    timezone: 'America/Denver',
    intro:
      'Zion packs towering sandstone cliffs, slot canyons and the emerald Virgin River into a compact, shuttle-served canyon. Its signature routes — Angels Landing and The Narrows — are among the most sought-after day hikes in the country.',
    whenToVisit:
      'April–May and September–October are the sweet spot: warm but not scorching, with the river low enough for The Narrows. Summer tops 100°F and brings afternoon flash-flood risk in the slot canyons. Spring runoff can close The Narrows entirely, so check conditions before counting on it.',
    bestSeason: 'April–May and September–October',
    bestMonths: [3, 4, 8, 9],
    daylightNote:
      'The canyon walls steal an hour at each end of the day — direct sun reaches the floor late and leaves early even when 14 hours of daylight are technically available. Plan The Narrows for the bright middle of the day.',
    hikes: [
      { name: 'Angels Landing', miles: 5.4, hours: 5, note: 'Exposed chains to a knife-edge summit; permit required.' },
      { name: 'The Narrows (bottom-up)', miles: 9, hours: 8, note: 'Wade upriver through a slot canyon; turn back anytime.' },
      { name: 'Emerald Pools', miles: 3, hours: 2, note: 'Shaded pools and seasonal waterfalls; family-friendly.' },
    ],
    nearestCitySlug: 'las-vegas',
    nearestCityName: 'Las Vegas',
  },
  {
    slug: 'yellowstone',
    name: 'Yellowstone National Park',
    shortName: 'Yellowstone',
    state: 'Wyoming',
    lat: 44.4280,
    lon: -110.5885,
    timezone: 'America/Denver',
    intro:
      'The world’s first national park sits on a supervolcano, and it shows: geysers, hot springs and bubbling mud sit alongside canyons, waterfalls and some of the best wildlife watching in the lower 48.',
    whenToVisit:
      'Most roads open early May and close by early November. Summer is peak season — warm days, full access, and crowds at Old Faithful and Grand Prismatic. September is the connoisseur’s choice: thinning crowds, the elk rut in full bugle, and crisp mornings. Wildlife is most active in the long light around dawn and dusk.',
    bestSeason: 'Late May to September (September for wildlife & quiet)',
    bestMonths: [5, 6, 7, 8],
    daylightNote:
      'In late June the sky stays usable past 9:30 p.m. and light returns before 5 a.m. — over 15 hours of daylight. That long window is perfect for the dawn-and-dusk wildlife drives when bears, wolves and elk are on the move.',
    hikes: [
      { name: 'Fairy Falls & Grand Prismatic Overlook', miles: 5, hours: 3, note: 'Easy walk to the famous overhead view of the hot spring.' },
      { name: 'Mount Washburn', miles: 6, hours: 4, note: 'Switchbacks to a fire lookout with panoramic park views.' },
      { name: 'Brink of the Lower Falls', miles: 0.7, hours: 1, note: 'Short steep path to the top of a 308-foot waterfall.' },
    ],
    nearestCitySlug: 'bozeman',
    nearestCityName: 'Bozeman',
  },
  {
    slug: 'glacier',
    name: 'Glacier National Park',
    shortName: 'Glacier',
    state: 'Montana',
    lat: 48.7596,
    lon: -113.7870,
    timezone: 'America/Denver',
    intro:
      'Glacier is the crown of the continent: turquoise lakes, hanging valleys and the engineering marvel of the Going-to-the-Sun Road threading over the Continental Divide. Its high latitude gives it some of the longest summer days in the lower 48.',
    whenToVisit:
      'The season is short and snow-dependent. The full Going-to-the-Sun Road usually opens late June to early July and closes by mid-October. July through September is the only reliable window for high trails like the Highline. Wildflowers peak in July; larches turn gold in late September.',
    bestSeason: 'July to mid-September',
    bestMonths: [6, 7, 8],
    daylightNote:
      'At 48°N this is one of the brightest summer parks in the contiguous US — nearly 16 hours of daylight at the solstice, with usable twilight past 10 p.m. The long evenings make the Highline Trail comfortably doable after the morning shuttle crowds thin out.',
    hikes: [
      { name: 'Highline Trail', miles: 11.8, hours: 7, note: 'Cliff-ledge traverse below the Garden Wall; shuttle back.' },
      { name: 'Hidden Lake Overlook', miles: 2.7, hours: 2, note: 'From Logan Pass to a glacial-lake viewpoint; mountain goats common.' },
      { name: 'Avalanche Lake', miles: 4.5, hours: 3, note: 'Cedar forest to a waterfall-ringed lake; great for all ages.' },
    ],
    nearestCitySlug: 'kalispell',
    nearestCityName: 'Kalispell',
  },
  {
    slug: 'rocky-mountain',
    name: 'Rocky Mountain National Park',
    shortName: 'Rocky Mountain',
    state: 'Colorado',
    lat: 40.3428,
    lon: -105.6836,
    timezone: 'America/Denver',
    intro:
      'An hour and a half from Denver, Rocky Mountain delivers alpine tundra, glacier-carved lakes and Trail Ridge Road — the highest continuous paved road in the US, topping 12,000 feet.',
    whenToVisit:
      'Trail Ridge Road is open roughly late May to mid-October. June through September is prime for the high lakes and tundra; the elk rut electrifies the meadows in September. Afternoon thunderstorms are near-daily in summer, so summit early and be below treeline by noon.',
    bestSeason: 'June to September',
    bestMonths: [5, 6, 7, 8],
    daylightNote:
      'Summer gives about 15 hours of daylight, but the real planning rule is weather, not light: lightning builds by early afternoon. Use the long morning — sunrise near 5:30 a.m. in June — to reach lakes and summits before the storms.',
    hikes: [
      { name: 'Emerald Lake', miles: 3.6, hours: 3, note: 'A string of three alpine lakes below sheer peaks.' },
      { name: 'Sky Pond', miles: 9, hours: 6, note: 'Past waterfalls to a cirque ringed by spires; long full day.' },
      { name: 'Bear Lake Loop', miles: 0.8, hours: 1, note: 'Flat, accessible loop around a roadside alpine lake.' },
    ],
    nearestCitySlug: 'boulder',
    nearestCityName: 'Boulder',
  },
  {
    slug: 'grand-teton',
    name: 'Grand Teton National Park',
    shortName: 'Grand Teton',
    state: 'Wyoming',
    lat: 43.7904,
    lon: -110.6818,
    timezone: 'America/Denver',
    intro:
      'The Tetons rise abruptly from the valley floor with no foothills to soften them — a wall of jagged 13,000-foot peaks mirrored in a chain of glacial lakes. It sits just south of Yellowstone, making the two an easy pairing.',
    whenToVisit:
      'Late May through September is the core season. Summer brings wildflowers, warm lakeside days and active wildlife; late September adds golden aspens and the start of the elk rut. Mornings are calm and reflective on the lakes before afternoon breezes pick up.',
    bestSeason: 'Late May to September',
    bestMonths: [5, 6, 7, 8],
    daylightNote:
      'Roughly 15 hours of daylight at midsummer, with the peaks catching first light well before 6 a.m. — the reason photographers line the Snake River Overlook at dawn. Long evenings leave time for a lake paddle after a full day on the trails.',
    hikes: [
      { name: 'Cascade Canyon', miles: 9.1, hours: 6, note: 'Boat shuttle across Jenny Lake, then up a granite canyon.' },
      { name: 'Jenny Lake Loop', miles: 7.1, hours: 4, note: 'Level lakeshore circuit beneath the highest peaks.' },
      { name: 'Taggart Lake', miles: 3.8, hours: 2, note: 'Short climb to a lake with a full Teton reflection.' },
    ],
    nearestCitySlug: 'idaho-falls',
    nearestCityName: 'Idaho Falls',
  },
  {
    slug: 'acadia',
    name: 'Acadia National Park',
    shortName: 'Acadia',
    state: 'Maine',
    lat: 44.3386,
    lon: -68.2733,
    timezone: 'America/New_York',
    intro:
      'On Maine’s rocky Atlantic coast, Acadia blends pink-granite headlands, spruce forest and carriage roads built by the Rockefellers. Cadillac Mountain is among the first places in the US to see the sunrise.',
    whenToVisit:
      'Late June through October is the season. Summer is warm and busy; the payoff for an autumn visit is some of the East Coast’s best foliage in early-to-mid October. From October to early March, Cadillac Mountain’s summit is literally the first ground in the country to catch the sunrise — a popular pre-dawn pilgrimage.',
    bestSeason: 'Late June to October (early October for foliage)',
    bestMonths: [6, 7, 8, 9],
    daylightNote:
      'As the easternmost park, Acadia’s sunrises are strikingly early — before 5 a.m. at midsummer. That, plus the Cadillac summit’s first-light claim, makes it the rare park where catching sunrise is the headline activity rather than an afterthought.',
    hikes: [
      { name: 'Beehive Loop', miles: 1.5, hours: 2, note: 'Iron rungs and ladders up an exposed cliff face; not for the wary.' },
      { name: 'Jordan Pond Path', miles: 3.3, hours: 2, note: 'Flat loop around a clear pond facing the Bubbles.' },
      { name: 'Cadillac North Ridge', miles: 4.4, hours: 3, note: 'Open granite ridge to the highest point on the coast.' },
    ],
    nearestCitySlug: 'bangor',
    nearestCityName: 'Bangor',
  },
  {
    slug: 'olympic',
    name: 'Olympic National Park',
    shortName: 'Olympic',
    state: 'Washington',
    lat: 47.8021,
    lon: -123.6044,
    timezone: 'America/Los_Angeles',
    intro:
      'Three parks in one: glaciated peaks, temperate rainforest dripping with moss, and a wild Pacific coastline of sea stacks and tide pools — all on Washington’s Olympic Peninsula.',
    whenToVisit:
      'July through September is the dependable dry window; the rest of the year the rainforest earns its name. Hurricane Ridge’s wildflower meadows peak in July and August. Time coastal walks at Rialto and Ruby Beach to low tide for the best tide pools.',
    bestSeason: 'July to September',
    bestMonths: [6, 7, 8],
    daylightNote:
      'At nearly 48°N the summer days are long — close to 16 hours at the solstice — and the high latitude stretches golden hour into a lingering, soft-lit evening that suits the rainforest and coast alike.',
    hikes: [
      { name: 'Hurricane Hill', miles: 3.2, hours: 2, note: 'Alpine ridge with wildflowers and Olympic-range views.' },
      { name: 'Hall of Mosses', miles: 0.8, hours: 1, note: 'Short loop through the iconic Hoh rainforest.' },
      { name: 'Sol Duc Falls', miles: 1.6, hours: 1, note: 'Easy forest walk to a three-pronged waterfall.' },
    ],
    nearestCitySlug: 'seattle',
    nearestCityName: 'Seattle',
  },
  {
    slug: 'mount-rainier',
    name: 'Mount Rainier National Park',
    shortName: 'Mount Rainier',
    state: 'Washington',
    lat: 46.8523,
    lon: -121.7603,
    timezone: 'America/Los_Angeles',
    intro:
      'An active 14,410-foot volcano draped in glaciers and ringed by wildflower meadows, Rainier dominates the Washington skyline. The Paradise area lives up to its name when the meadows bloom.',
    whenToVisit:
      'The famous subalpine wildflowers at Paradise and Sunrise peak from late July into August — and the high trails are only reliably snow-free July through September. Rainier makes its own weather, so clear views are never guaranteed; flexible dates help.',
    bestSeason: 'Late July to September',
    bestMonths: [6, 7, 8],
    daylightNote:
      'About 15.5 hours of daylight at midsummer. The long evenings are ideal for the Skyline Trail, where alpenglow on the summit after the day-trippers leave is the reward for a later loop.',
    hikes: [
      { name: 'Skyline Trail', miles: 5.5, hours: 5, note: 'Paradise meadows up toward Panorama Point and glaciers.' },
      { name: 'Naches Peak Loop', miles: 3.2, hours: 2, note: 'Wildflower loop with Rainier reflected in tarns.' },
      { name: 'Grove of the Patriarchs', miles: 1.1, hours: 1, note: 'Boardwalk among 1,000-year-old cedars and firs.' },
    ],
    nearestCitySlug: 'tacoma',
    nearestCityName: 'Tacoma',
  },
  {
    slug: 'sequoia',
    name: 'Sequoia National Park',
    shortName: 'Sequoia',
    state: 'California',
    lat: 36.5054,
    lon: -118.7654,
    timezone: 'America/Los_Angeles',
    intro:
      'Home to the largest trees on Earth, including General Sherman — the biggest living thing by volume. The park climbs from foothills into the high Sierra, with the giant sequoia groves at a comfortable mid-elevation.',
    whenToVisit:
      'The Giant Forest is accessible year-round (chains may be required in winter), and late spring through fall is ideal for combining the big trees with high-country trails. Summer is warm and busy at Sherman; September quiets down. The high Sierra above is snow-free only July to September.',
    bestSeason: 'Late May to October',
    bestMonths: [4, 5, 8, 9],
    daylightNote:
      'Around 14.5 hours of daylight at the solstice. The sequoia groves hold shade and cool air even at midday, so unlike the desert parks, the timing question here is comfort and crowds rather than racing the heat or the dark.',
    hikes: [
      { name: 'General Sherman & Congress Trail', miles: 3, hours: 2, note: 'Loop among the largest trees on the planet.' },
      { name: 'Moro Rock', miles: 0.5, hours: 1, note: 'Granite-dome staircase to a sweeping Sierra view.' },
      { name: 'Tokopah Falls', miles: 3.8, hours: 3, note: 'River-valley walk to a 1,200-foot cascade.' },
    ],
    nearestCitySlug: 'visalia',
    nearestCityName: 'Visalia',
  },
  {
    slug: 'joshua-tree',
    name: 'Joshua Tree National Park',
    shortName: 'Joshua Tree',
    state: 'California',
    lat: 33.8734,
    lon: -115.9010,
    timezone: 'America/Los_Angeles',
    intro:
      'Where the Mojave and Colorado deserts meet, twisted Joshua trees stand among piles of golden boulders. It’s a magnet for climbers, photographers and one of the best dark-sky parks within reach of a major city.',
    whenToVisit:
      'October through April is the season — mild days and cool, starry nights. Spring can bring wildflowers after a wet winter. Avoid midsummer: daytime highs routinely exceed 100°F and shade is nonexistent. The park is famous after dark, so plan around the new moon for stargazing.',
    bestSeason: 'October to April',
    bestMonths: [9, 10, 11, 0, 1, 2, 3],
    daylightNote:
      'In the cool season daylight runs a manageable 10–11 hours, but the real draw is the night: with little light pollution and dry desert air, the hours after dusk are the headline. Check sunset and the end of astronomical twilight to time a stargazing session.',
    hikes: [
      { name: 'Hidden Valley', miles: 1, hours: 1, note: 'Easy loop through a boulder-walled basin once used by cattle rustlers.' },
      { name: 'Ryan Mountain', miles: 3, hours: 3, note: 'Steady climb to the best panorama in the park.' },
      { name: 'Barker Dam', miles: 1.3, hours: 1, note: 'Flat loop past a desert reservoir and petroglyphs.' },
    ],
    nearestCitySlug: 'palm-springs',
    nearestCityName: 'Palm Springs',
  },
  {
    slug: 'death-valley',
    name: 'Death Valley National Park',
    shortName: 'Death Valley',
    state: 'California',
    lat: 36.5054,
    lon: -117.0794,
    timezone: 'America/Los_Angeles',
    intro:
      'The largest national park in the lower 48 and the hottest, driest and lowest of them all. Below-sea-level salt flats, sculpted badlands and rolling dunes make it feel like another planet — best explored in the cool months.',
    whenToVisit:
      'November to March is the only sensible window. Winter days are pleasant and clear; a wet year can trigger a rare spring wildflower bloom. Summer is genuinely lethal — air temperatures regularly pass 120°F — and hiking is discouraged after mid-morning even in spring.',
    bestSeason: 'November to March',
    bestMonths: [10, 11, 0, 1, 2],
    daylightNote:
      'In the cool season you get only 10–11 hours of daylight, so the touring window is short — start at sunrise to catch low light on the dunes and badlands and to be off exposed trails before the afternoon heat builds, even in winter.',
    hikes: [
      { name: 'Golden Canyon to Zabriskie Point', miles: 3, hours: 2, note: 'Badlands canyon to the park’s most famous overlook.' },
      { name: 'Mesquite Flat Sand Dunes', miles: 2, hours: 2, note: 'Open dune walking; magic at sunrise and sunset.' },
      { name: 'Badwater Basin', miles: 1, hours: 1, note: 'Flat boardwalk onto salt flats 282 feet below sea level.' },
    ],
    nearestCitySlug: 'las-vegas',
    nearestCityName: 'Las Vegas',
  },
  {
    slug: 'arches',
    name: 'Arches National Park',
    shortName: 'Arches',
    state: 'Utah',
    lat: 38.7331,
    lon: -109.5925,
    timezone: 'America/Denver',
    intro:
      'Over 2,000 natural stone arches are packed into this compact red-rock park outside Moab, including the world-famous Delicate Arch. Balanced rocks, fins and spires fill the gaps.',
    whenToVisit:
      'April–May and September–October are ideal — warm, clear and comfortable for hiking. Summer pushes past 100°F with little shade, so any summer visit means dawn starts. A timed-entry reservation is required in the busy months, so plan ahead.',
    bestSeason: 'April–May and September–October',
    bestMonths: [3, 4, 8, 9],
    daylightNote:
      'Delicate Arch glows at sunset, drawing a crowd in the final hour of light — so the daylight figure that matters most here is sunset time. In summer that’s past 8:30 p.m.; check it and arrive an hour early for the walk up.',
    hikes: [
      { name: 'Delicate Arch', miles: 3, hours: 2, note: 'Slickrock climb to the iconic free-standing arch; best at sunset.' },
      { name: 'Devils Garden', miles: 7.9, hours: 5, note: 'Strings together eight arches on a longer fin-and-slot loop.' },
      { name: 'Landscape Arch', miles: 1.9, hours: 1, note: 'Flat path to one of the longest stone spans in the world.' },
    ],
    nearestCitySlug: 'moab',
    nearestCityName: 'Moab',
  },
  {
    slug: 'bryce-canyon',
    name: 'Bryce Canyon National Park',
    shortName: 'Bryce Canyon',
    state: 'Utah',
    lat: 37.5930,
    lon: -112.1871,
    timezone: 'America/Denver',
    intro:
      'Not a canyon but a series of natural amphitheaters filled with hoodoos — thousands of orange limestone spires. At 8,000–9,000 feet it stays cool when the rest of Utah’s red rock bakes.',
    whenToVisit:
      'May through October is the main season; the high elevation keeps summer pleasant when nearby Zion and Arches are sweltering. Winter is snowy and beautiful but cold. The thin, dry air and elevation also make Bryce one of the darkest skies in the country.',
    bestSeason: 'May to October',
    bestMonths: [4, 5, 6, 7, 8, 9],
    daylightNote:
      'Sunrise and sunset are the events here — low light sets the hoodoos ablaze, and the names Sunrise Point and Sunset Point are no accident. After dark, the elevation delivers exceptional stargazing; check the end of astronomical twilight before heading to a rim viewpoint.',
    hikes: [
      { name: 'Navajo & Queen’s Garden Loop', miles: 2.9, hours: 2, note: 'The classic descent down among the hoodoos.' },
      { name: 'Peekaboo Loop', miles: 5.5, hours: 4, note: 'Longer circuit deeper into the amphitheater.' },
      { name: 'Rim Trail (Sunset to Sunrise)', miles: 1, hours: 1, note: 'Flat clifftop walk between the two namesake viewpoints.' },
    ],
    nearestCitySlug: 'cedar-city',
    nearestCityName: 'Cedar City',
  },
  {
    slug: 'great-smoky-mountains',
    name: 'Great Smoky Mountains National Park',
    shortName: 'Great Smoky Mountains',
    state: 'Tennessee & North Carolina',
    lat: 35.6118,
    lon: -83.4895,
    timezone: 'America/New_York',
    intro:
      'The most visited national park in the country, straddling the Tennessee–North Carolina line. Misty blue ridges, wildflower-rich forests and historic Appalachian homesteads — and famously, no entrance fee.',
    whenToVisit:
      'Spring (April–May) brings the wildflower bloom the park is known for, and mid-to-late October delivers spectacular fall color across the ridges. Summer is lush but humid and crowded. June fireflies put on a synchronized show that draws a lottery-only crowd.',
    bestSeason: 'April–May (wildflowers) and October (foliage)',
    bestMonths: [3, 4, 9],
    daylightNote:
      'At this southern latitude daylight is more even year-round — about 14.5 hours at midsummer and still over 10 in autumn. Haze and tree cover dim the light under the canopy, so start longer ridge hikes like Mount LeConte with hours to spare.',
    hikes: [
      { name: 'Alum Cave to Mount LeConte', miles: 11, hours: 8, note: 'Long climb past bluffs to one of the park’s highest peaks.' },
      { name: 'Laurel Falls', miles: 2.4, hours: 2, note: 'Paved path to an 80-foot waterfall; very popular.' },
      { name: 'Clingmans Dome', miles: 1, hours: 1, note: 'Steep paved ramp to an observation tower atop the park.' },
    ],
    nearestCitySlug: 'knoxville',
    nearestCityName: 'Knoxville',
  },
  {
    slug: 'shenandoah',
    name: 'Shenandoah National Park',
    shortName: 'Shenandoah',
    state: 'Virginia',
    lat: 38.5330,
    lon: -78.3503,
    timezone: 'America/New_York',
    intro:
      'A long, narrow park along the Blue Ridge, stitched together by the 105-mile Skyline Drive and its 75 overlooks. Waterfalls, wildflowers and easy access from Washington, DC make it a favorite weekend escape.',
    whenToVisit:
      'Spring wildflowers (April–May) and fall foliage (mid-October) are the two highlights, with mild temperatures for hiking. Summer is green and humid; the Skyline Drive stays scenic year-round but can close in winter ice. October weekends are very busy with leaf-peepers.',
    bestSeason: 'April–May and mid-October',
    bestMonths: [3, 4, 9],
    daylightNote:
      'About 14.5 hours of daylight at the solstice. Old Rag is a long, rocky scramble — start it early in spring or fall when daylight is shorter, so the boulder section isn’t a race against dusk.',
    hikes: [
      { name: 'Old Rag', miles: 9.4, hours: 8, note: 'Strenuous rock-scramble loop; the park’s signature challenge.' },
      { name: 'Dark Hollow Falls', miles: 1.4, hours: 2, note: 'Short steep walk to a cascading waterfall.' },
      { name: 'Stony Man', miles: 1.6, hours: 1, note: 'Gentle climb to a cliff view over the Shenandoah Valley.' },
    ],
    nearestCitySlug: 'charlottesville',
    nearestCityName: 'Charlottesville',
  },
  {
    slug: 'denali',
    name: 'Denali National Park',
    shortName: 'Denali',
    state: 'Alaska',
    lat: 63.1148,
    lon: -151.1926,
    timezone: 'America/Anchorage',
    intro:
      'Six million acres of subarctic wilderness around North America’s highest peak. A single road penetrates the park; beyond it lies trackless tundra, grizzlies, caribou and the 20,310-foot mountain itself — visible on only about a third of summer days.',
    whenToVisit:
      'The season is short: late May to mid-September, when the park road, shuttles and visitor services run. June and July offer the longest days and best wildlife viewing; late August into September adds tundra fall color and the first northern-lights chances. The mountain is shy, so build in extra days for a clear view.',
    bestSeason: 'Late May to mid-September',
    bestMonths: [5, 6, 7, 8],
    daylightNote:
      'This is the daylight extreme of the US parks: more than 20 hours of true daylight at the solstice, and the sun barely dips far enough for real darkness — civil twilight glows through the small hours. You can hike the tundra at 10 p.m. in full light, but the flip side is no aurora until the nights return in late August.',
    hikes: [
      { name: 'Savage Alpine Trail', miles: 4, hours: 3, note: 'Tundra ridge accessible without a backcountry permit.' },
      { name: 'Mount Healy Overlook', miles: 5.4, hours: 4, note: 'Steep climb to a viewpoint over the park entrance.' },
      { name: 'Horseshoe Lake', miles: 2, hours: 2, note: 'Easy loop to an oxbow lake near the railroad.' },
    ],
    nearestCitySlug: 'fairbanks',
    nearestCityName: 'Fairbanks',
  },
]

const bySlug: Map<string, NationalPark> = new Map(
  NATIONAL_PARKS.map((p) => [p.slug, p]),
)

export function getParkBySlug(slug: string): NationalPark | null {
  return bySlug.get(slug) ?? null
}

export function getAllParkSlugs(): string[] {
  return NATIONAL_PARKS.map((p) => p.slug)
}
