import { Anchor, Box, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core'
import { ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLinkBuilder } from '../../lib/library'
import { LibrarySelect } from './LibrarySelect'
import { SearchBox } from './SearchBox'

interface PageHeaderProps {
  title: string
  crumbs?: { label: string; to: string }[]
  description?: ReactNode
  leading?: ReactNode
  /** Browser tab title; defaults to the page title. */
  documentTitle?: string
}

export const PageHeader = ({ title, crumbs, description, leading, documentTitle }: PageHeaderProps) => {
  const link = useLinkBuilder()

  useEffect(() => {
    document.title = `${documentTitle ?? title} · VIDVA`
  }, [documentTitle, title])

  return (
    <Box mb={28}>
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Group gap="md" align="center" wrap="nowrap" style={{ minWidth: 0, flex: '1 1 320px' }}>
          {leading}
          <Stack gap={4} style={{ minWidth: 0 }}>
            {crumbs && crumbs.length > 0 && (
              <Breadcrumbs separatorMargin={6}>
                {crumbs.map(c => (
                  <Anchor key={c.to} component={Link} to={link(c.to)} size="sm" c="dimmed">{c.label}</Anchor>
                ))}
              </Breadcrumbs>
            )}
            <Title order={1}>{title}</Title>
            {description && <Text size="sm" c="dimmed">{description}</Text>}
          </Stack>
        </Group>
        <Group gap="sm" wrap="wrap" w={{ base: '100%', sm: 'auto' }}>
          <SearchBox />
          <LibrarySelect />
        </Group>
      </Group>
    </Box>
  )
}
