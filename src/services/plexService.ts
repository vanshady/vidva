import { useQuery } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

export const PLEX_SERVER_URL = import.meta.env.VITE_PLEX_SERVER_URL
export const PLEX_TOKEN = import.meta.env.VITE_PLEX_TOKEN
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
  duration?: number
  rating?: number
  Role?: { tag: string }[]
  Country?: { tag: string }[]
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

export const fetchPlexAPI = async (endpoint: string) => {
  try {
    const response = await fetch(`${PLEX_SERVER_URL}${endpoint}`, {
      headers: {
        'X-Plex-Token': PLEX_TOKEN,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorMessage = `Plex API error: ${response.statusText} (${response.status})`
      notifications.show({
        title: 'Plex API Error',
        message: errorMessage,
        color: 'red',
        autoClose: 5000
      })
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    notifications.show({
      title: 'Network Error',
      message: `Failed to connect to Plex server: ${errorMessage}`,
      color: 'red',
      autoClose: 5000
    })
    throw error
  }
}

export const fetchMetadataBatch = async (items: PlexMediaItem[]) => {
  const batchSize = 10; // Adjust based on your needs
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => fetchPlexAPI(`/library/metadata/${item.ratingKey}`));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

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

// Add a new hook for fetching director details
export const useDirectorDetails = (directorName: string, movieId: string) => {
  return useQuery({
    queryKey: ['directorDetails', directorName, movieId],
    queryFn: async () => {
      const data = await fetchPlexAPI(`/library/metadata/${movieId}`)
      const directors = data.MediaContainer.Metadata[0].Director || []
      const director = directors.find((d: PlexDirector) => d.tag === directorName)

      if (!director) {
        throw new Error(`Director ${directorName} not found in movie ${movieId}`)
      }

      return {
        photo: director.thumb ? `${director.thumb}?width=128&height=128&minSize=1&upscale=1&X-Plex-Token=${PLEX_TOKEN}` : undefined
      }
    },
    enabled: !!directorName && !!movieId,
  })
}

export const useCastStatistics = (items: PlexMediaItem[] | undefined, libraryId: string) => {
  return useBaseStatistics(
    items,
    'castStatistics',
    (items) => {
      const castCounts = new Map<string, { count: number; movieId?: string }>()
      items.forEach(item => {
        if (item.Role) {
          item.Role.forEach((role: PlexRole) => {
            const existing = castCounts.get(role.tag)
            if (existing) {
              existing.count++
            } else {
              castCounts.set(role.tag, { count: 1, movieId: item.ratingKey })
            }
          })
        }
      })

      return Array.from(castCounts.entries())
        .map(([name, data]) => ({ name, count: data.count, movieId: data.movieId }))
        .sort((a, b) => b.count - a.count) as CastStats[]
    },
    libraryId
  )
}

// Add a new hook for fetching cast member details
export const useCastMemberDetails = (castName: string, movieId: string) => {
  return useQuery({
    queryKey: ['castMemberDetails', castName, movieId],
    queryFn: async () => {
      const data = await fetchPlexAPI(`/library/metadata/${movieId}`)
      const roles = data.MediaContainer.Metadata[0].Role || []
      const role = roles.find((r: PlexRole) => r.tag === castName)

      if (!role) {
        throw new Error(`Cast member ${castName} not found in movie ${movieId}`)
      }

      return {
        photo: role.thumb ? `${role.thumb}?width=128&height=128&minSize=1&upscale=1&X-Plex-Token=${PLEX_TOKEN}` : undefined
      }
    },
    enabled: !!castName && !!movieId
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
      const data = await fetchPlexAPI(`/library/sections/${libraryId}/all`)
      const libraryItems = data.MediaContainer.Metadata as PlexMediaItem[]
      const result = await fetchMetadataBatch(libraryItems || [])
      return result.map(item => item.MediaContainer.Metadata[0]);
    },
    enabled: !!libraryId
  })
} 
