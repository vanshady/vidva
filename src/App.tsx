import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { OverviewPage } from './pages/OverviewPage'
import { IndexPage } from './pages/IndexPage'
import { DetailPage } from './pages/DetailPage'
import { NotFoundPage } from './pages/NotFoundPage'

// New pages start at the top; browser back/forward keeps its own restoration.
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Old pre-1.3 links used ?castsVisibleCount / ?directorsVisibleCount on the
// dashboard; they still resolve because the overview ignores unknown params.
function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/directors" element={<IndexPage key="director" dimension="director" />} />
        <Route path="/cast" element={<IndexPage key="cast" dimension="cast" />} />
        <Route path="/decades" element={<IndexPage key="decade" dimension="decade" />} />
        <Route path="/genres" element={<IndexPage key="genre" dimension="genre" />} />
        <Route path="/countries" element={<IndexPage key="country" dimension="country" />} />
        <Route path="/director/:name" element={<DetailPage key="director" dimension="director" />} />
        <Route path="/cast/:name" element={<DetailPage key="cast" dimension="cast" />} />
        <Route path="/decade/:name" element={<DetailPage key="decade" dimension="decade" />} />
        <Route path="/genre/:name" element={<DetailPage key="genre" dimension="genre" />} />
        <Route path="/country/:name" element={<DetailPage key="country" dimension="country" />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
