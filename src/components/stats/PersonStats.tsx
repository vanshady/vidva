import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlexMediaItemsProps } from '../../types/stats'
import { Text, SimpleGrid, Button, Center, Avatar, Stack, Loader } from '@mantine/core'
import { StatsTitle } from '../common/StatsTitle'
import { useMediaQuery } from '@mantine/hooks'

interface PersonStatsProps extends PlexMediaItemsProps {
  title: string
  type: 'cast' | 'director'
  data?: Array<{
    name: string
    count: number
    movieId?: string
  }>
  isLoading: boolean
  error: Error | null
  useDetails: (name: string, movieId: string) => {
    data?: { photo?: string }
    isLoading: boolean
  }
  libraryId: string
  topCastCount?: string
}

export const PersonStats = ({ title, type, data, isLoading, error, useDetails, libraryId, topCastCount }: PersonStatsProps) => {
  // If > md use 10 or else use 8
  const isAtLeastMd = useMediaQuery('(min-width: 62em)')

  const [visibleCount, setVisibleCount] = useState(10)

  if (isLoading) {
    return (
      <div>
        <StatsTitle title={title} />
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      </div>
    )
  }
  if (error) return <Text c="red">Error loading {title.toLowerCase()}: {error.message}</Text>

  const hasMore = data && data.length > visibleCount
  const getVisibleItems = () => {
    const visibleItems = data?.slice(0, visibleCount) || []
    if (visibleItems.length === 10 && !isAtLeastMd) {
      return visibleItems.slice(0, 8)
    } else {
      return visibleItems
    }
  }
  const loadMore = () => {
    setVisibleCount(prev => prev + 40)
  }

  return (
    <div>
      <StatsTitle title={title} />
      <SimpleGrid cols={{ base: 2, sm: 4, md: 5 }} spacing="sm" verticalSpacing="lg">
        {getVisibleItems().map((item) => (
          <PersonItem
            key={item.name}
            name={item.name}
            count={item.count}
            movieId={item.movieId}
            useDetails={useDetails}
            type={type}
            libraryId={libraryId}
            topCastCount={type === 'cast' ? topCastCount : undefined}
          />
        ))}
      </SimpleGrid>
      {hasMore && (
        <Center mt="xl">
          <Button onClick={loadMore} variant="filled">
            See More {title} ({data.length - visibleCount} more)
          </Button>
        </Center>
      )}
    </div>
  )
}

interface PersonItemProps {
  name: string
  count: number
  movieId?: string
  type: 'cast' | 'director'
  useDetails: (name: string, movieId: string) => {
    data?: { photo?: string }
    isLoading: boolean
  }
  libraryId: string
  topCastCount?: string
}

const PersonItem = ({ name, count, movieId, useDetails, type, libraryId }: PersonItemProps) => {
  const navigate = useNavigate()
  const { data: details } = useDetails(name, movieId || '')

  const handleClick = () => {
    const url = `/${type}/${encodeURIComponent(name)}?libraryId=${libraryId}`
    navigate(url)
  }

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <Stack align="center" gap="xs">
        <Avatar
          size={120}
          radius="120"
          name={name}
          src={details?.photo}
          alt={name}
        />
        <Text fw={500}>{name}</Text>
        <Text size="sm" c="dimmed">{count} films</Text>
      </Stack>
    </div>
  )
} 