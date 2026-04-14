import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function FrameChart({ scores }: { scores: number[] }) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  useEffect(() => {
    return () => {
      chartRef.current?.destroy()
    }
  }, [])

  const data = {
    labels: scores.map((_, i) => `Frame ${i + 1}`),
    datasets: [
      {
        label: 'Fake Probability',
        data: scores.map((s) => +(s * 100).toFixed(1)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: scores.map((s) =>
          s > 0.5 ? '#ef4444' : s > 0.2 ? '#f97316' : s > 0.01 ? '#eab308' : '#22c55e'
        ),
        pointRadius: scores.map(s => s > 0.6 ? 8 : 4),
        pointHoverRadius: 10,
        pointBorderWidth: scores.map(s => s > 0.6 ? 2 : 0),
        pointBorderColor: '#fff',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748B', font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#64748B',
          font: { size: 11 },
          callback: (v: number | string) => `${v}%`,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => {
            const val = ctx.parsed.y
            let label = `Fake Probability: ${val}%`
            if (val > 60) label += " ⚠️ High manipulation likelihood detected here"
            return label
          },
        },
      },
    },
  }

  return (
    <motion.div
      className="chart-card glass-strong"
      style={{ borderRadius: 'var(--radius-lg)' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Frame-by-Frame Analysis
      </h2>
      <div className="chart-wrapper">
        <Line ref={chartRef} data={data} options={options as any} />
      </div>
    </motion.div>
  )
}
