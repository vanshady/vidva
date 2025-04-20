import { Select } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { fetchPlexAPI } from '../../services/plexService'

interface PlexSection {
  key: string
  title: string
  type: string
  count: number
}

interface LibrarySelectorProps {
  value: string
  onChange: (value: string | null) => void
  onFirstLibrary?: (id: string) => void
}

export const LibrarySelector = ({ value, onChange, onFirstLibrary }: LibrarySelectorProps) => {
  const { data: libraries, isLoading } = useQuery({
    queryKey: ['libraries'],
    queryFn: async () => {
      const data = await fetchPlexAPI('/library/sections')
      const libs = data.MediaContainer.Directory.map((dir: PlexSection) => ({
        value: dir.key,
        label: dir.title
      }))
      if (libs.length > 0 && onFirstLibrary) {
        onFirstLibrary(libs[0].value)
      }
      return libs
    }
  })

  return (
    <Select
      label="Select Library"
      placeholder="Choose a library"
      data={libraries || []}
      value={value}
      onChange={onChange}
      disabled={isLoading}
      w={200}
    />
  )
} 