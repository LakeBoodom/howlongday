/**
 * City aliases — common alternative names that people still search for more
 * than the official name in our dataset. Surfacing the alias in the title,
 * meta description and H1 lets the page rank for the alias query.
 *
 * Kept tiny and explicit on purpose. The first entry is the primary alias.
 */
const CITY_ALIASES: Record<string, string[]> = {
  bengaluru: ['Bangalore'],
  mumbai: ['Bombay'],
  kolkata: ['Calcutta'],
  chennai: ['Madras'],
}

export function getCityAliases(slug: string): string[] {
  return CITY_ALIASES[slug] ?? []
}

/** "Bengaluru (Bangalore)" if an alias exists, else just the name. */
export function nameWithAlias(slug: string, name: string): string {
  const aliases = getCityAliases(slug)
  return aliases.length ? `${name} (${aliases[0]})` : name
}
