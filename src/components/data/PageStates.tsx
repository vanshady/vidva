import { Alert, Anchor, Button, Group, Skeleton, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { PlexError } from '../../services/plexService'
import { useActiveLibrary } from '../../lib/library'
import classes from './data.module.css'

/** One alert per failure, with the recovery the user can actually take. */
export const PlexErrorAlert = ({ error }: { error: Error }) => {
  const network = error instanceof PlexError && error.kind === 'network'
  const unauthorized = error instanceof PlexError && error.status === 401
  return (
    <Alert
      color="red"
      variant="light"
      icon={<IconAlertTriangle size={18} />}
      title={network ? 'Plex server unreachable' : unauthorized ? 'Plex rejected the token' : 'Plex returned an error'}
      mb="lg"
    >
      <Stack gap="xs">
        <Text size="sm">{error.message}</Text>
        <Text size="sm" c="dimmed">
          {network
            ? 'Check that the server is running and that this container has the right Plex server URL.'
            : unauthorized
              ? 'Check the PLEX_TOKEN this container was started with.'
              : 'The library may have been removed, or the token may lack access to it.'}
        </Text>
        <Group gap="xs">
          <Button size="xs" variant="default" onClick={() => window.location.reload()}>Try again</Button>
        </Group>
      </Stack>
    </Alert>
  )
}

export const LibraryNotFound = () => {
  const { requestedId, libraries } = useActiveLibrary()
  const fallback = libraries.find(l => l.type === 'movie') ?? libraries[0]
  return (
    <Alert color="vidva" variant="light" icon={<IconAlertTriangle size={18} />} title={`Library ${requestedId} isn't on this Plex server`} mb="lg">
      <Text size="sm" mb="xs">The link may come from another server, or the library was removed.</Text>
      {fallback && (
        <Anchor component={Link} to={`/?libraryId=${fallback.id}`} size="sm" fw={500}>Go to {fallback.name}</Anchor>
      )}
    </Alert>
  )
}

export const RowsSkeleton = ({ rows = 10 }: { rows?: number }) => (
  <Stack gap={0} aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }, (_, i) => (
      <Group key={i} gap={14} h={56} wrap="nowrap">
        <Skeleton h={44} w={44} circle />
        <Skeleton h={12} w={`${60 - (i % 4) * 8}%`} radius="sm" />
      </Group>
    ))}
  </Stack>
)

export const CardSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className={classes.card} aria-busy="true" aria-label="Loading">
    <Skeleton h={14} w="30%" mb={22} radius="sm" />
    <Stack gap={14}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={14} w={`${90 - i * 6}%`} radius="sm" />
      ))}
    </Stack>
  </div>
)

export const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <Text size="sm" c="dimmed" py="lg" ta="center">{children}</Text>
)
