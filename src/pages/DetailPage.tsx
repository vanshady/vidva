import { Anchor, Avatar, Group, SegmentedControl, Skeleton, Text } from '@mantine/core'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { runtimeFor, titlesFor, useCollection } from '../lib/collection'
import { DIMENSIONS, Dimension, useLinkBuilder } from '../lib/library'
import { formatNumber, plural, yearSpan } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { PosterGrid } from '../components/data/PosterGrid'
import { EmptyNote, LibraryNotFound, PlexErrorAlert } from '../components/data/PageStates'
import classes from '../components/data/data.module.css'

type Sort = 'year' | 'title'

export const DetailPage = ({ dimension }: { dimension: Dimension }) => {
  const { name = '' } = useParams<{ name: string }>()
  const c = useCollection()
  const link = useLinkBuilder()
  const [sort, setSort] = useState<Sort>('year')
  const meta = DIMENSIONS[dimension]
  const isPerson = dimension === 'director' || dimension === 'cast'
  const loading = isPerson ? c.peopleLoading : c.itemsLoading

  const titles = useMemo(() => (loading ? [] : titlesFor(c, dimension, name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, c.items, c.personItems, c.isTv, dimension, name])

  const sorted = useMemo(() => [...titles].sort((a, b) =>
    sort === 'title'
      ? a.title.localeCompare(b.title)
      : (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title)), [titles, sort])

  const unit = c.isTv ? 'show' : 'film'
  const span = yearSpan(titles.map(t => t.year))
  const runtime = runtimeFor(c, dimension, name, titles)
  const description = loading ? undefined : [
    plural(titles.length, unit),
    runtime.episodes !== undefined ? plural(runtime.episodes, 'episode') : null,
    span,
    runtime.hours ? `${formatNumber(runtime.hours)} h` : null,
  ].filter(Boolean).join(' · ')

  const photo = isPerson ? c.photoFor(dimension as 'director' | 'cast', name) : undefined
  const header = (
    <PageHeader
      title={name}
      documentTitle={`${name}${description ? ` · ${plural(titles.length, unit)}` : ''}`}
      crumbs={[{ label: meta.plural, to: meta.indexPath }]}
      description={description}
      leading={isPerson && <Avatar src={photo} name={name} color="initials" size={64} radius="xl" />}
    />
  )

  if (c.notFound) return <>{header}<LibraryNotFound /></>
  if (c.error) return <>{header}<PlexErrorAlert error={c.error} /></>

  if (loading) {
    return (
      <>
        {header}
        <div className={classes.posters} aria-busy="true" aria-label="Loading titles">
          {Array.from({ length: 12 }, (_, i) => <Skeleton key={i} radius="md" style={{ aspectRatio: '2 / 3' }} />)}
        </div>
      </>
    )
  }

  if (titles.length === 0) {
    return (
      <>
        {header}
        <EmptyNote>
          Nothing in {c.library?.name ?? 'this library'} is credited to “{name}”.{' '}
          <Anchor component={Link} to={link(meta.indexPath)}>Browse all {meta.plural.toLowerCase()}</Anchor>
        </EmptyNote>
      </>
    )
  }

  return (
    <>
      {header}
      <Group justify="space-between" mb="md" gap="sm">
        <Text size="sm" c="dimmed">
          {dimension === 'cast' && c.topCastCount !== 'all' && !c.isTv
            ? 'Every appearance, whatever the billing.'
            : `Posters open in Plex.`}
        </Text>
        <SegmentedControl
          size="xs"
          value={sort}
          onChange={v => setSort(v as Sort)}
          aria-label="Sort titles"
          data={[{ value: 'year', label: 'By year' }, { value: 'title', label: 'A–Z' }]}
        />
      </Group>
      <PosterGrid items={sorted} />
    </>
  )
}
