import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container, Stack, Group } from '@mantine/core'
import { Header } from './components/layout/Header'
import { LibrarySelector } from './components/layout/LibrarySelector'
import { CategoryMovies } from './pages/CategoryMovies'
import { PersonMovies } from './pages/PersonMovies'
import {
  useLibraryItems,
  useGenreStatistics,
  useCountryStatistics,
  useDecadeStatistics,
  useDirectorStatistics,
  useCastStatistics,
  useDirectorDetails,
  useCastMemberDetails
} from './services/plexService'
import { BaseStats } from './components/stats/BaseStats'
import { PersonStats } from './components/stats/PersonStats'
import { LibraryStats } from './components/stats/LibraryStats'
import { useState } from 'react'

function App() {
  const [selectedLibrary, setSelectedLibrary] = useState('')
  const { data: libraryItems, isLoading, error } = useLibraryItems(selectedLibrary)

  const { data: genreStats } = useGenreStatistics(libraryItems, selectedLibrary)
  const { data: countryStats } = useCountryStatistics(libraryItems, selectedLibrary)
  const { data: decadeStats } = useDecadeStatistics(libraryItems, selectedLibrary)
  const { data: directorStats } = useDirectorStatistics(libraryItems, selectedLibrary)
  const { data: castStats } = useCastStatistics(libraryItems, selectedLibrary)

  return (
    <Router>
      <Container size="xl" p="xl" w="100%">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <Stack gap="xl">
                <Group justify="flex-start">
                  <LibrarySelector
                    value={selectedLibrary}
                    onChange={(value) => setSelectedLibrary(value || '')}
                    onFirstLibrary={(id) => setSelectedLibrary(id)}
                  />
                </Group>
                <LibraryStats
                  items={libraryItems || []}
                  libraryId={selectedLibrary}
                />
                <PersonStats
                  title="Directors"
                  type="director"
                  data={directorStats}
                  isLoading={isLoading}
                  error={error}
                  useDetails={useDirectorDetails}
                  items={libraryItems || []}
                />
                <PersonStats
                  title="Casts"
                  type="cast"
                  data={castStats}
                  isLoading={isLoading}
                  error={error}
                  useDetails={useCastMemberDetails}
                  items={libraryItems || []}
                />
                <BaseStats
                  title="Decades"
                  type="decade"
                  data={decadeStats}
                  isLoading={isLoading}
                  error={error}
                  backgroundColor="rgba(245, 158, 11, 0.5)"
                  borderColor="rgb(245, 158, 11)"
                  libraryId={selectedLibrary}
                />
                <BaseStats
                  title="Genres"
                  type="genre"
                  data={genreStats}
                  isLoading={isLoading}
                  error={error}
                  backgroundColor="rgba(59, 130, 246, 0.5)"
                  borderColor="rgb(59, 130, 246)"
                  libraryId={selectedLibrary}
                />
                <BaseStats
                  title="Countries"
                  type="country"
                  data={countryStats}
                  isLoading={isLoading}
                  error={error}
                  backgroundColor="rgba(16, 185, 129, 0.5)"
                  borderColor="rgb(16, 185, 129)"
                  libraryId={selectedLibrary}
                />
              </Stack>
            }
          />
          <Route path="/cast/:name" element={<PersonMovies type="cast" />} />
          <Route path="/director/:name" element={<PersonMovies type="director" />} />
          <Route path="/genre/:name" element={<CategoryMovies type="genre" title="Genre" />} />
          <Route path="/country/:name" element={<CategoryMovies type="country" title="Country" />} />
          <Route path="/decade/:name" element={<CategoryMovies type="decade" title="Decade" />} />
        </Routes>
      </Container>
    </Router>
  )
}

export default App
