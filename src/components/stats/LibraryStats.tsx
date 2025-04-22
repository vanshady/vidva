import { PlexMediaItemsProps } from '../../types/stats'
import { usePlexLibraries } from '../../services/plexService'
import { Text, Group, Center, Loader } from '@mantine/core'
import { StatsTitle } from '../common/StatsTitle'

interface LibraryStatsProps extends PlexMediaItemsProps {
  libraryId: string
}

export const LibraryStats = ({ items, libraryId }: LibraryStatsProps) => {
  const { data: libraries, isLoading } = usePlexLibraries()
  const currentLibrary = libraries?.find(lib => lib.id === parseInt(libraryId))

  if (isLoading) {
    return (
      <div>
        <StatsTitle title={`${currentLibrary?.name} Overview`} />
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      </div>
    )
  }

  if (currentLibrary == null) {
    return (
      <div>
        <StatsTitle title={`Library Overview`} />
        <Text c="dimmed" ta="center">Library not found</Text>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div>
        <StatsTitle title={`${currentLibrary?.name} Overview`} />
        <Text c="dimmed" ta="center">No items found in library</Text>
      </div>
    )
  }

  const totalItems = items.length
  const totalDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0)
  const totalHours = Math.floor(totalDuration / (1000 * 60))

  return (
    <div>
      <StatsTitle title={`${currentLibrary?.name} Overview`} />
      <Group gap="xs" justify='space-between' maw="800px">
        <Group gap="xs">
          <Text span c="dimmed" size="sm">Total Items:</Text>
          <Text span size="md" fw={500}>{totalItems.toLocaleString()}</Text>
        </Group>
        <Group gap="xs">
          <Text span c="dimmed" size="sm">Total Duration:</Text>
          <Text span size="md" fw={500}>{totalHours.toLocaleString()} hours</Text>
        </Group>
      </Group>
    </div>
  )
} 