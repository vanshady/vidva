import { useQuery } from '@tanstack/react-query'
import { CachedCredits, readCredits, slimCredits, writeCredits } from './creditsCache'

// The browser never talks to Plex directly. Caddy (in the container) and Vite's
// dev/preview server proxy /plex/* to the Plex server and add the token there,
// so the token stays out of the bundle and HTTPS deployments avoid mixed content.
export const PLEX_PROXY_PATH = '/plex'
export const PLEX_SERVER_ID = import.meta.env.VITE_PLEX_SERVER_ID

export interface PlexMediaItem {
  ratingKey: string
  title: string
  year?: number
  viewCount?: number
  type: string
  thumb?: string
  Genre?: { tag: string }[]
  Director?: { tag: string; thumb?: string }[]
  lastViewedAt?: string
  // Unix seconds; changes whenever Plex rewrites the item's metadata.
  updatedAt?: number
  duration?: number
  rating?: number
  Role?: { tag: string; thumb?: string }[]
  Country?: { tag: string }[]
  // Set on episode items — refers to the parent show.
  grandparentRatingKey?: string
  grandparentTitle?: string
  grandparentThumb?: string
  grandparentYear?: number
  Media?: {
    Language?: {
      tag: string
    }[]
  }[]
}

interface GenreStats {
  name: string
  count: number
}

interface DirectorStats {
  name: string
  count: number
  movieId?: string
}

interface CastStats {
  name: string
  count: number
  movieId?: string
}

interface PlexDirector {
  tag: string
  thumb?: string
}

interface PlexRole {
  tag: string
  thumb?: string
}

export interface CountryStats {
  name: string
  count: number
}

interface DecadeStats {
  name: string
  count: number
}

interface BaseStats {
  name: string
  count: number
}

interface PlexLibrary {
  id: number
  name: string
  type: string
  count: number
}

interface PlexSection {
  key: string
  title: string
  type: string
  count: number
}

export class PlexError extends Error {
  constructor(message: string, readonly kind: 'network' | 'http', readonly status?: number) {
    super(message)
    this.name = 'PlexError'
  }
}

// Errors are thrown, never toasted here: pages render one alert per failure
// instead of a notification per request.
export const fetchPlexAPI = async (endpoint: string) => {
  let response: Response
  try {
    response = await fetch(`${PLEX_PROXY_PATH}${endpoint}`, {
      headers: { 'Accept': 'application/json' },
    })
  } catch {
    throw new PlexError(`Can't reach VIDVA's Plex proxy.`, 'network')
  }

  // The proxy answers 502/504 when the Plex server itself is down or unreachable.
  if (response.status === 502 || response.status === 504) {
    throw new PlexError(`Can't reach the Plex server (proxy answered ${response.status}).`, 'network', response.status)
  }
  if (!response.ok) {
    throw new PlexError(`Plex answered ${response.status} ${response.statusText} for ${endpoint.split('?')[0]}.`, 'http', response.status)
  }

  return response.json()
}

// Plex returns far more than the dashboard reads (file/stream info, ratings,
// producers, summaries, artwork palettes). Excluding it server-side roughly
// halves the payload the browser downloads and parses.
const UNUSED_ELEMENTS = 'Media,Guid,Field,Label,Producer,Image,UltraBlurColors,Rating,Writer,CommonSenseMedia'
const UNUSED_FIELDS = 'summary,tagline'
const METADATA_PARAMS = `excludeElements=${UNUSED_ELEMENTS}&excludeFields=${UNUSED_FIELDS}`
// The listing's tag lists are truncated (Genre, Country, Director, Role all
// differ from full metadata), so credits always come from the metadata
// endpoint or the cache and the listing can skip them too.
const LISTING_PARAMS = `excludeElements=${UNUSED_ELEMENTS},Genre,Country,Director,Role&excludeFields=${UNUSED_FIELDS}`

const fetchListing = async (path: string): Promise<PlexMediaItem[]> => {
  const data = await fetchPlexAPI(`${path}${path.includes('?') ? '&' : '?'}${LISTING_PARAMS}`)
  return (data.MediaContainer.Metadata as PlexMediaItem[]) || []
}

