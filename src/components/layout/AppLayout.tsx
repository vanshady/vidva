import { AppShell, Box, Group, Image, NavLink, ScrollArea, Text, UnstyledButton } from '@mantine/core'
import {
  IconCalendar,
  IconLayoutDashboard,
  IconMovie,
  IconTags,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react'
import { ReactNode, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLinkBuilder } from '../../lib/library'
import { useCollection } from '../../lib/collection'
import { plural } from '../../lib/format'
import classes from './AppLayout.module.css'

const NAV = [
  { path: '/', label: 'Overview', icon: IconLayoutDashboard, match: (p: string) => p === '/' },
  { path: '/directors', label: 'Directors', icon: IconMovie, match: (p: string) => p.startsWith('/director') },
  { path: '/cast', label: 'Cast', icon: IconUsers, match: (p: string) => p.startsWith('/cast') },
  { path: '/decades', label: 'Decades', icon: IconCalendar, match: (p: string) => p.startsWith('/decade') },
  { path: '/genres', label: 'Genres', icon: IconTags, match: (p: string) => p.startsWith('/genre') },
  { path: '/countries', label: 'Countries', icon: IconWorld, match: (p: string) => p.startsWith('/countr') },
]

const Logo = () => {
  const link = useLinkBuilder()
  return (
    <UnstyledButton component={Link} to={link('/')} className={classes.logo} aria-label="VIDVA overview">
      <Image src="/logo.png" alt="" w={26} h={26} />
      <span>VIDVA</span>
    </UnstyledButton>
  )
}

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation()
  const link = useLinkBuilder()
  const { library, items, isTv } = useCollection()
  const tabsRef = useRef<HTMLElement>(null)

  // A deep link to /countries should show its own tab, not leave it off-screen.
  useEffect(() => {
    tabsRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [pathname])

  return (
    <AppShell
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: true } }}
      header={{ height: { base: 104, sm: 0 } }}
      padding={0}
    >
      <AppShell.Header hiddenFrom="sm" className={classes.mobileHeader}>
        <Group px="md" h={52}><Logo /></Group>
        <ScrollArea type="never" className={classes.tabScroll}>
          <nav aria-label="Sections" className={classes.tabs} ref={tabsRef}>
            {NAV.map(item => (
              <Link
                key={item.path}
                to={link(item.path)}
                className={classes.tab}
                data-active={item.match(pathname) || undefined}
                aria-current={item.match(pathname) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar} p="sm">
        <Box px="xs" py="sm" mb="md"><Logo /></Box>
        <nav aria-label="Sections">
          {NAV.map(item => (
            <NavLink
              key={item.path}
              component={Link}
              to={link(item.path)}
              label={item.label}
              leftSection={<item.icon size={18} stroke={1.6} />}
              active={item.match(pathname)}
              aria-current={item.match(pathname) ? 'page' : undefined}
              className={classes.navLink}
            />
          ))}
        </nav>
        {library && (
          <Box className={classes.navFooter}>
            <Text size="xs" c="dimmed">Plex library</Text>
            <Text size="sm" fw={500} truncate>{library.name}</Text>
            {items && <Text size="xs" c="dimmed">{plural(items.length, isTv ? 'show' : 'film')}</Text>}
          </Box>
        )}
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <div className={classes.content}>{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
