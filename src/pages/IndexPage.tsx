import { Button, Center, Group, SegmentedControl, Text, TextInput } from '@mantine/core'
import { IconFilter } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { useCollection } from '../lib/collection'
import { DIMENSIONS, Dimension, TOP_CAST_OPTIONS, detailPath, useLinkBuilder, useTopCastCount } from '../lib/library'
import { formatNumber, plural, searchKey } from '../lib/format'
import { PageHeader } from '../components/layout/PageHeader'
import { SectionCard } from '../components/data/SectionCard'
import { RankedRows } from '../components/data/RankedRows'
import { DecadeBars } from '../components/data/DecadeBars'
import { CardSkeleton, EmptyNote, LibraryNotFound, PlexErrorAlert } from '../components/data/PageStates'

const PAGE = 100

type Sort = 'count' | 'name' | 'year'

export const IndexPage = ({ dimension }: { dimension: Dimension }) => {
  const c = useCollection()
  const link = useLinkBuilder()
  const [topCastCount, setTopCastCount] = useTopCastCount()
  const meta = DIMENSIONS[dimension]
  const isPerson = dimension === 'director' || dimension === 'cast'

  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<Sort>(dimension === 'decade' ? 'year' : 'count')
  const [visible, setVisible] = useState(PAGE)

  const data = c.stats[dimension]
  const ranked = useMemo(() => {
    if (!data) return []
    // Rank always follows title count, whatever the display order.
    const byCount = [...data].sort((a, b) => b.count - a.count)
    const rankOf = new Map(byCount.map((d, i) => [d.name, i + 1]))
    const q = searchKey(filter.trim())
    const matched = data.filter(d => !q || searchKey(d.name).includes(q))
    const ordered =
      sort === 'name' ? [...matched].sort((a, b) => a.name.localeCompare(b.name))
        : sort === 'year' ? [...matched].sort((a, b) => parseInt(a.name) - parseInt(b.name))
          : [...matched].sort((a, b) => b.count - a.count)
    return ordered.map(d => ({ ...d, rank: sort === 'count' ? rankOf.get(d.name) : undefined }))
  }, [data, filter, sort])

  const titleUnit = c.isTv ? 'show' : 'film'
  const unit = isPerson && c.isTv ? 'episode' : titleUnit
  const loading = isPerson ? c.peopleLoading : c.itemsLoading
  const header = (
    <PageHeader
      title={meta.plural}
      description={data && !loading
        ? `${plural(data.length, dimension === 'cast' ? 'cast member' : meta.title.toLowerCase(), dimension === 'country' ? 'countries' : dimension === 'cast' ? 'cast members' : undefined)} across ${plural(c.items?.length ?? 0, titleUnit)}${c.isTv && isPerson ? ', counted per episode' : ''}`
        : undefined}
    />
  )

  if (c.notFound) return <>{header}<LibraryNotFound /></>
  if (c.error) return <>{header}<PlexErrorAlert error={c.error} /></>
  if (loading || !data) return <>{header}<CardSkeleton rows={12} /></>

  const max = Math.max(1, ...data.map(d => d.count))
  const shown = ranked.slice(0, visible)
  const sortOptions = dimension === 'decade'
    ? [{ value: 'year', label: 'By year' }, { value: 'count', label: `Most ${unit}s` }]
    : [{ value: 'count', label: `Most ${unit}s` }, { value: 'name', label: 'A–Z' }]

  return (
    <>
      {header}

      {dimension === 'decade' && data.length > 0 && (
        <SectionCard title={c.isTv ? 'Shows by decade' : 'Films by decade'} className="" >
          <DecadeBars data={[...data].sort((a, b) => parseInt(a.name) - parseInt(b.name))} hrefFor={n => link(detailPath('decade', n))} unit={titleUnit} />
        </SectionCard>
      )}

      <Group gap="sm" my="md" wrap="wrap">
        {dimension !== 'decade' && (
          <TextInput
            value={filter}
            onChange={e => { setFilter(e.currentTarget.value); setVisible(PAGE) }}
            placeholder={`Filter ${formatNumber(data.length)} ${meta.plural.toLowerCase()}`}
            aria-label={`Filter ${meta.plural.toLowerCase()}`}
            leftSection={<IconFilter size={16} stroke={1.6} />}
            w={{ base: '100%', sm: 280 }}
          />
        )}
        <SegmentedControl value={sort} onChange={v => setSort(v as Sort)} data={sortOptions} aria-label="Sort order" />
        {dimension === 'cast' && !c.isTv && (
          <Group gap={8} ml={{ sm: 'auto' }}>
            <Text size="sm" c="dimmed">Count</Text>
            <SegmentedControl
              value={topCastCount}
              onChange={setTopCastCount}
              aria-label="Billed cast counted per film"
              data={TOP_CAST_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />
          </Group>
        )}
      </Group>

      <SectionCard title={filter.trim() ? `${formatNumber(ranked.length)} matching` : `All ${meta.plural.toLowerCase()}`}>
        {shown.length > 0
          ? (
            <RankedRows
              rows={shown.map(d => ({
                ...d,
                href: link(detailPath(dimension, d.name)),
                photo: isPerson ? c.photoFor(dimension as 'director' | 'cast', d.name) : undefined,
              }))}
              max={max}
              unit={unit}
              avatars={isPerson}
            />
          )
          : <EmptyNote>{filter.trim() ? `Nothing in ${meta.plural.toLowerCase()} matches “${filter.trim()}”.` : `No ${meta.plural.toLowerCase()} in this library's metadata.`}</EmptyNote>}
        {ranked.length > visible && (
          <Center mt="md">
            <Button variant="default" onClick={() => setVisible(v => v + PAGE)}>
              Show {formatNumber(Math.min(PAGE, ranked.length - visible))} more · {formatNumber(ranked.length - visible)} left
            </Button>
          </Center>
        )}
      </SectionCard>
    </>
  )
}
