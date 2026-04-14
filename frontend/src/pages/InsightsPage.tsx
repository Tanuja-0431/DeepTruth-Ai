import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function InsightsPage() {
  return (
    <div className="page">
      <div className="page-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Analysis <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Insights</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Frame-by-frame probability graphs and detection statistics
          </p>
        </motion.div>

        <motion.div
          className="insights-empty glass-strong"
          style={{ borderRadius: 'var(--radius-lg)' }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h2>No Analysis Data Yet</h2>
          <p style={{ marginBottom: '2rem' }}>
            Upload and analyze a video to see frame-by-frame insights and detection graphs.
          </p>
          <Link to="/analyzer" className="hero-cta" style={{ display: 'inline-flex' }}>
            Go to Analyzer
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
