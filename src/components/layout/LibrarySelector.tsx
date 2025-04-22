import { Select } from '@mantine/core'
import { usePlexLibraries } from '../../services/plexService'
import { notifications } from '@mantine/notifications'

interface LibrarySelectorProps {
  value: string
  onChange: (value: string | null) => void
  onFirstLibrary?: (id: string) => void
}

export const LibrarySelector = ({ value, onChange, onFirstLibrary }: LibrarySelectorProps) => {
  const { data: libraries, isLoading, error } = usePlexLibraries()

  if (error) {
    notifications.show({
      title: 'Library Loading Error',
      message: `Failed to load libraries: ${error.message}`,
      color: 'red',
      autoClose: 5000
    })
  }

  // Transform libraries data for Select component
  const libraryOptions = libraries?.map(lib => ({
    value: lib.id.toString(),
    label: lib.name
  })) || []

  // Call onFirstLibrary with the first library ID if available
  if (libraryOptions.length > 0 && onFirstLibrary && !value) {
    onFirstLibrary(libraryOptions[0].value)
  }

  return (
    <Select
      label="Select Library"
      placeholder="Choose a library"
      data={libraryOptions}
      value={value}
      onChange={onChange}
      disabled={isLoading || !!error}
      w={200}
    />
  )
} 