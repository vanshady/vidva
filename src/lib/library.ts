import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePlexLibraries } from '../services/plexService'

const ENV_DEFAULT_TOP_CAST = import.meta.env.VITE_DEFAULT_TOP_CAST_COUNT as string | undefined

const isValidTopCastCount = (value: string | null | undefined): value is string => {
  if (!value) return false
  if (value === 'all') return true
  const n = parseInt(value, 10)
  return !isNaN(n) && n > 0
}

// Letterboxd counts the top 4 billed cast; the env var still overrides it.
export const DEFAULT_TOP_CAST_COUNT = isValidTopCastCount(ENV_DEFAULT_TOP_CAST) ? ENV_DEFAULT_TOP_CAST : '4'

export const TOP_CAST_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '3', label: 'Top 3 · Plex' },
  { value: '4', label: 'Top 4 · Letterboxd' },
  { value: '5', label: 'Top 5' },
  { value: '10', label: 'Top 10' },
]

/**
 * Resolves the active library from the URL. A missing `libraryId` falls back
 * to the first movie library (then the first library), so shared links without
 * the param still land somewhere real. An unknown id is reported, not guessed.
 */
export const useActiveLibrary = () => {
  const [searchParams] = useSearchParams()
  const { data: libraries, isLoading, error } = usePlexLibraries()
  const requested = searchParams.get('libraryId')

  const library = useMemo(() => {
    if (!libraries || libraries.length === 0) return undefined
    if (requested) return libraries.find(lib => String(lib.id) === requested)
    return libraries.find(lib => lib.type === 'movie') ?? libraries[0]
  }, [libraries, requested])

  return {
    libraries: libraries ?? [],
    library,
    libraryId: library ? String(library.id) : '',
    isTv: library?.type === 'show',
    isLoading,
    error: error as Error | null,
    notFound: !isLoading && !error && !!requested && !!libraries && !library,
    requestedId: requested,
  }
}

export const useTopCastCount = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('topCastCount')
  const value = isValidTopCastCount(raw) ? raw : DEFAULT_TOP_CAST_COUNT

  const setValue = useCallback((next: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      if (next === DEFAULT_TOP_CAST_COUNT) params.delete('topCastCount')
      else params.set('topCastCount', next)
      return params
    }, { replace: true })
  }, [setSearchParams])

  return [value, setValue] as const
}

/** Builds in-app hrefs that carry the view state (library, cast counting) along. */
export const useLinkBuilder = () => {
  const [searchParams] = useSearchParams()
  const libraryId = searchParams.get('libraryId')
  const topCastCount = searchParams.get('topCastCount')

  return useCallback((path: string) => {
    const params = new URLSearchParams()
    if (libraryId) params.set('libraryId', libraryId)
    if (topCastCount) params.set('topCastCount', topCastCount)
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
  }, [libraryId, topCastCount])
}

export type Dimension = 'director' | 'cast' | 'decade' | 'genre' | 'country'

export const DIMENSIONS: Record<Dimension, { title: string; plural: string; indexPath: string }> = {
  director: { title: 'Director', plural: 'Directors', indexPath: '/directors' },
  cast: { title: 'Cast', plural: 'Cast', indexPath: '/cast' },
  decade: { title: 'Decade', plural: 'Decades', indexPath: '/decades' },
  genre: { title: 'Genre', plural: 'Genres', indexPath: '/genres' },
  country: { title: 'Country', plural: 'Countries', indexPath: '/countries' },
}

export const detailPath = (dimension: Dimension, name: string) =>
  `/${dimension}/${encodeURIComponent(name)}`
