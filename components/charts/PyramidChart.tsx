'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { CHART_COLORS, hexToRgba, generateColors } from '@/utils/chartColors'
import { cn } from '@/lib/utils'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export interface PyramidChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
}

export interface PyramidChartProps {
  /**
   * Labels das categorias
   */
  labels: string[]

  /**
   * Datasets para plotar (geralmente 2: esquerda e direita)
   */
  datasets: PyramidChartDataset[]

  /**
   * Título do gráfico
   */
  title?: string

  /**
   * Classes CSS adicionais
   */
  className?: string

  /**
   * Altura do gráfico (em pixels)
   * @default 400
   */
  height?: number

  /**
   * Mostrar legenda
   * @default true
   */
  showLegend?: boolean

  /**
   * Opções customizadas do Chart.js
   */
  options?: ChartOptions<'bar'>
}

export function PyramidChart({
  labels,
  datasets,
  title,
  className,
  height = 400,
  showLegend = true,
  options: customOptions,
}: PyramidChartProps) {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  // Auto-gera cores se não fornecidas
  const processedDatasets = datasets.map((dataset, index) => {
    const colors = generateColors(datasets.length)
    const color = dataset.backgroundColor || colors[index]

    return {
      ...dataset,
      backgroundColor: color,
      borderColor: dataset.borderColor || color,
      borderWidth: 1,
    }
  })

  // Para pirâmides populacionais, geralmente invertemos um dos lados
  // (valores negativos para criar o efeito espelhado)
  const data = {
    labels,
    datasets: processedDatasets,
  }

  const defaultOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const, // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: CHART_COLORS.zinc200,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: CHART_COLORS.zinc50,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: CHART_COLORS.zinc800,
        titleColor: CHART_COLORS.zinc50,
        bodyColor: CHART_COLORS.zinc200,
        borderColor: CHART_COLORS.zinc700,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            // Mostra valores absolutos (sem negativos)
            const value = Math.abs(context.parsed.x ?? 0)
            label += value.toLocaleString()
            return label
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          color: CHART_COLORS.zinc700,
        },
        ticks: {
          color: CHART_COLORS.zinc400,
          font: {
            size: 11,
          },
          callback: function (value) {
            // Mostra valores absolutos no eixo X
            return Math.abs(Number(value)).toLocaleString()
          },
        },
      },
      y: {
        stacked: false,
        grid: {
          color: CHART_COLORS.zinc700,
        },
        ticks: {
          color: CHART_COLORS.zinc200,
          font: {
            size: 12,
          },
        },
      },
    },
  }

  // Merge custom options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...customOptions,
    plugins: {
      ...defaultOptions.plugins,
      ...customOptions?.plugins,
    },
    scales: {
      ...defaultOptions.scales,
      ...customOptions?.scales,
    },
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className={cn('w-full', className)} style={{ height: `${height}px` }}>
      <Bar ref={chartRef} data={data} options={mergedOptions} />
    </div>
  )
}
