import { Group, SegmentedControl, SimpleGrid, Skeleton, Text } from '@mantine/core'
import { useCollection } from '../lib/collection'
import { DIMENSIONS, Dimension, TOP_CAST_OPTIONS, detailPath, useLinkBuilder, useTopCastCount } from '../lib/library'
import { formatNumber, humanizeHours, plural } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { SectionCard, StatCard } from '../components/data/SectionCard'
import { RankedRows, RankedRow } from '../components/data/RankedRows'
import { DecadeBars } from '../components/data/DecadeBars'
import { CardSkeleton, EmptyNote, LibraryNotFound, PlexErrorAlert, RowsSkeleton } from '../components/data/PageStates'
import classes from '../components/data/data.module.css'

const TOP = 10
// Genres sit beside the taller Top cast card; extra rows fill that height with data.
const TOP_GENRES = 15

export const OverviewPage = () => {
  const c = useCollection()
  const link = useLinkBuilder()
  const [topCastCount, setTopCastCount] = useTopCastCount()

  const title = c.library?.name ?? 'Overview'
  const header = <PageHeader title={title} documentTitle={`${title} overview`} />

  if (c.notFound) return <>{header}<LibraryNotFound /></>
  if (c.error) return <>{header}<PlexErrorAlert error={c.error} /></>

  const titleUnit = c.isTv ? 'show' : 'film'
  const personUnit = c.isTv ? 'episode' : 'film'

  const rows = (dimension: Dimension, data: { name: string; count: number }[] | undefined, withPhotos = false, limit = TOP): RankedRow[] =>
    (data ?? []).slice(0, limit).map((d, i) => ({
      ...d,
      rank: i + 1,
      href: link(detailPath(dimension, d.name)),
      photo: withPhotos ? c.photoFor(dimension as 'director' | 'cast', d.name) : undefined,
    }))

  const { director, cast, decade, genre, country } = c.stats
  const maxOf = (data?: { count: number }[]) => data?.[0]?.count ?? 1
  const decadeSpan = decade && decade.length > 0 ? `${decade[0].name}–${decade[decade.length - 1].name}` : null

  if (c.itemsLoading || !c.items) {
    return (
      <>
        {header}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="md">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} h={104} radius="lg" />)}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </SimpleGrid>
        <Text size="sm" c="dimmed" mt="md" role="status">
          Reading {c.library?.name ?? 'the library'} from Plex. Large libraries take a few seconds.
        </Text>
      </>
    )
  }

  if (c.items.length === 0) {
    return <>{header}<EmptyNote>This library has no items yet. Add titles in Plex and reload.</EmptyNote></>
  }

  return (
    <>
      {header}

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="md">
        <StatCard
          label={c.isTv ? 'Shows' : 'Films'}
          value={formatNumber(c.items.length)}
          sub={decadeSpan ? `${decadeSpan} · ${plural(decade!.length, 'decade')}` : undefined}
          to={link(DIMENSIONS.decade.indexPath)}
        />
        <StatCard
          label="Runtime"
          value={c.runtimeHours === undefined ? <Skeleton h={30} w={90} mt={4} /> : `${formatNumber(c.runtimeHours)} h`}
          sub={c.runtimeHours === undefined ? 'Counting episodes…'
            : c.isTv && c.episodeCount ? `${humanizeHours(c.runtimeHours)} · ${plural(c.episodeCount, 'episode')}`
            : humanizeHours(c.runtimeHours)}
        />
        <StatCard
          label="Countries"
          value={formatNumber(country?.length ?? 0)}
          sub={country?.[0] ? <>led by <b>{country[0].name}</b> · {formatNumber(country[0].count)}</> : 'No country tags'}
          to={link(DIMENSIONS.country.indexPath)}
        />
        <StatCard
          label="Directors"
          value={c.peopleLoading ? <Skeleton h={30} w={70} mt={4} /> : formatNumber(director?.length ?? 0)}
          sub={director?.[0] ? <>led by <b>{director[0].name}</b> · {formatNumber(director[0].count)}</> : c.peopleLoading ? 'Reading credits…' : 'No director credits'}
          to={link(DIMENSIONS.director.indexPath)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {(
          <SectionCard
            title="Top directors"
            action={director && director.length > TOP ? { label: `All ${formatNumber(director.length)}`, to: link('/directors') } : undefined}
          >
            {c.peopleLoading ? <RowsSkeleton /> : director && director.length > 0
              ? <RankedRows rows={rows('director', director, true)} max={maxOf(director)} unit={personUnit} avatars />
              : <EmptyNote>Plex has no director credits for this library's {c.isTv ? 'episodes' : 'films'}.</EmptyNote>}
          </SectionCard>
        )}

        <SectionCard title={c.isTv ? 'Shows by decade' : 'Films by decade'} action={decade && decade.length > 0 ? { label: `All ${decade.length}`, to: link('/decades') } : undefined}>
          {decade && decade.length > 0
            ? <DecadeBars data={decade} hrefFor={name => link(detailPath('decade', name))} unit={titleUnit} />
            : <EmptyNote>No release years in this library's metadata.</EmptyNote>}
        </SectionCard>

        <SectionCard
          title="Top cast"
          action={cast && cast.length > TOP ? { label: `All ${formatNumber(cast.length)}`, to: link('/cast') } : undefined}
        >
          {!c.isTv && (
            <Group justify="space-between" gap="xs" mt={-4} mb={10} wrap="wrap">
              <Text size="xs" c="dimmed">
                {topCastCount === 'all'
                  ? 'Counting every credited performer, bit parts included.'
                  : `Counting the top ${topCastCount} billed per film${topCastCount === '3' ? ', as Plex does' : topCastCount === '4' ? ', as Letterboxd does' : ''}.`}
              </Text>
              <SegmentedControl
                size="xs"
                value={topCastCount}
                onChange={setTopCastCount}
                aria-label="Billed cast counted per film"
                data={TOP_CAST_OPTIONS.map(o => ({ value: o.value, label: o.value === 'all' ? 'All' : `Top ${o.value}` }))}
              />
            </Group>
          )}
          {c.isTv && <Text size="xs" c="dimmed" mt={-4} mb={10}>Counted per episode.</Text>}
          {c.peopleLoading ? <RowsSkeleton /> : cast && cast.length > 0
            ? <RankedRows rows={rows('cast', cast, true)} max={maxOf(cast)} unit={personUnit} avatars />
            : <EmptyNote>No cast credits in this library's metadata.</EmptyNote>}
        </SectionCard>

        <SectionCard
          title="Genres"
          action={genre && genre.length > TOP_GENRES ? { label: `All ${formatNumber(genre.length)}`, to: link('/genres') } : undefined}
        >
          {genre && genre.length > 0
            ? <RankedRows rows={rows('genre', genre, false, TOP_GENRES)} max={maxOf(genre)} unit={titleUnit} />
            : <EmptyNote>No genre tags in this library's metadata.</EmptyNote>}
        </SectionCard>

        <SectionCard
          title="Countries"
          action={country && country.length > TOP ? { label: `All ${formatNumber(country.length)}`, to: link('/countries') } : undefined}
          className={classes.wide}
        >
          {country && country.length > 0
            ? (
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={32} verticalSpacing={0}>
                <RankedRows rows={rows('country', country).slice(0, 5)} max={maxOf(country)} unit={titleUnit} />
                <RankedRows rows={rows('country', country).slice(5, 10)} max={maxOf(country)} unit={titleUnit} />
              </SimpleGrid>
            )
            : <EmptyNote>No country tags in this library's metadata.</EmptyNote>}
        </SectionCard>
      </SimpleGrid>
    </>
  )
}
