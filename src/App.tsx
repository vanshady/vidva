import { Routes, Route, useSearchParams } from 'react-router-dom'
import { Container } from '@mantine/core'
import { Header } from './components/layout/Header'
import { CategoryMovies } from './pages/CategoryMovies'
import { PersonMovies } from './pages/PersonMovies'
import { HomePage } from './pages/HomePage'
import { useState } from 'react'

function App() {
  const [searchParams] = useSearchParams()
  const [selectedLibrary, setSelectedLibrary] = useState(searchParams.get('libraryId') || '')

  return (
    <Container size="xl" p="xl" w="100%">
      <Header />
      <Routes>
        <Route path="/" element={
          <HomePage
            selectedLibrary={selectedLibrary}
            onLibraryChange={setSelectedLibrary}
          />
        } />
        <Route
          path="/cast/:name"
          element={
            <PersonMovies
              type="cast"
              libraryId={selectedLibrary}
              topCastCount={searchParams.get('topCastCount')}
            />
          }
        />
        <Route path="/director/:name" element={<PersonMovies type="director" libraryId={selectedLibrary} />} />
        <Route path="/genre/:name" element={<CategoryMovies type="genre" title="Genre" libraryId={selectedLibrary} />} />
        <Route path="/country/:name" element={<CategoryMovies type="country" title="Country" libraryId={selectedLibrary} />} />
        <Route path="/decade/:name" element={<CategoryMovies type="decade" title="Decade" libraryId={selectedLibrary} />} />
      </Routes>
    </Container>
  )
}

export default App
