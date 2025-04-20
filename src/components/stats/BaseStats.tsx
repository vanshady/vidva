import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js'
import { getBaseChartOptions, chartPlugins } from '../../utils/chartUtils'
import { Text, Box, Center, Loader } from '@mantine/core'
import { StatsTitle } from '../common/StatsTitle'
import { useNavigate } from 'react-router-dom'
import { ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend)

interface BaseStatsProps {
  title: string
  type: 'genre' | 'country' | 'decade'
  data: { name: string; count: number }[] | undefined
  isLoading: boolean
  error: Error | null
  backgroundColor: string
  borderColor: string
  libraryId: string
  chartOptions?: ChartOptions<'bar'>
}

export const BaseStats = ({ title, type, data, isLoading, error, backgroundColor, borderColor, libraryId }: BaseStatsProps) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div>
        <StatsTitle title={title} />
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <StatsTitle title={title} />
        <Center h={200}>
          <Text c="red" ta="center">{error.message}</Text>
        </Center>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <StatsTitle title={title} />
        <Center h={200}>
          <Text c="dimmed" ta="center">No data available</Text>
        </Center>
      </div>
    )
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Number of Films',
        data: data.map(item => item.count),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  }

  const chartHeight = data.length * 25

  const handleClick = (label: string) => {
    navigate(`/${type}/${encodeURIComponent(label)}`)
  }

  return (
    <div>
      <StatsTitle title={title} />
      <Box>
        <Bar
          redraw={true}
          key={libraryId}
          data={chartData}
          options={{
            ...getBaseChartOptions(),
            onClick: (_, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index
                handleClick(data[index].name)
              }
            },
            onHover: function (e, elements) {
              if (e?.native?.target != null) (e.native.target as HTMLElement).style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
          }}
          plugins={chartPlugins}
          height={chartHeight}
          width={800}
        />
      </Box>
    </div>
  )
} 