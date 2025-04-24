import { Stack, Group, Select } from '@mantine/core'
import { LibrarySelector } from '../components/layout/LibrarySelector'
import {
  useLibraryItems,
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
const defaultTopCastCount = (VITE_DEFAULT_TOP_CAST_COUNT == null || VITE_DEFAULT_TOP_CAST_COUNT.length == 0 || VITE_DEFAULT_TOP_CAST_COUNT === 'DEFAULT_TOP_CAST_COUNT') ? 'all' : VITE_DEFAULT_TOP_CAST_COUNT;

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

  const { data: libraryItems, isLoading, error } = useLibraryItems(selectedLibrary)

  const { data: genreStats, isLoading: isLoadingGenreStats } = useGenreStatistics(libraryItems, selectedLibrary)
  const { data: countryStats, isLoading: isLoadingCountryStats } = useCountryStatistics(libraryItems, selectedLibrary)
  const { data: decadeStats, isLoading: isLoadingDecadeStats } = useDecadeStatistics(libraryItems, selectedLibrary)
  const { data: directorStats, isLoading: isLoadingDirectorStats } = useDirectorStatistics(libraryItems, selectedLibrary)
  const { data: castStats, isLoading: isLoadingCastStats } = useCastStatistics(libraryItems, selectedLibrary, topCastCount)

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
        isLoading={isLoading}
      />
      <PersonStats
        title="Directors"
        type="director"
        data={directorStats}
        isLoading={isLoading || isLoadingDirectorStats}
        error={error}
        useDetails={useDirectorDetails}
        items={libraryItems || []}
        libraryId={selectedLibrary}
      />
      <PersonStats
        title="Casts"
        type="cast"
        data={castStats}
        isLoading={isLoading || isLoadingCastStats}
        error={error}
        useDetails={useCastMemberDetails}
        items={libraryItems || []}
        libraryId={selectedLibrary}
        topCastCount={topCastCount}
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
      />
    </Stack>
  )
} 