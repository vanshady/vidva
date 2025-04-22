import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PlexMediaItem, fetchPlexAPI, PLEX_SERVER_ID, PLEX_SERVER_URL, PLEX_TOKEN } from '../services/plexService'
import { Container, SimpleGrid, Paper, Image, Stack, Group, Button, Center, Loader, Text, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

interface CategoryMoviesProps {
  type: 'genre' | 'country' | 'decade'
  title: string
}

export const CategoryMovies = ({ type, title }: CategoryMoviesProps) => {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()

  const { data: movies = [], isLoading, error } = useQuery<PlexMediaItem[]>({
    queryKey: ['categoryMovies', type, name],
    queryFn: async () => {
      const data = await fetchPlexAPI(`/library/sections/${1}/all`)
      const allMovies = data.MediaContainer.Metadata as PlexMediaItem[]

      return allMovies.filter(movie => {
        if (!name) return false
        if (type === 'genre') {
          return movie.Genre?.some(genre => genre.tag === name)
        } else if (type === 'country') {
          return movie.Country?.some(country => country.tag === name)
        } else {
          // For decade, we need to check the year
          const movieYear = Number(movie.year)
          const movieDecade = Math.floor(movieYear / 10) * 10
          const targetDecade = Number(name.replace('s', '')) // Remove 's' suffix before converting to number
          return movieDecade === targetDecade
        }
      })
    },
  })

  if (error) {
    notifications.show({
      title: 'Movies Loading Error',
      message: `Failed to load ${type} movies: ${error.message}`,
      color: 'red',
      autoClose: 5000
    })
  }

  if (isLoading) {
    return (
      <Container size="xl">
        <Group mb="xl">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Stack gap={0}>
            <Title order={3}>{title}: {name}</Title>
            <Text size="sm" c="dimmed">{movies?.length || 0} films</Text>
          </Stack>
        </Group>
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl">
        <Group mb="xl">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Stack gap={0}>
            <Title order={3}>{title}: {name}</Title>
            <Text size="sm" c="dimmed">{movies?.length || 0} films</Text>
          </Stack>
        </Group>
        <Center h={200}>
          <Text c="red" ta="center">{error.message}</Text>
        </Center>
      </Container>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <Container size="xl">
        <Group mb="xl">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Stack gap={0}>
            <Title order={3}>{title}: {name}</Title>
            <Text size="sm" c="dimmed">{movies?.length || 0} films</Text>
          </Stack>
        </Group>
        <Text c="dimmed" ta="center">No films found in this {type}</Text>
      </Container>
    )
  }

  return (
    <Container size="xl">
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Stack gap={0}>
          <Title order={3}>{title}: {name}</Title>
          <Text size="sm" c="dimmed">{movies?.length || 0} films</Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4, md: 5, lg: 6 }} spacing="md">
        {movies.map((movie) => (
          <Paper
            key={movie.ratingKey}
            p="md"
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(`https://app.plex.tv/desktop/#!/server/${PLEX_SERVER_ID}/details?key=%2Flibrary%2Fmetadata%2F${movie.ratingKey}`, '_blank')}
          >
            <Stack gap="xs">
              <Image
                src={`${PLEX_SERVER_URL}${movie.thumb}?X-Plex-Token=${PLEX_TOKEN}`}
                fallbackSrc="https://placehold.co/400x600?text=No+Poster"
                height={300}
                radius="md"
                alt={movie.title}
              />
              <Text fw={500} size="sm" ta="center">{movie.title}</Text>
              {movie.year && (
                <Text size="xs" c="dimmed" ta="center">{movie.year}</Text>
              )}
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Container>
  )
} 