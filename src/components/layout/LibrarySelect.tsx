import { Select } from '@mantine/core'
import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useActiveLibrary } from '../../lib/library'

// Detail pages name one person or category; after switching library they may
// not exist, so a switch from a detail page lands on that dimension's index.
const DETAIL_TO_INDEX: Record<string, string> = {
  director: '/directors',
  cast: '/cast',
  genre: '/genres',
  country: '/countries',
  decade: '/decades',
}

export const LibrarySelect = () => {
  const { libraries, libraryId, isLoading } = useActiveLibrary()
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const data = useMemo(() => {
    const groups = [
      { group: 'Movies', items: libraries.filter(l => l.type === 'movie') },
      { group: 'TV', items: libraries.filter(l => l.type === 'show') },
    ]
    return groups
      .filter(g => g.items.length > 0)
      .map(g => ({
        group: g.group,
        items: g.items.map(l => ({
          value: String(l.id),
          label: l.name,
        })),
      }))
  }, [libraries])

  const onChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams)
    params.set('libraryId', value)
    params.delete('castsVisibleCount')
    params.delete('directorsVisibleCount')
    const segment = pathname.split('/')[1]
    const target = DETAIL_TO_INDEX[segment] && pathname.split('/').length > 2 ? DETAIL_TO_INDEX[segment] : pathname
    navigate(`${target}?${params.toString()}`)
  }

  return (
    <Select
      aria-label="Plex library"
      data={data}
      value={libraryId || null}
      onChange={onChange}
      disabled={isLoading || libraries.length === 0}
      placeholder={isLoading ? 'Loading libraries…' : 'Choose a library'}
      allowDeselect={false}
      checkIconPosition="right"
      w={{ base: '100%', sm: 220 }}
      comboboxProps={{ width: 260, position: 'bottom-end' }}
    />
  )
}
