import { Stack, Group, Select } from '@mantine/core'
import { LibrarySelector } from '../components/layout/LibrarySelector'
import {
  useLibraryItems,
  useLibraryEpisodes,
  usePlexLibraries,
  useGenreStatistics,
  useCountryStatistics,
  useDecadeStatistics,
  useDirectorStatistics,
  useCastStatistics,
  useDirectorDetails,
  useCastMemberDetails,
} from '../services/plexService'
import { BaseStats } from '../components/stats/BaseStats'
import { PersonStats } from '../components/stats/PersonStats'
import { LibraryStats } from '../components/stats/LibraryStats'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

interface HomePageProps {
  selectedLibrary: string
  onLibraryChange: (value: string) => void
}

const VITE_DEFAULT_TOP_CAST_COUNT = import.meta.env.VITE_DEFAULT_TOP_CAST_COUNT;

const isValidTopCastCount = (value: string | undefined): boolean => {
  if (!value) return false;
  if (value === 'all') return true;
  const num = parseInt(value);
  return !isNaN(num) && num > 0;
};

const defaultTopCastCount = isValidTopCastCount(VITE_DEFAULT_TOP_CAST_COUNT)
  ? VITE_DEFAULT_TOP_CAST_COUNT
  : 'all';

export const HomePage = ({ selectedLibrary, onLibraryChange }: HomePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [topCastCount, setTopCastCount] = useState(searchParams.get('topCastCount') || defaultTopCastCount)

  const handleLibraryChange = (value: string) => {
    onLibraryChange(value)
    updateUrlParams(value, topCastCount)
  }

  const handleTopCastCountChange = (value: string) => {
    setTopCastCount(value)
    updateUrlParams(selectedLibrary, value)
  }

  const updateUrlParams = (libraryId: string, castCount: string) => {
    const params = new URLSearchParams()
    if (libraryId) params.set('libraryId', libraryId)
    if (castCount !== defaultTopCastCount) params.set('topCastCount', castCount)
    setSearchParams(params)
  }

  const { data: libraries } = usePlexLibraries()
  const currentLibrary = libraries?.find(lib => lib.id === parseInt(selectedLibrary))
  const isTv = currentLibrary?.type === 'show'

  const { data: libraryItems, isLoading, error } = useLibraryItems(selectedLibrary)
  const { data: libraryEpisodes, isLoading: isLoadingEpisodes } = useLibraryEpisodes(selectedLibrary, currentLibrary?.type)

  // For TV: count cast/crew per-episode, sum duration across episodes.
  // For movies: episodes is undefined and we fall back to libraryItems (movies).
  const personItems = isTv ? libraryEpisodes : libraryItems
  const isLoadingPersonItems = isTv ? isLoadingEpisodes : isLoading

  const { data: genreStats, isLoading: isLoadingGenreStats } = useGenreStatistics(libraryItems, selectedLibrary)
  const { data: countryStats, isLoading: isLoadingCountryStats } = useCountryStatistics(libraryItems, selectedLibrary)
  const { data: decadeStats, isLoading: isLoadingDecadeStats } = useDecadeStatistics(libraryItems, selectedLibrary)
  const { data: directorStats, isLoading: isLoadingDirectorStats } = useDirectorStatistics(personItems, selectedLibrary)
  const { data: castStats, isLoading: isLoadingCastStats } = useCastStatistics(personItems, selectedLibrary, topCastCount)

  const directorsLoading = isLoadingPersonItems || isLoadingDirectorStats
  // For TV libraries, hide the directors section once loading completes if the
  // data is empty — show metadata rarely has directors at the show level, and
  // even episode-level can be sparse.
  const showDirectors = !isTv || directorsLoading || (directorStats && directorStats.length > 0)
  const personCountNoun = isTv ? 'episodes' : 'films'

  return (
    <Stack gap="xl">
      <Group justify="flex-start">
        <LibrarySelector
          value={selectedLibrary}
          onChange={(value) => handleLibraryChange(value || '')}
          onFirstLibrary={(id) => handleLibraryChange(id)}
        />
        <Select
          label="Top # of Casts to Count"
          value={topCastCount}
          onChange={(value) => handleTopCastCountChange(value || 'all')}
          data={[
            { value: 'all', label: 'All Casts' },
            { value: '3', label: 'Top 3 (Plex)' },
            { value: '4', label: 'Top 4 (Letterboxd)' },
            { value: '5', label: 'Top 5' },
            { value: '10', label: 'Top 10' },
          ]}
          w={200}
        />
      </Group>
      <LibraryStats
        items={libraryItems || []}
        libraryId={selectedLibrary}
        isLoading={isLoading || (isTv && isLoadingEpisodes)}
        durationItems={isTv ? libraryEpisodes : undefined}
        itemsLabel={isTv ? 'Total Shows' : 'Total Items'}
      />
      {showDirectors && (
        <PersonStats
          title="Directors"
          type="director"
          data={directorStats}
          isLoading={isLoadingPersonItems || isLoadingDirectorStats}
          error={error}
          useDetails={useDirectorDetails}
          items={personItems || []}
          libraryId={selectedLibrary}
          countNoun={personCountNoun}
        />
      )}
      <PersonStats
        title="Casts"
        type="cast"
        data={castStats}
        isLoading={isLoadingPersonItems || isLoadingCastStats}
        error={error}
        useDetails={useCastMemberDetails}
        items={personItems || []}
        libraryId={selectedLibrary}
        topCastCount={topCastCount}
        countNoun={personCountNoun}
      />
      <BaseStats
        title="Decades"
        type="decade"
        data={decadeStats}
        isLoading={isLoading || isLoadingDecadeStats}
        error={error}
        backgroundColor="rgba(245, 158, 11, 0.5)"
        borderColor="rgb(245, 158, 11)"
        libraryId={selectedLibrary}
        countNoun={isTv ? 'Shows' : 'Films'}
      />
      <BaseStats
        title="Genres"
        type="genre"
        data={genreStats}
        isLoading={isLoading || isLoadingGenreStats}
        error={error}
        backgroundColor="rgba(59, 130, 246, 0.5)"
        borderColor="rgb(59, 130, 246)"
        libraryId={selectedLibrary}
        countNoun={isTv ? 'Shows' : 'Films'}
      />
      <BaseStats
        title="Countries"
        type="country"
        data={countryStats}
        isLoading={isLoading || isLoadingCountryStats}
        error={error}
        backgroundColor="rgba(16, 185, 129, 0.5)"
        borderColor="rgb(16, 185, 129)"
        libraryId={selectedLibrary}
        countNoun={isTv ? 'Shows' : 'Films'}
      />
    </Stack>
  )
} 