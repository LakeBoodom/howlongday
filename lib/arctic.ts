/**
 * Arctic & Nordic North — curated destinations across Finnish, Swedish and
 * Norwegian Lapland (plus Svalbard and the southern ski regions), most of which
 * are NOT in the city dataset (resorts, fells, fjord villages: Levi, Åre,
 * Abisko, Lofoten, Svalbard…).
 *
 * The unique, on-brand data here is the extreme daylight story per place:
 * the midnight-sun window, the polar-night window and the aurora season —
 * all PRECOMPUTED offline from the same SunCalc engine (see scripts notes) so
 * the destination page needs only a couple of live sun calls for "today".
 *
 * `nearestCitySlug` always points at a real city page in data/cities.json.
 */

export interface ArcticDestination {
  slug: string
  name: string
  country: 'Finland' | 'Sweden' | 'Norway'
  /** e.g. "Finnish Lapland", "Lofoten Islands", "Svalbard". */
  region: string
  lat: number
  lon: number
  timezone: string
  /** Short tagline, e.g. "Ski resort & aurora". */
  knownFor: string
  /** Curated 2–3 sentence intro. */
  intro: string
  /** Plain-language best window. */
  bestSeason: string
  /** A few signature things to do. */
  activities: string[]
  /** "May 28 – Jul 16", or null below the Arctic Circle. */
  midnightSun: string | null
  /** "Dec 12 – Jan 1", or null where the sun rises every day. */
  polarNight: string | null
  /** Readable aurora window, or null too far south for reliable aurora. */
  auroraSeason: string | null
  nearestCitySlug: string
  nearestCityName: string
}

