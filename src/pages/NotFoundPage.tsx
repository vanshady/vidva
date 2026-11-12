import { Anchor, Text } from '@mantine/core'
import { Link, useLocation } from 'react-router-dom'
import { useLinkBuilder } from '../lib/library'
import { PageHeader } from '../components/layout/PageHeader'

export const NotFoundPage = () => {
  const { pathname } = useLocation()
  const link = useLinkBuilder()
  return (
    <>
      <PageHeader title="Page not found" />
      <Text size="sm" c="dimmed" mb="xs">Nothing lives at <code>{pathname}</code>.</Text>
      <Anchor component={Link} to={link('/')} size="sm" fw={500}>Back to the overview</Anchor>
    </>
  )
}
