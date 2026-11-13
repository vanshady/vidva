import { useMemo } from 'react'
import {
  PlexMediaItem,
  PLEX_PROXY_PATH,
  useCastStatistics,
  useCountryStatistics,
  useDecadeStatistics,
  useDirectorStatistics,
  useGenreStatistics,
  useLibraryEpisodes,
  useLibraryItems,
} from '../services/plexService'
import { Dimension, useActiveLibrary, useTopCastCount } from './library'
import { msToHours } from './format'

export interface RankedEntry {
  name: string
  count: number
}

/** Absolute people thumbs (metadata-static.plex.tv) load as-is; relative ones go through the Plex proxy. */
export const plexImageUrl = (thumb: string | undefined, width?: number, height?: number) => {
  if (!thumb) return undefined
  if (/^https?:\/\//.test(thumb)) return thumb
  if (width && height) {
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      minSize: '1',
      upscale: '1',
      url: thumb,
    })
    return `${PLEX_PROXY_PATH}/photo/:/transcode?${params.toString()}`
  }
  return `${PLEX_PROXY_PATH}${thumb}`
}

/**
 * Watched by the Plex account behind the server token. A show counts only once
 * every episode is watched, matching how Plex clears its unwatched marker.
 */
export const isWatched = (item: PlexMediaItem) =>
  item.type === 'show'
    ? !!item.leafCount && (item.viewedLeafCount ?? 0) >= item.leafCount
    : (item.viewCount ?? 0) > 0

/**
 * Everything the dashboard reads about the active library. For TV libraries,
 * people are counted per episode and runtime is summed across episodes;
 * genres, countries and decades come from the shows themselves.
 */
export const useCollection = () => {
  const active = useActiveLibrary()
  const { libraryId, isTv, library } = active
  const [topCastCount] = useTopCastCount()

  const itemsQuery = useLibraryItems(libraryId)
  const episodesQuery = useLibraryEpisodes(libraryId, library?.type)

  const items = itemsQuery.data
  const personItems = isTv ? episodesQuery.data : items

  const itemsLoading = active.isLoading || (!!libraryId && itemsQuery.isLoading)
  const peopleLoading = itemsLoading || (isTv && (episodesQuery.isLoading || episodesQuery.isPending))

  const genres = useGenreStatistics(items, libraryId)
  const countries = useCountryStatistics(items, libraryId)
  const decades = useDecadeStatistics(items, libraryId)
  const directors = useDirectorStatistics(personItems, libraryId)
  const cast = useCastStatistics(personItems, libraryId, topCastCount)
  const allCast = useCastStatistics(personItems, libraryId, 'all')

  const photos = useMemo(() => {
    const map = new Map<string, string>()
    personItems?.forEach(item => {
      item.Director?.forEach(d => { if (d.thumb && !map.has(`director:${d.tag}`)) map.set(`director:${d.tag}`, d.thumb) })
      item.Role?.forEach(r => {
        if (r.thumb && !map.has(`cast:${r.tag}`)) map.set(`cast:${r.tag}`, r.thumb)
      })
    })
    return map
  }, [personItems])

  const runtimeHours = useMemo(() => {
    const source = isTv ? episodesQuery.data : items
    if (!source) return undefined
    return msToHours(source.reduce((sum, item) => sum + (item.duration || 0), 0))
  }, [isTv, episodesQuery.data, items])

  const error = (itemsQuery.error || episodesQuery.error || active.error) as Error | null

  return {
    ...active,
    topCastCount,
    items,
    personItems,
    episodeCount: episodesQuery.data?.length,
    itemsLoading,
    peopleLoading,
    runtimeHours,
    error,
    stats: {
      genre: genres.data as RankedEntry[] | undefined,
      country: countries.data as RankedEntry[] | undefined,
      decade: decades.data as RankedEntry[] | undefined,
      director: directors.data as RankedEntry[] | undefined,
      cast: cast.data as RankedEntry[] | undefined,
      allCast: allCast.data as RankedEntry[] | undefined,
    },
    photoFor: (dimension: 'director' | 'cast', name: string) =>
      plexImageUrl(photos.get(`${dimension}:${name}`)),
  }
}

export type Collection = ReturnType<typeof useCollection>

const decadeOf = (year?: number) => (year ? `${Math.floor(year / 10) * 10}s` : undefined)

/**
 * Titles behind one aggregate. People match against episodes on TV libraries,
 * collapsed to their parent shows so the page lists shows, not episodes.
 */
export const titlesFor = (collection: Collection, dimension: Dimension, name: string): PlexMediaItem[] => {
  const { items = [], personItems = [], isTv } = collection

  if (dimension === 'director' || dimension === 'cast') {
    const matches = (item: PlexMediaItem) =>
      dimension === 'cast'
        ? item.Role?.some(r => r.tag === name)
        : item.Director?.some(d => d.tag === name)

    if (!isTv) return personItems.filter(matches)

    // Prefer the show's own listing entry: it carries watch progress the
    // episode's grandparent fields don't.
    const showsByKey = new Map(items.map(show => [show.ratingKey, show]))
    const shows = new Map<string, PlexMediaItem>()
    personItems.filter(matches).forEach(ep => {
      const key = ep.grandparentRatingKey
      if (key && !shows.has(key)) {
        shows.set(key, showsByKey.get(key) ?? {
          ratingKey: key,
          title: ep.grandparentTitle ?? ep.title,
          year: ep.grandparentYear,
          thumb: ep.grandparentThumb,
          type: 'show',
        })
      }
    })
    return Array.from(shows.values())
  }

  return items.filter(item => {
    if (dimension === 'genre') return item.Genre?.some(g => g.tag === name)
    if (dimension === 'country') return item.Country?.some(c => c.tag === name)
    return decadeOf(item.year) === name
  })
}

/** Runtime of the matching titles; for TV people, only the episodes they appear in. */
export const runtimeFor = (collection: Collection, dimension: Dimension, name: string, titles: PlexMediaItem[]) => {
  const { isTv, personItems = [] } = collection
  if (isTv && (dimension === 'director' || dimension === 'cast')) {
    const eps = personItems.filter(item =>
      dimension === 'cast' ? item.Role?.some(r => r.tag === name) : item.Director?.some(d => d.tag === name))
    return { hours: msToHours(eps.reduce((s, i) => s + (i.duration || 0), 0)), episodes: eps.length }
  }
  // A show's own duration is one episode's length, so TV categories carry no honest total.
  if (isTv) return { hours: undefined, episodes: undefined }
  return { hours: msToHours(titles.reduce((s, i) => s + (i.duration || 0), 0)), episodes: undefined }
}