export const ARCTIC_DESTINATIONS: ArcticDestination[] = [
  // ----- FINNISH LAPLAND --------------------------------------------------
  {
    slug: 'levi', name: 'Levi', country: 'Finland', region: 'Finnish Lapland',
    lat: 67.805, lon: 24.802, timezone: 'Europe/Helsinki',
    knownFor: 'Finland’s biggest ski resort & aurora',
    intro: 'Finland’s largest and busiest ski resort, rising above the village of Sirkka in Kittilä. With 43 slopes, a World Cup slalom hill, ski-in cabins and a long season, Levi is the country’s winter capital — and far enough north for the aurora and polar twilight.',
    bestSeason: 'December–April (skiing); September–March (aurora)',
    activities: ['Downhill & cross-country skiing', 'Husky and reindeer safaris', 'Aurora hunting', 'Summer mountain biking & hiking'],
    midnightSun: 'May 28 – Jul 16', polarNight: 'Dec 12 – Jan 1', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kittila', nearestCityName: 'Kittilä',
  },
  {
    slug: 'yllas', name: 'Ylläs', country: 'Finland', region: 'Finnish Lapland',
    lat: 67.56, lon: 24.18, timezone: 'Europe/Helsinki',
    knownFor: 'Fell skiing in a national park',
    intro: 'Two villages — Äkäslompolo and Ylläsjärvi — sit beneath Ylläs, the highest fell in the area, on the edge of Pallas-Yllästunturi National Park. It offers Finland’s longest slopes and some of its cleanest air, with quieter, more nature-led skiing than Levi next door.',
    bestSeason: 'December–April (skiing); June–September (hiking)',
    activities: ['Downhill & extensive cross-country trails', 'Snowshoeing in the national park', 'Aurora & polar-night photography', 'Autumn ruska (foliage) hiking'],
    midnightSun: 'May 30 – Jul 14', polarNight: 'Dec 16 – Dec 28', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kittila', nearestCityName: 'Kittilä',
  },
  {
    slug: 'ruka', name: 'Ruka', country: 'Finland', region: 'Finnish Lapland',
    lat: 66.165, lon: 29.15, timezone: 'Europe/Helsinki',
    knownFor: 'Long-season ski resort near Oulanka',
    intro: 'A compact, snow-sure resort just above the Arctic Circle in Kuusamo, with one of the longest ski seasons in Finland — often October to May. Ruka pairs downhill skiing with the wild gorges and rapids of nearby Oulanka National Park and the famous Karhunkierros hiking trail.',
    bestSeason: 'November–April (skiing); June–September (hiking)',
    activities: ['Downhill skiing & freestyle park', 'Karhunkierros trail hiking', 'Whitewater & wildlife in Oulanka', 'Aurora viewing'],
    midnightSun: 'Jun 11 – Jul 2', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'oulu', nearestCityName: 'Oulu',
  },
  {
    slug: 'saariselka', name: 'Saariselkä', country: 'Finland', region: 'Finnish Lapland',
    lat: 68.42, lon: 27.42, timezone: 'Europe/Helsinki',
    knownFor: 'Wilderness skiing & aurora',
    intro: 'One of Europe’s northernmost resorts, on the doorstep of the vast Urho Kekkonen National Park. Saariselkä is a base for fell skiing, wilderness trekking and serious aurora hunting, with glass igloos and a genuine polar-night season.',
    bestSeason: 'December–April (skiing & aurora); July–September (trekking)',
    activities: ['Downhill & wilderness cross-country skiing', 'Glass-igloo aurora stays', 'Multi-day trekking in Urho Kekkonen NP', 'Gold-panning at Tankavaara'],
    midnightSun: 'May 25 – Jul 19', polarNight: 'Dec 6 – Jan 7', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'inari', nearestCityName: 'Inari',
  },
  {
    slug: 'pyha', name: 'Pyhä', country: 'Finland', region: 'Finnish Lapland',
    lat: 67.0, lon: 27.23, timezone: 'Europe/Helsinki',
    knownFor: 'Steep slopes & national park',
    intro: 'Part of the Pyhä-Luosto resort pair, set against the ancient Pyhätunturi fells and Finland’s oldest national-park landscape. Pyhä has the steepest fall-lines in the region and a strong reputation for sustainability and aurora-dark skies.',
    bestSeason: 'November–April (skiing); June–September (hiking)',
    activities: ['Steep downhill skiing', 'Snowshoe & ski trails in Pyhä-Luosto NP', 'Aurora photography', 'Amethyst mine visit at Luosto'],
    midnightSun: 'Jun 3 – Jul 10', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'sodankyla', nearestCityName: 'Sodankylä',
  },
  {
    slug: 'luosto', name: 'Luosto', country: 'Finland', region: 'Finnish Lapland',
    lat: 67.15, lon: 26.9, timezone: 'Europe/Helsinki',
    knownFor: 'Amethyst fell & quiet skiing',
    intro: 'The smaller, quieter half of Pyhä-Luosto, known for its amethyst mine and log-cabin calm. Luosto is a gentle family resort wrapped in old-growth forest and fell, with excellent aurora visibility away from any town lights.',
    bestSeason: 'November–April (skiing & aurora); summer hiking',
    activities: ['Family downhill & cross-country skiing', 'Amethyst mine tour', 'Aurora & smoke-sauna evenings', 'Pyhä-Luosto NP hiking'],
    midnightSun: 'Jun 1 – Jul 11', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'sodankyla', nearestCityName: 'Sodankylä',
  },
  {
    slug: 'pallas', name: 'Pallas', country: 'Finland', region: 'Finnish Lapland',
    lat: 68.05, lon: 24.07, timezone: 'Europe/Helsinki',
    knownFor: 'Cleanest air in Europe',
    intro: 'The Pallastunturi fells anchor the northern end of Pallas-Yllästunturi National Park, where a measuring station regularly records the cleanest air in Europe. A small ski area and a classic hut-to-hut trail draw skiers and trekkers rather than crowds.',
    bestSeason: 'February–April (skiing); July–September (trekking)',
    activities: ['Backcountry & lift skiing', 'Hetta–Pallas hut trek', 'Aurora and clear-air stargazing', 'Reindeer-herding country walks'],
    midnightSun: 'May 27 – Jul 17', polarNight: 'Dec 9 – Jan 3', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kittila', nearestCityName: 'Kittilä',
  },
  {
    slug: 'muonio', name: 'Olos & Muonio', country: 'Finland', region: 'Finnish Lapland',
    lat: 67.96, lon: 23.68, timezone: 'Europe/Helsinki',
    knownFor: 'Cross-country & aurora',
    intro: 'A river-valley village near the Swedish border with the Olos and Särkijärvi fells nearby. Muonio is a cross-country skiing and aurora base, surrounded by some of the most reliable snow and darkest skies in Finland.',
    bestSeason: 'December–April (skiing & aurora); summer paddling & hiking',
    activities: ['Cross-country skiing', 'Husky safaris', 'Aurora photography', 'Summer river canoeing'],
    midnightSun: 'May 27 – Jul 17', polarNight: 'Dec 10 – Jan 2', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kittila', nearestCityName: 'Kittilä',
  },
  {
    slug: 'hetta', name: 'Hetta (Enontekiö)', country: 'Finland', region: 'Finnish Lapland',
    lat: 68.38, lon: 23.63, timezone: 'Europe/Helsinki',
    knownFor: 'Sámi village & trek trailhead',
    intro: 'The main village of Enontekiö, on the shore of Lake Ounasjärvi facing the Pallas fells. Hetta is a Sámi cultural centre and the northern trailhead of the classic Hetta–Pallas trek, with wide-open fell country and strong aurora.',
    bestSeason: 'March–April & August–September (trekking); winter aurora',
    activities: ['Hetta–Pallas hut trek', 'Sámi culture & Marian päivä gathering', 'Snowmobile & husky tours', 'Aurora viewing'],
    midnightSun: 'May 25 – Jul 19', polarNight: 'Dec 6 – Jan 6', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kittila', nearestCityName: 'Kittilä',
  },
  {
    slug: 'kilpisjarvi', name: 'Kilpisjärvi', country: 'Finland', region: 'Finnish Lapland',
    lat: 69.05, lon: 20.79, timezone: 'Europe/Helsinki',
    knownFor: 'Three-country fells & spring skiing',
    intro: 'Finland’s far north-western arm, wedged between Sweden and Norway beneath the pyramid of Saana fell. Kilpisjärvi has the country’s most alpine terrain, a long-lasting snowpack famous for spring ski-touring, and the Three-Country Cairn where the borders meet.',
    bestSeason: 'March–May (ski touring); July–September (hiking)',
    activities: ['Spring ski-touring on Saana & Malla', 'Hike to the Three-Country Cairn', 'Aurora & polar-night photography', 'Arctic flora at Malla Nature Reserve'],
    midnightSun: 'May 21 – Jul 22', polarNight: 'Dec 2 – Jan 11', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'tromso', nearestCityName: 'Tromsø',
  },
  {
    slug: 'utsjoki', name: 'Utsjoki', country: 'Finland', region: 'Finnish Lapland',
    lat: 69.91, lon: 27.03, timezone: 'Europe/Helsinki',
    knownFor: 'Northernmost Finland & salmon river',
    intro: 'Finland’s northernmost municipality, on the Teno (Tana) salmon river along the Norwegian border. Utsjoki is the heart of Finnish Sámi country, with treeless tundra, a long polar night and aurora that can fill the whole sky.',
    bestSeason: 'June–August (salmon & midnight sun); winter aurora',
    activities: ['Teno river salmon fishing', 'Sámi culture', 'Midnight-sun tundra hiking', 'Polar-night aurora viewing'],
    midnightSun: 'May 17 – Jul 27', polarNight: 'Nov 27 – Jan 16', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'inari', nearestCityName: 'Inari',
  },
  {
    slug: 'nuorgam', name: 'Nuorgam', country: 'Finland', region: 'Finnish Lapland',
    lat: 70.08, lon: 27.85, timezone: 'Europe/Helsinki',
    knownFor: 'The EU’s northernmost point',
    intro: 'A small Sámi village on the Teno river that holds the title of the northernmost point of Finland — and of the entire European Union. It’s a quiet outpost of fishing, tundra and some of the longest midnight-sun and aurora seasons in the country.',
    bestSeason: 'June–August (midnight sun & fishing); winter aurora',
    activities: ['Stand at the EU’s northernmost point', 'Teno salmon fishing', 'Tundra & river hiking', 'Aurora watching'],
    midnightSun: 'May 17 – Jul 27', polarNight: 'Nov 26 – Jan 17', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'inari', nearestCityName: 'Inari',
  },
  {
    slug: 'ivalo', name: 'Ivalo', country: 'Finland', region: 'Finnish Lapland',
    lat: 68.66, lon: 27.54, timezone: 'Europe/Helsinki',
    knownFor: 'Gateway to the far north',
    intro: 'The largest village in the Inari area and the air gateway to Finland’s far north. Ivalo sits on the Ivalo river near Lake Inari, a practical base for aurora trips, wilderness lodges and visits to Sámi Inari.',
    bestSeason: 'December–March (aurora & snow); summer fishing & hiking',
    activities: ['Aurora tours & glass igloos', 'Lake Inari boat trips', 'Husky & snowmobile safaris', 'Wilderness fishing'],
    midnightSun: 'May 23 – Jul 21', polarNight: 'Dec 4 – Jan 8', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'inari', nearestCityName: 'Inari',
  },
  {
    slug: 'salla', name: 'Salla', country: 'Finland', region: 'Finnish Lapland',
    lat: 66.83, lon: 28.67, timezone: 'Europe/Helsinki',
    knownFor: '“In the middle of nowhere”',
    intro: 'A small, deliberately remote resort near the Russian border that markets itself as being “in the middle of nowhere.” Salla offers low-key downhill and cross-country skiing, reindeer farms and a national park, with almost no light pollution.',
    bestSeason: 'December–April (skiing & aurora); summer hiking',
    activities: ['Downhill & cross-country skiing', 'Reindeer farm visits', 'Salla National Park trails', 'Aurora viewing'],
    midnightSun: 'Jun 4 – Jul 9', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kemi', nearestCityName: 'Kemi',
  },
  {
    slug: 'syote', name: 'Syöte', country: 'Finland', region: 'Finnish Lapland',
    lat: 65.63, lon: 27.95, timezone: 'Europe/Helsinki',
    knownFor: 'Southernmost fell resort',
    intro: 'The southernmost of Finland’s fell resorts, just below the Arctic Circle in a belt of snow-laden “tykky” forests. Syöte is a family-friendly skiing and snowshoeing base on the edge of Syöte National Park.',
    bestSeason: 'December–April (skiing); summer hiking & biking',
    activities: ['Downhill & cross-country skiing', 'Snowshoeing among tykky-laden trees', 'Syöte National Park hiking', 'Fat-bike & MTB trails'],
    midnightSun: null, polarNight: null, auroraSeason: 'October to March',
    nearestCitySlug: 'oulu', nearestCityName: 'Oulu',
  },

  // ----- SWEDISH LAPLAND & THE NORTH --------------------------------------
  {
    slug: 'are', name: 'Åre', country: 'Sweden', region: 'Jämtland',
    lat: 63.4, lon: 13.08, timezone: 'Europe/Stockholm',
    knownFor: 'Scandinavia’s premier ski resort',
    intro: 'The largest alpine resort in Scandinavia, strung along a lake beneath Åreskutan mountain in Jämtland. Åre has hosted World Championships and combines serious downhill terrain with a lively village, summer downhill biking and Nordic-cool dining.',
    bestSeason: 'December–April (skiing); June–September (biking & hiking)',
    activities: ['World-class downhill skiing', 'Downhill mountain biking', 'Via ferrata & hiking on Åreskutan', 'Lakeside dining & spa'],
    midnightSun: null, polarNight: null, auroraSeason: 'Possible on clear, active nights (Sept–March)',
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'abisko', name: 'Abisko', country: 'Sweden', region: 'Swedish Lapland',
    lat: 68.35, lon: 18.83, timezone: 'Europe/Stockholm',
    knownFor: 'The world’s best aurora spot',
    intro: 'A tiny national-park station famous for the “blue hole of Abisko” — a microclimate that keeps the sky unusually clear, making it one of the most reliable places on Earth to see the northern lights. In summer it’s the gateway to the Kungsleden trail and the midnight sun.',
    bestSeason: 'September–March (aurora); June–September (hiking)',
    activities: ['Aurora Sky Station chairlift', 'Kungsleden trail hiking', 'Lake Torneträsk & national park', 'Midnight-sun trekking'],
    midnightSun: 'May 25 – Jul 19', polarNight: 'Dec 7 – Jan 6', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kiruna', nearestCityName: 'Kiruna',
  },
  {
    slug: 'riksgransen', name: 'Riksgränsen', country: 'Sweden', region: 'Swedish Lapland',
    lat: 68.43, lon: 18.13, timezone: 'Europe/Stockholm',
    knownFor: 'Skiing under the midnight sun',
    intro: 'Sweden’s northernmost ski resort, right on the Norwegian border, famous for a season that runs into June — when you can ski under the midnight sun. It’s a magnet for freeriders and heli-skiing in spring.',
    bestSeason: 'February–June (incl. midnight-sun skiing)',
    activities: ['Spring & midnight-sun skiing', 'Off-piste & heli-skiing', 'Aurora in early season', 'Ski-touring toward Norway'],
    midnightSun: 'May 25 – Jul 19', polarNight: 'Dec 6 – Jan 7', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kiruna', nearestCityName: 'Kiruna',
  },
  {
    slug: 'bjorkliden', name: 'Björkliden', country: 'Sweden', region: 'Swedish Lapland',
    lat: 68.41, lon: 18.66, timezone: 'Europe/Stockholm',
    knownFor: 'Off-piste above Torneträsk',
    intro: 'A small high-mountain resort overlooking Lake Torneträsk, prized for long off-piste descents, cave skiing and a spring season under bright Arctic light. It sits between Abisko and Riksgränsen on the Kiruna–Narvik line.',
    bestSeason: 'February–May (skiing); summer hiking',
    activities: ['Off-piste & couloir skiing', 'Cave and glacier tours', 'Aurora viewing', 'Lakeside hiking'],
    midnightSun: 'May 25 – Jul 19', polarNight: 'Dec 6 – Jan 7', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kiruna', nearestCityName: 'Kiruna',
  },
  {
    slug: 'jukkasjarvi', name: 'Jukkasjärvi', country: 'Sweden', region: 'Swedish Lapland',
    lat: 67.85, lon: 20.66, timezone: 'Europe/Stockholm',
    knownFor: 'The original ICEHOTEL',
    intro: 'A village on the Torne river that built the world’s first ICEHOTEL, rebuilt from river ice every winter (with an ice-365 wing open year-round). Beyond the ice art, it’s a base for aurora, dog-sledding and Sámi culture near Kiruna.',
    bestSeason: 'December–April (ICEHOTEL & aurora); summer river trips',
    activities: ['Stay in the ICEHOTEL', 'Aurora tours', 'Dog-sledding & snowmobiling', 'Torne river rafting in summer'],
    midnightSun: 'May 28 – Jul 16', polarNight: 'Dec 12 – Jan 1', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kiruna', nearestCityName: 'Kiruna',
  },
  {
    slug: 'nikkaluokta', name: 'Nikkaluokta', country: 'Sweden', region: 'Swedish Lapland',
    lat: 67.85, lon: 19.02, timezone: 'Europe/Stockholm',
    knownFor: 'Gateway to Kebnekaise',
    intro: 'The end of the road and the classic starting point for Kebnekaise, Sweden’s highest mountain. This tiny Sámi settlement is the trailhead for one of the country’s great mountain hikes and a link onto the Kungsleden.',
    bestSeason: 'July–September (hiking); March–April (ski touring)',
    activities: ['Hike to Kebnekaise summit', 'Kungsleden trail access', 'Sámi heritage', 'Spring ski-touring'],
    midnightSun: 'May 28 – Jul 16', polarNight: 'Dec 12 – Jan 1', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'kiruna', nearestCityName: 'Kiruna',
  },
  {
    slug: 'jokkmokk', name: 'Jokkmokk', country: 'Sweden', region: 'Swedish Lapland',
    lat: 66.6, lon: 19.83, timezone: 'Europe/Stockholm',
    knownFor: 'Sámi winter market on the Arctic Circle',
    intro: 'A town straddling the Arctic Circle, best known for its 400-year-old Sámi winter market held each February. Jokkmokk is the cultural heart of Swedish Sápmi and a gateway to the Laponia World Heritage wilderness.',
    bestSeason: 'February (Sámi market & aurora); summer Laponia trekking',
    activities: ['Jokkmokk winter market', 'Ájtte Sámi museum', 'Laponia & Muddus NP hiking', 'Aurora viewing'],
    midnightSun: 'Jun 6 – Jul 7', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'gallivare', nearestCityName: 'Gällivare',
  },
  {
    slug: 'kvikkjokk', name: 'Kvikkjokk', country: 'Sweden', region: 'Swedish Lapland',
    lat: 66.95, lon: 17.72, timezone: 'Europe/Stockholm',
    knownFor: 'Gateway to Sarek',
    intro: 'A remote mountain village at the southern end of the Kungsleden and the doorway to Sarek National Park — Europe’s wildest, trail-less, bridge-less mountain wilderness. It’s a serious base for self-reliant trekkers and packrafters.',
    bestSeason: 'July–September (trekking)',
    activities: ['Kungsleden & Padjelantaleden trails', 'Sarek wilderness trekking', 'Packrafting the Tarra valley', 'Aurora in autumn'],
    midnightSun: 'Jun 3 – Jul 10', polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'gallivare', nearestCityName: 'Gällivare',
  },
  {
    slug: 'arvidsjaur', name: 'Arvidsjaur', country: 'Sweden', region: 'Swedish Lapland',
    lat: 65.59, lon: 19.17, timezone: 'Europe/Stockholm',
    knownFor: 'Winter car-testing & Sámi heritage',
    intro: 'A forest-and-lake town that becomes a winter hub for car manufacturers ice-testing on frozen lakes, alongside a preserved Sámi church village. It’s an accessible, snow-sure base for sledding and aurora.',
    bestSeason: 'December–March (snow & aurora); summer fishing',
    activities: ['Ice-driving experiences', 'Lappstaden Sámi church village', 'Dog-sledding', 'Aurora viewing'],
    midnightSun: null, polarNight: null, auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'lulea', nearestCityName: 'Luleå',
  },
  {
    slug: 'hemavan', name: 'Hemavan', country: 'Sweden', region: 'Southern Lapland',
    lat: 65.82, lon: 15.08, timezone: 'Europe/Stockholm',
    knownFor: 'Southern end of the Kungsleden',
    intro: 'A ski and hiking village in the Vindelfjällen mountains, marking the southern terminus of the 440-km Kungsleden. Hemavan pairs a friendly downhill resort with vast nature-reserve trekking.',
    bestSeason: 'December–April (skiing); July–September (hiking)',
    activities: ['Downhill & cross-country skiing', 'Kungsleden trekking', 'Vindelfjällen wildlife', 'Helicopter sightseeing'],
    midnightSun: 'Jun 17 – Jun 26', polarNight: null, auroraSeason: 'October to March',
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'tarnaby', name: 'Tärnaby', country: 'Sweden', region: 'Southern Lapland',
    lat: 65.73, lon: 15.28, timezone: 'Europe/Stockholm',
    knownFor: 'Birthplace of ski legends',
    intro: 'A lakeside mountain village, hometown of Ingemar Stenmark, with a low-key resort and big surrounding wilderness. Tärnaby sits just south of the Arctic Circle in the Vindelfjällen reserve.',
    bestSeason: 'December–April (skiing); summer hiking',
    activities: ['Downhill skiing', 'Ski-museum & local heritage', 'Vindelfjällen hiking', 'Aurora viewing'],
    midnightSun: 'Jun 21 – Jun 22', polarNight: null, auroraSeason: 'October to March',
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'storlien', name: 'Storlien', country: 'Sweden', region: 'Jämtland',
    lat: 63.32, lon: 12.1, timezone: 'Europe/Stockholm',
    knownFor: 'Cross-border ski village',
    intro: 'A small resort on the Norwegian border in western Jämtland, known for heavy snow off the Atlantic and good cross-country and backcountry terrain. It’s a quiet alternative to Åre just down the valley.',
    bestSeason: 'December–April (skiing); summer hiking',
    activities: ['Cross-country & downhill skiing', 'Backcountry tours', 'Jämtland Triangle hiking', 'Border-country cycling'],
    midnightSun: null, polarNight: null, auroraSeason: 'Possible on clear, active nights (Sept–March)',
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'vemdalen', name: 'Vemdalen', country: 'Sweden', region: 'Härjedalen',
    lat: 62.44, lon: 13.86, timezone: 'Europe/Stockholm',
    knownFor: 'Reliable snow in Härjedalen',
    intro: 'A pair of linked ski areas (Vemdalsskalet and Björnrike) in Härjedalen, with dependable snow and gentle, family-friendly slopes. It’s one of central Sweden’s most popular winter-sports areas.',
    bestSeason: 'December–April (skiing); summer hiking',
    activities: ['Family downhill skiing', 'Cross-country trails', 'Snowmobiling', 'Summer fell hiking'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'salen', name: 'Sälen', country: 'Sweden', region: 'Dalarna',
    lat: 61.16, lon: 13.27, timezone: 'Europe/Stockholm',
    knownFor: 'Sweden’s biggest ski area',
    intro: 'A cluster of resorts in Dalarna that together form Sweden’s largest ski destination and the start line of the historic Vasaloppet cross-country race. Sälen is family-focused, with gentle slopes and huge cross-country networks.',
    bestSeason: 'December–April (skiing); summer hiking & biking',
    activities: ['Downhill skiing across linked resorts', 'Vasaloppet cross-country trails', 'Family snow activities', 'Summer hiking & biking'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },
  {
    slug: 'idre', name: 'Idre Fjäll', country: 'Sweden', region: 'Dalarna',
    lat: 61.86, lon: 12.72, timezone: 'Europe/Stockholm',
    knownFor: 'Sunny family slopes',
    intro: 'A high, treeline resort in northern Dalarna with a sunny aspect and wide, open pistes popular with families. Nearby Idre is also home to Sweden’s only mountain reindeer-herding southern Sámi community.',
    bestSeason: 'December–April (skiing); summer hiking',
    activities: ['Family downhill skiing', 'Cross-country trails', 'Fulufjället NP & Njupeskär waterfall', 'Musk-ox spotting'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'ostersund', nearestCityName: 'Östersund',
  },

  // ----- NORWEGIAN ARCTIC -------------------------------------------------
  {
    slug: 'lofoten', name: 'Lofoten (Svolvær)', country: 'Norway', region: 'Lofoten Islands',
    lat: 68.23, lon: 14.56, timezone: 'Europe/Oslo',
    knownFor: 'Dramatic peaks over the sea',
    intro: 'A chain of islands where sharp granite peaks rise straight from the sea above red fishing huts and white beaches. Lofoten is one of the world’s most photogenic landscapes — surf, climb and hike under the midnight sun, or chase aurora over the water in winter.',
    bestSeason: 'June–August (midnight sun & hiking); September–March (aurora)',
    activities: ['Hiking Reinebringen & coastal peaks', 'Arctic surfing at Unstad', 'Aurora over the fjords', 'Fishing-village photography'],
    midnightSun: 'May 26 – Jul 18', polarNight: 'Dec 8 – Jan 5', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'bodo', nearestCityName: 'Bodø',
  },
  {
    slug: 'reine', name: 'Reine', country: 'Norway', region: 'Lofoten Islands',
    lat: 67.93, lon: 13.09, timezone: 'Europe/Oslo',
    knownFor: 'The most photographed village in Norway',
    intro: 'A fishing village on Moskenesøya, repeatedly voted the most beautiful place in Norway, where jagged peaks ring a turquoise harbour. Reine is the base for the iconic Reinebringen staircase hike and quiet kayak trips among the islets.',
    bestSeason: 'June–August (midnight sun); September–March (aurora)',
    activities: ['Reinebringen viewpoint hike', 'Sea-kayaking the harbour', 'Aurora photography', 'Rorbu (fishing-cabin) stays'],
    midnightSun: 'May 27 – Jul 16', polarNight: 'Dec 11 – Jan 2', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'bodo', nearestCityName: 'Bodø',
  },
  {
    slug: 'senja', name: 'Senja', country: 'Norway', region: 'Senja',
    lat: 69.27, lon: 17.55, timezone: 'Europe/Oslo',
    knownFor: 'Norway in miniature',
    intro: 'Norway’s second-largest island, with a wild outer coast of sheer peaks and a gentler, forested interior — often called “Norway in miniature.” Senja offers Lofoten-style drama with a fraction of the crowds, on the scenic route near Tromsø.',
    bestSeason: 'June–August (midnight sun); September–March (aurora)',
    activities: ['Segla & Hesten summit hikes', 'Coastal scenic drives', 'Aurora over the sea', 'Fishing & sea-eagle safaris'],
    midnightSun: 'May 20 – Jul 24', polarNight: 'Nov 30 – Jan 12', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'tromso', nearestCityName: 'Tromsø',
  },
  {
    slug: 'lyngen', name: 'Lyngen Alps', country: 'Norway', region: 'Troms',
    lat: 69.58, lon: 20.22, timezone: 'Europe/Oslo',
    knownFor: 'Ski-touring from sea to summit',
    intro: 'A glaciated mountain range east of Tromsø where peaks drop straight to the fjord, making it one of the world’s great ski-touring destinations — skin from sea level to summit and ski back to the water. Summer brings alpine hiking and glacier trips.',
    bestSeason: 'February–May (ski touring); July–September (hiking)',
    activities: ['Sea-to-summit ski touring', 'Glacier & alpine hiking', 'Aurora viewing', 'Fjord kayaking'],
    midnightSun: 'May 19 – Jul 25', polarNight: 'Nov 28 – Jan 14', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'tromso', nearestCityName: 'Tromsø',
  },
  {
    slug: 'vesteralen', name: 'Vesterålen', country: 'Norway', region: 'Vesterålen',
    lat: 68.7, lon: 15.41, timezone: 'Europe/Oslo',
    knownFor: 'Whales & gentler islands',
    intro: 'The islands north of Lofoten, greener and broader, and one of the best places in Europe for year-round whale watching — sperm whales offshore in summer, orca and humpback closer in winter. A quieter, wildlife-led alternative to its famous neighbour.',
    bestSeason: 'June–August (whales & midnight sun); Oct–Jan (winter whales & aurora)',
    activities: ['Whale-watching safaris', 'Coastal hiking', 'Aurora photography', 'Bleik beach & birdcliffs'],
    midnightSun: 'May 23 – Jul 21', polarNight: 'Dec 4 – Jan 9', auroraSeason: 'Mid-September to late March',
    nearestCitySlug: 'tromso', nearestCityName: 'Tromsø',
  },
  {
    slug: 'nordkapp', name: 'Nordkapp (North Cape)', country: 'Norway', region: 'Finnmark',
    lat: 71.17, lon: 25.78, timezone: 'Europe/Oslo',
    knownFor: 'Mainland Europe’s northern edge',
    intro: 'A 307-metre cliff plunging into the Barents Sea, marketed as the northernmost point of mainland Europe and a classic end-of-the-road pilgrimage. The midnight sun shines here from mid-May to the end of July; the polar night and aurora rule the winter.',
    bestSeason: 'May–July (midnight sun); September–March (aurora)',
    activities: ['Midnight sun at the North Cape globe', 'Coastal & cliff walks', 'King-crab safaris', 'Polar-night aurora'],
    midnightSun: 'May 12 – Aug 1', polarNight: 'Nov 21 – Jan 22', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'hammerfest', nearestCityName: 'Hammerfest',
  },
  {
    slug: 'honningsvag', name: 'Honningsvåg', country: 'Norway', region: 'Finnmark',
    lat: 70.98, lon: 25.97, timezone: 'Europe/Oslo',
    knownFor: 'Gateway port to Nordkapp',
    intro: 'A small fishing town on the island of Magerøya, the gateway port for the North Cape and a stop for the Hurtigruten coastal ferry. It’s a base for king-crab safaris, birdwatching and Arctic light.',
    bestSeason: 'May–July (midnight sun); September–March (aurora)',
    activities: ['Trips to Nordkapp', 'King-crab safaris', 'Gjesvær birdcliff puffin tours', 'Aurora viewing'],
    midnightSun: 'May 13 – Jul 31', polarNight: 'Nov 21 – Jan 21', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'hammerfest', nearestCityName: 'Hammerfest',
  },
  {
    slug: 'kirkenes', name: 'Kirkenes', country: 'Norway', region: 'Finnmark',
    lat: 69.73, lon: 30.05, timezone: 'Europe/Oslo',
    knownFor: 'King crab & the Russian border',
    intro: 'Norway’s far north-eastern outpost, closer to Murmansk than to Oslo and the turning point of the Hurtigruten route. Kirkenes is famous for king-crab safaris, a snow hotel and a genuine end-of-Europe frontier feel.',
    bestSeason: 'December–March (snow hotel & aurora); summer crab & hiking',
    activities: ['King-crab safaris (boat or snowmobile)', 'Snow hotel stays', 'Dog-sledding', 'Aurora viewing'],
    midnightSun: 'May 18 – Jul 26', polarNight: 'Nov 28 – Jan 15', auroraSeason: 'Late September to mid-March',
    nearestCitySlug: 'hammerfest', nearestCityName: 'Hammerfest',
  },
  {
    slug: 'svalbard', name: 'Svalbard (Longyearbyen)', country: 'Norway', region: 'Svalbard',
    lat: 78.22, lon: 15.65, timezone: 'Arctic/Longyearbyen',
    knownFor: 'High-Arctic extreme',
    intro: 'At 78°N, the world’s northernmost permanently inhabited town, halfway to the North Pole. Svalbard delivers the daylight extremes in full: four months of midnight sun, four months of polar night, polar bears, glaciers and a frontier research-town culture.',
    bestSeason: 'March–May (snowmobiling & light); June–August (midnight sun); polar-night winter',
    activities: ['Snowmobile expeditions', 'Glacier & ice-cave tours', 'Polar-bear-safe wildlife trips', 'Midnight-sun & polar-night experiences'],
    midnightSun: 'Apr 19 – Aug 24', polarNight: 'Oct 27 – Feb 15', auroraSeason: 'Late October to mid-February (incl. daytime polar-night aurora)',
    nearestCitySlug: 'tromso', nearestCityName: 'Tromsø',
  },

  // ----- SOUTHERN NORWAY (ski & fjords) -----------------------------------
  {
    slug: 'trysil', name: 'Trysil', country: 'Norway', region: 'Eastern Norway',
    lat: 61.31, lon: 12.27, timezone: 'Europe/Oslo',
    knownFor: 'Norway’s biggest ski resort',
    intro: 'Norway’s largest ski resort, a cone-shaped mountain ringed by pistes for every level and one of Scandinavia’s most reliable, family-friendly winter destinations. Summer turns it into a downhill-biking and hiking hub.',
    bestSeason: 'November–April (skiing); June–September (biking & hiking)',
    activities: ['Downhill skiing all around the mountain', 'Cross-country trails', 'Bike Park Trysil', 'Summer hiking & fishing'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
  {
    slug: 'hemsedal', name: 'Hemsedal', country: 'Norway', region: 'Viken',
    lat: 60.86, lon: 8.55, timezone: 'Europe/Oslo',
    knownFor: 'The “Scandinavian Alps”',
    intro: 'A steep, snow-sure resort between Oslo and Bergen, nicknamed the “Scandinavian Alps” for its alpine terrain and après-ski energy. It’s a favourite for advanced skiers and summer via-ferrata and hiking.',
    bestSeason: 'November–April (skiing); June–September (hiking)',
    activities: ['Steep downhill & freeride skiing', 'Via ferrata', 'Summer alpine hiking', 'Mountain biking'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
  {
    slug: 'geilo', name: 'Geilo', country: 'Norway', region: 'Viken',
    lat: 60.53, lon: 8.21, timezone: 'Europe/Oslo',
    knownFor: 'Classic resort on the Bergen line',
    intro: 'A relaxed, well-connected resort on the Oslo–Bergen railway beside the Hardangervidda plateau. Geilo is known for excellent cross-country skiing, gentle downhill and easy access to Norway’s largest national park.',
    bestSeason: 'November–April (skiing); June–September (hiking)',
    activities: ['Downhill & cross-country skiing', 'Hardangervidda plateau touring', 'Summer hiking & cycling', 'Train-in car-free access'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'bergen', nearestCityName: 'Bergen',
  },
  {
    slug: 'beitostolen', name: 'Beitostølen', country: 'Norway', region: 'Innlandet',
    lat: 61.25, lon: 8.91, timezone: 'Europe/Oslo',
    knownFor: 'Gateway to Jotunheimen',
    intro: 'A friendly mountain resort at the edge of Jotunheimen, home to Norway’s highest peaks. Beitostølen is a cross-country hub in winter and a prime base for hiking Besseggen and the high Jotunheimen trails in summer.',
    bestSeason: 'December–April (skiing); July–September (hiking)',
    activities: ['Cross-country & downhill skiing', 'Besseggen ridge hike', 'Jotunheimen peak trekking', 'Glacier walks'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
  {
    slug: 'finse', name: 'Finse', country: 'Norway', region: 'Viken',
    lat: 60.6, lon: 7.5, timezone: 'Europe/Oslo',
    knownFor: 'Highest railway station & glacier',
    intro: 'The highest point on the Bergen railway at 1,222 m, car-free and snowbound much of the year, beneath the Hardangerjøkulen glacier. Finse is a cult base for glacier skiing, the Rallarvegen cycle route and was a filming location for the ice planet Hoth.',
    bestSeason: 'February–May (ski & glacier); July–September (cycling & hiking)',
    activities: ['Glacier hiking on Hardangerjøkulen', 'Rallarvegen cycling', 'Cross-country & ski touring', 'Car-free wilderness lodge'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'bergen', nearestCityName: 'Bergen',
  },
  {
    slug: 'voss', name: 'Voss', country: 'Norway', region: 'Vestland',
    lat: 60.63, lon: 6.42, timezone: 'Europe/Oslo',
    knownFor: 'Norway’s adventure capital',
    intro: 'A fjord-and-mountain town between Bergen and the Sognefjord that bills itself as Norway’s capital of extreme sports — skydiving, paragliding, rafting — with the Myrkdalen ski resort nearby. A year-round adrenaline base on the Bergen line.',
    bestSeason: 'December–April (skiing); May–September (adventure sports & hiking)',
    activities: ['Skiing at Myrkdalen', 'Skydiving & paragliding', 'Whitewater rafting', 'Fjord hiking & via ferrata'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'bergen', nearestCityName: 'Bergen',
  },
  {
    slug: 'roros', name: 'Røros', country: 'Norway', region: 'Trøndelag',
    lat: 62.57, lon: 11.38, timezone: 'Europe/Oslo',
    knownFor: 'UNESCO mining town',
    intro: 'A perfectly preserved 17th-century copper-mining town, a UNESCO World Heritage Site of timber houses and turf roofs on a high, cold plateau. Røros is one of the coldest inhabited places in Norway, magical under winter snow and its famous February market.',
    bestSeason: 'December–March (winter town & market); summer hiking',
    activities: ['Old town & smelter-mine tours', 'Røros winter market', 'Cross-country skiing', 'Plateau hiking & cycling'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'trondheim', nearestCityName: 'Trondheim',
  },
  {
    slug: 'oppdal', name: 'Oppdal', country: 'Norway', region: 'Trøndelag',
    lat: 62.6, lon: 9.69, timezone: 'Europe/Oslo',
    knownFor: 'Big skiing & musk oxen',
    intro: 'A large, varied ski resort in southern Trøndelag at the edge of the Dovrefjell mountains, home to Europe’s only herds of wild musk oxen. It combines four linked ski areas in winter with safaris and high-mountain hiking in summer.',
    bestSeason: 'December–April (skiing); June–September (hiking & safaris)',
    activities: ['Downhill skiing across four areas', 'Musk-ox safaris in Dovrefjell', 'Snøhetta peak hike', 'River rafting'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'trondheim', nearestCityName: 'Trondheim',
  },
  {
    slug: 'rjukan', name: 'Rjukan', country: 'Norway', region: 'Telemark',
    lat: 59.87, lon: 8.5, timezone: 'Europe/Oslo',
    knownFor: 'Sun mirrors & heavy-water history',
    intro: 'A deep-valley industrial town, a UNESCO site for its hydroelectric heritage and the WWII heavy-water sabotage. Hemmed in by mountains, Rjukan gets no direct winter sun on its square — so it built giant mirrors on the hillside to beam sunlight down. Gaustatoppen above offers a vast panorama.',
    bestSeason: 'December–March (ice climbing & ski); June–September (hiking)',
    activities: ['See the Krossobanen cable car & sun mirrors', 'Gaustatoppen summit hike', 'Ice climbing in Vemork', 'Heavy-water history museum'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
  {
    slug: 'hovden', name: 'Hovden', country: 'Norway', region: 'Setesdal',
    lat: 59.55, lon: 7.36, timezone: 'Europe/Oslo',
    knownFor: 'Southern Norway’s highest resort',
    intro: 'The southernmost real alpine resort in Norway, at the head of the Setesdal valley, with the most snow-sure slopes within easy reach of the south coast. A relaxed family resort with good cross-country and summer fishing.',
    bestSeason: 'December–April (skiing); summer hiking & fishing',
    activities: ['Downhill & cross-country skiing', 'Snowshoe & sled trails', 'Setesdal heritage', 'Summer mountain fishing'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
  {
    slug: 'sjusjoen', name: 'Sjusjøen', country: 'Norway', region: 'Innlandet',
    lat: 61.2, lon: 10.83, timezone: 'Europe/Oslo',
    knownFor: 'Cross-country paradise above Lillehammer',
    intro: 'A high plateau of cabins and lakes above Lillehammer with one of the densest cross-country trail networks in Norway — hundreds of kilometres of prepared tracks. It’s the spiritual home of Norwegian recreational skiing.',
    bestSeason: 'December–April (cross-country skiing); summer hiking & cycling',
    activities: ['Vast cross-country trail network', 'Biathlon at nearby Sjusjøen arena', 'Cabin life & lake fishing', 'Summer trail running'],
    midnightSun: null, polarNight: null, auroraSeason: null,
    nearestCitySlug: 'oslo', nearestCityName: 'Oslo',
  },
]

const bySlug: Map<string, ArcticDestination> = new Map(
  ARCTIC_DESTINATIONS.map((d) => [d.slug, d]),
)

export function getArcticBySlug(slug: string): ArcticDestination | null {
  return bySlug.get(slug) ?? null
}

export function getAllArcticSlugs(): string[] {
  return ARCTIC_DESTINATIONS.map((d) => d.slug)
}

export function getArcticByCountry(country: ArcticDestination['country']): ArcticDestination[] {
  return ARCTIC_DESTINATIONS.filter((d) => d.country === country)
}
