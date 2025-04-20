import { ChartOptions } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

export const getBaseChartOptions = (): ChartOptions<'bar'> => ({
  indexAxis: 'y',
  responsive: true,
  layout: {
    padding: {
      right: 40,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    datalabels: {
      anchor: 'end',
      align: 'end',
      color: '#4B5563',
      font: {
        weight: 'bold',
      },
      formatter: (value: number) => value.toLocaleString(),
      padding: {
        right: 10,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
      ticks: {
        padding: 10,
        display: true,
        autoSkip: false,
        color: '#9CA3AF',
      },
    },
  },
})

export const chartPlugins = [ChartDataLabels] 