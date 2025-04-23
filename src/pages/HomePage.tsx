import { Stack, Group } from '@mantine/core'
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

interface HomePageProps {
  selectedLibrary: string
  onLibraryChange: (value: string) => void
}

export const HomePage = ({ selectedLibrary, onLibraryChange }: HomePageProps) => {
  const { data: libraryItems, isLoading, error } = useLibraryItems(selectedLibrary)

  const { data: genreStats, isLoading: isLoadingGenreStats } = useGenreStatistics(libraryItems, selectedLibrary)
  const { data: countryStats, isLoading: isLoadingCountryStats } = useCountryStatistics(libraryItems, selectedLibrary)
  const { data: decadeStats, isLoading: isLoadingDecadeStats } = useDecadeStatistics(libraryItems, selectedLibrary)
  const { data: directorStats, isLoading: isLoadingDirectorStats } = useDirectorStatistics(libraryItems, selectedLibrary)
  const { data: castStats, isLoading: isLoadingCastStats } = useCastStatistics(libraryItems, selectedLibrary)

  return (
    <Stack gap="xl">
      <Group justify="flex-start">
        <LibrarySelector
          value={selectedLibrary}
          onChange={(value) => onLibraryChange(value || '')}
          onFirstLibrary={(id) => onLibraryChange(id)}
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