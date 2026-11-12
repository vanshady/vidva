export const formatNumber = (n: number) => n.toLocaleString()

export const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`

/**
 * Humanize a total runtime in hours: "2 months 2 weeks 3 days".
 * Months are 30 days; each unit is taken from the remainder of the larger one.
 */
export const humanizeHours = (hours: number): string => {
  if (hours < 24) return plural(hours, 'hour')
  const HOURS_PER_DAY = 24
  const HOURS_PER_WEEK = HOURS_PER_DAY * 7
  const HOURS_PER_MONTH = HOURS_PER_DAY * 30

  const months = Math.floor(hours / HOURS_PER_MONTH)
  const afterMonths = hours % HOURS_PER_MONTH
  const weeks = Math.floor(afterMonths / HOURS_PER_WEEK)
  const days = Math.floor((afterMonths % HOURS_PER_WEEK) / HOURS_PER_DAY)

  const parts: string[] = []
  if (months > 0) parts.push(plural(months, 'month'))
  if (weeks > 0) parts.push(plural(weeks, 'week'))
  if (days > 0) parts.push(plural(days, 'day'))
  return parts.join(' ')
}

export const msToHours = (ms: number) => Math.floor(ms / (1000 * 60 * 60))

export const yearSpan = (years: (number | undefined)[]): string | null => {
  const valid = years.filter((y): y is number => typeof y === 'number' && y > 0)
  if (valid.length === 0) return null
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  return min === max ? `${min}` : `${min}–${max}`
}

/** Case- and diacritic-insensitive key for matching names ("Kieślowski" ~ "kieslowski"). */
export const searchKey = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