// Plex's /library/metadata/{key1,key2,...} endpoint accepts a comma-separated
// list of ratingKeys and returns full metadata (incl. full Role cast list) in
// one response. We chunk to keep URLs under typical 8KB server limits.
const BATCH_KEY_COUNT = 200

export const fetchMetadataBatch = async (items: PlexMediaItem[]): Promise<PlexMediaItem[]> => {
  if (items.length === 0) return []

  const chunks: PlexMediaItem[][] = []
  for (let i = 0; i < items.length; i += BATCH_KEY_COUNT) {
    chunks.push(items.slice(i, i + BATCH_KEY_COUNT))
  }

  const responses = await Promise.all(
    chunks.map(chunk => {
      const keys = chunk.map(item => item.ratingKey).join(',')
      return fetchPlexAPI(`/library/metadata/${keys}?${METADATA_PARAMS}`)
    })
  )

  return responses.flatMap(r => (r.MediaContainer.Metadata as PlexMediaItem[]) || [])
}

/**
 * Attaches full credits to listing items. Credits for items whose `updatedAt`
 * is unchanged since the last visit come from the browser cache; only new or
 * changed items hit Plex's metadata endpoint, so repeat loads skip the
 * expensive part entirely.
 */
const withCredits = async (cacheKey: string, listing: PlexMediaItem[]): Promise<PlexMediaItem[]> => {
  const cached = await readCredits(cacheKey)

  const snapshot: Record<string, CachedCredits> = {}
  const stale: PlexMediaItem[] = []
  listing.forEach(item => {
    const hit = cached[item.ratingKey]
    // Without an updatedAt there's nothing to validate against; always refetch.
    if (hit && item.updatedAt !== undefined && hit.updatedAt === item.updatedAt) snapshot[item.ratingKey] = hit
    else stale.push(item)
  })
  if (stale.length > 0) {
    const fresh = await fetchMetadataBatch(stale)
    fresh.forEach(item => { snapshot[item.ratingKey] = slimCredits(item) })
  }
  // Rewritten even when nothing was stale so removed titles drop out.
  if (stale.length > 0 || Object.keys(cached).length !== listing.length) {
    void writeCredits(cacheKey, snapshot)
  }

  return listing.map(item => {
    const credits = snapshot[item.ratingKey]
    if (!credits) return item
    const { Genre, Country, Director, Role } = credits
    return { ...item, Genre, Country, Director, Role }
  })
}

// Namespaced by server so pointing VIDVA at a different Plex can't reuse
// another server's ratingKeys.
const cacheKeyFor = (path: string) => `${PLEX_SERVER_ID ?? ''}${path}`

const useBaseStatistics = <T extends BaseStats>(
  items: PlexMediaItem[] | undefined,
  queryKey: string,
  extractStats: (items: PlexMediaItem[]) => T[],
  libraryId: string
) => {
  return useQuery<T[]>({
    queryKey: [queryKey, libraryId],
    queryFn: () => {
      if (!items || items.length === 0) {
        return []
      }
      return extractStats(items)
    },
    enabled: !!items,
  })
}

const extractTagStats = (items: PlexMediaItem[], tagKey: keyof PlexMediaItem) => {
  const counts = new Map<string, number>()
  items.forEach(item => {
    const tags = item[tagKey] as { tag: string }[] | undefined
    if (tags) {
      tags.forEach(tag => {
        const count = counts.get(tag.tag) || 0
        counts.set(tag.tag, count + 1)
      })
    }
  })

  const result = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return result
}

export const useGenreStatistics = (items: PlexMediaItem[] | undefined, libraryId: string) => {
  return useBaseStatistics(
    items,
    'genreStatistics',
    (items) => extractTagStats(items, 'Genre') as GenreStats[],
    libraryId
  )
}

