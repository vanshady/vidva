import { PlexMediaItem } from '../services/plexService'
import { ChartOptions } from 'chart.js'

export interface PlexMediaItemsProps {
  items: PlexMediaItem[]
}

export interface BaseStatsProps {
  title: string
  type: 'genre' | 'country' | 'decade'
  data: { name: string; count: number }[] | undefined
  isLoading: boolean
  error: Error | null
  backgroundColor: string
  borderColor: string
  libraryId: string
  chartOptions?: ChartOptions<'bar'>,
} 