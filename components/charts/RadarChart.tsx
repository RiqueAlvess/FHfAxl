'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { CHART_COLORS, hexToRgba, generateColors } from '@/utils/chartColors'
import { cn } from '@/lib/utils'

// Registrar componentes do Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export interface RadarChartDataset {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

export interface RadarChartProps {
  /**
   * Labels dos eixos do radar
   */
  labels: string[]

  /**
   * Datasets para plotar
   */
  datasets: RadarChartDataset[]

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
   * @default 300
   */
  height?: number

  /**
   * Mostrar legenda
   * @default true
   */
  showLegend?: boolean

  /**
   * Valor máximo da escala
   */
  maxScale?: number

  /**
   * Opções customizadas do Chart.js
   */
  options?: ChartOptions<'radar'>
}

export function RadarChart({
  labels,
  datasets,
  title,
  className,
  height = 300,
  showLegend = true,
  maxScale,
  options: customOptions,
}: RadarChartProps) {
  const chartRef = useRef<ChartJS<'radar'>>(null)

  // Auto-gera cores se não fornecidas
  const processedDatasets = datasets.map((dataset, index) => {
    const color = CHART_COLORS.violet // Cor padrão

    // Usa cores da paleta se não especificadas
    const colors = generateColors(datasets.length)
    const datasetColor = dataset.borderColor || colors[index]
    const backgroundColor =
      dataset.backgroundColor || hexToRgba(datasetColor, 0.2)

    return {
      ...dataset,
      backgroundColor,
      borderColor: datasetColor,
      borderWidth: dataset.borderWidth || 2,
      pointBackgroundColor: datasetColor,
      pointBorderColor: CHART_COLORS.zinc50,
      pointHoverBackgroundColor: CHART_COLORS.zinc50,
      pointHoverBorderColor: datasetColor,
    }
  })

  const data = {
    labels,
    datasets: processedDatasets,
  }

  const defaultOptions: ChartOptions<'radar'> = {
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
            if (context.parsed.r !== null) {
              label += context.parsed.r.toFixed(2)
            }
            return label
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: maxScale,
        ticks: {
          color: CHART_COLORS.zinc400,
          backdropColor: 'transparent',
          font: {
            size: 11,
          },
        },
        grid: {
          color: CHART_COLORS.zinc700,
        },
        angleLines: {
          color: CHART_COLORS.zinc700,
        },
        pointLabels: {
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
      <Radar ref={chartRef} data={data} options={mergedOptions} />
    </div>
  )
}