export const useDirectorStatistics = (items: PlexMediaItem[] | undefined, libraryId: string) => {
  return useBaseStatistics(
    items,
    'directorStatistics',
    (items) => {
      const directorCounts = new Map<string, { count: number; movieId?: string }>()
      items.forEach(item => {
        if (item.Director) {
          item.Director.forEach((director: PlexDirector) => {
            const existing = directorCounts.get(director.tag)
            if (existing) {
              existing.count++
            } else {
              directorCounts.set(director.tag, { count: 1, movieId: item.ratingKey })
            }
          })
        }
      })

      return Array.from(directorCounts.entries())
        .map(([name, data]) => ({ name, count: data.count, movieId: data.movieId }))
        .sort((a, b) => b.count - a.count) as DirectorStats[]
    },
    libraryId
  )
}

export const useCastStatistics = (items: PlexMediaItem[] | undefined, libraryId: string, topCastCount: string) => {
  return useQuery<CastStats[]>({
    queryKey: ['castStatistics', libraryId, topCastCount],
    queryFn: () => {
      if (!items || items.length === 0) {
        return []
      }
      const castCounts = new Map<string, { count: number; movieId?: string }>()
      const topCastCountInt = topCastCount == 'all' ? Number.MAX_SAFE_INTEGER : parseInt(topCastCount);
      items.forEach(item => {
        if (item.Role) {
          const Role = item.Role;
          for (let i = 0; i < Math.min(item.Role.length, topCastCountInt); i++) {
            const role: PlexRole = Role[i];

            const existing = castCounts.get(role.tag)
            if (existing) {
              existing.count++
            } else {
              castCounts.set(role.tag, { count: 1, movieId: item.ratingKey })
            }
          }
        }
      })

      return Array.from(castCounts.entries())
        .map(([name, data]) => ({ name, count: data.count, movieId: data.movieId }))
        .sort((a, b) => b.count - a.count) as CastStats[];
    },
    enabled: !!items,
  })
}

export const useCountryStatistics = (items: PlexMediaItem[] | undefined, libraryId: string) => {
  return useBaseStatistics(
    items,
    'countryStatistics',
    (items) => extractTagStats(items, 'Country') as CountryStats[],
    libraryId
  )
}

export const useDecadeStatistics = (items: PlexMediaItem[] | undefined, libraryId: string) => {
  return useBaseStatistics(
    items,
    'decadeStatistics',
    (items) => {
      const decadeCounts = new Map<string, number>()
      items.forEach(item => {
        if (item.year) {
          const decade = Math.floor(item.year / 10) * 10
          const decadeName = `${decade}s`
          const count = decadeCounts.get(decadeName) || 0
          decadeCounts.set(decadeName, count + 1)
        }
      })

      return Array.from(decadeCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name)) as DecadeStats[]
    },
    libraryId
  )
}

export const usePlexLibraries = () => {
  return useQuery<PlexLibrary[]>({
    queryKey: ['plexLibraries'],
    queryFn: async () => {
      const data = await fetchPlexAPI('/library/sections')
      return data.MediaContainer.Directory.map((section: PlexSection) => ({
        id: parseInt(section.key),
        name: section.title,
        type: section.type,
        count: section.count
      }))
    },
  })
}

export const useLibraryItems = (libraryId: string) => {
  return useQuery<PlexMediaItem[]>({
    queryKey: ['libraryItems', libraryId],
    queryFn: async () => {
      const path = `/library/sections/${libraryId}/all`
      return withCredits(cacheKeyFor(path), await fetchListing(path))
    },
    enabled: !!libraryId
  })
}

// Fetch all episodes (type=4) for a TV show library. Each episode has its own
// duration, Director, and Role list — needed so cast/crew can be counted per
// episode rather than per show.
export const useLibraryEpisodes = (libraryId: string, libraryType: string | undefined) => {
  return useQuery<PlexMediaItem[]>({
    queryKey: ['libraryEpisodes', libraryId],
    queryFn: async () => {
      const path = `/library/sections/${libraryId}/all?type=4`
      return withCredits(cacheKeyFor(path), await fetchListing(path))
    },
    enabled: !!libraryId && libraryType === 'show'
  })
}
