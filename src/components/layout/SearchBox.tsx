import { Combobox, Group, Kbd, Text, TextInput, useCombobox } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../../lib/collection'
import { detailPath, useLinkBuilder } from '../../lib/library'
import { formatNumber, searchKey } from '../../lib/format'

const PER_GROUP = 6

interface Entry {
  id: string
  dimension: 'director' | 'cast'
  name: string
  count: number
  key: string
}

export const SearchBox = () => {
  const collection = useCollection()
  const navigate = useNavigate()
  const link = useLinkBuilder()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() })

  useHotkeys([['/', () => inputRef.current?.focus()]])

  const index = useMemo<Entry[]>(() => {
    const out: Entry[] = []
    collection.stats.director?.forEach(d => out.push({ id: `director:${d.name}`, dimension: 'director', name: d.name, count: d.count, key: searchKey(d.name) }))
    collection.stats.allCast?.forEach(c => out.push({ id: `cast:${c.name}`, dimension: 'cast', name: c.name, count: c.count, key: searchKey(c.name) }))
    return out
  }, [collection.stats.director, collection.stats.allCast])

  const results = useMemo(() => {
    const q = searchKey(query.trim())
    if (!q) return { director: [], cast: [] }
    const pick = (dimension: Entry['dimension']) =>
      index
        .filter(e => e.dimension === dimension && e.key.includes(q))
        .sort((a, b) => Number(b.key.startsWith(q)) - Number(a.key.startsWith(q)) || b.count - a.count)
        .slice(0, PER_GROUP)
    return { director: pick('director'), cast: pick('cast') }
  }, [index, query])

  const unit = collection.isTv ? 'episode' : 'film'
  const total = (collection.stats.director?.length ?? 0) + (collection.stats.allCast?.length ?? 0)
  const empty = query.trim() && results.director.length === 0 && results.cast.length === 0

  const go = (id: string) => {
    const [dimension, ...rest] = id.split(':')
    setQuery('')
    combobox.closeDropdown()
    inputRef.current?.blur()
    navigate(link(detailPath(dimension as Entry['dimension'], rest.join(':'))))
  }

  const group = (label: string, entries: Entry[]) =>
    entries.length > 0 && (
      <Combobox.Group label={label}>
        {entries.map(e => (
          <Combobox.Option value={e.id} key={e.id}>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Text size="sm" truncate>{e.name}</Text>
              <Text size="xs" c="dimmed" style={{ flex: 'none' }}>{formatNumber(e.count)} {unit}{e.count === 1 ? '' : 's'}</Text>
            </Group>
          </Combobox.Option>
        ))}
      </Combobox.Group>
    )

  return (
    <Combobox store={combobox} onOptionSubmit={go} width="target" position="bottom-start">
      <Combobox.Target>
        <TextInput
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.currentTarget.value); combobox.openDropdown(); combobox.updateSelectedOptionIndex() }}
          onFocus={() => query && combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          placeholder={collection.peopleLoading ? 'Loading people…' : total > 0 ? `Search ${formatNumber(total)} directors and cast` : 'Search directors and cast'}
          aria-label="Search directors and cast"
          leftSection={<IconSearch size={16} stroke={1.6} />}
          rightSection={<Kbd size="xs">/</Kbd>}
          rightSectionPointerEvents="none"
          w={{ base: '100%', sm: 320 }}
        />
      </Combobox.Target>
      <Combobox.Dropdown hidden={!query.trim()}>
        <Combobox.Options mah={420} style={{ overflowY: 'auto' }}>
          {group('Directors', results.director)}
          {group('Cast', results.cast)}
          {empty && <Combobox.Empty>No director or cast member matches “{query.trim()}”</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
