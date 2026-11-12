import { createTheme, MantineColorsTuple, rem } from '@mantine/core'

// Logo orange (#F2762E) as the single accent. Index 5 is the brand value used
// for bars, links, focus rings and selection.
const vidva: MantineColorsTuple = [
  '#fff1e8',
  '#ffe0cf',
  '#fdbf9d',
  '#f99c68',
  '#f6813f',
  '#f2762e',
  '#e5641a',
  '#c9550f',
  '#b34a0a',
  '#9c3d02',
]

// Neutral ramp tuned to the dashboard surfaces: body #111318, cards #1C1F26,
// borders #2A2E37, ink #E5E7EB, muted #9CA3AF.
const dark: MantineColorsTuple = [
  '#E5E7EB',
  '#C9CDD4',
  '#9CA3AF',
  '#6B7280',
  '#2A2E37',
  '#232731',
  '#1C1F26',
  '#111318',
  '#0C0E12',
  '#08090C',
]

export const theme = createTheme({
  primaryColor: 'vidva',
  primaryShade: 5,
  autoContrast: true,
  luminanceThreshold: 0.3,
  colors: { vidva, dark },
  fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
  headings: {
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(24), lineHeight: '1.25' },
      h2: { fontSize: rem(15), lineHeight: '1.4' },
      h3: { fontSize: rem(14), lineHeight: '1.4' },
    },
  },
  defaultRadius: 'md',
  radius: { sm: rem(6), md: rem(8), lg: rem(12) },
  focusRing: 'auto',
  cursorType: 'pointer',
  components: {
    Paper: { defaultProps: { radius: 'lg' } },
  },
})
