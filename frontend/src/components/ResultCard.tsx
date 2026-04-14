import React from 'react'
import { motion } from 'framer-motion'
import type { VideoResponse } from '../api'

const TIER: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  REAL: {
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  'MINOR AI TRACE': {
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  SUSPICIOUS: {
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  FAKE: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  },
}

const CONF_COLORS: Record<string, string> = { HIGH: '#22c55e', MEDIUM: '#f59e0b', LOW: '#9ca3af' }

export default function ResultCard({ result }: { result: VideoResponse }) {
  const tier = TIER[result.result] || TIER.REAL
  const confColor = CONF_COLORS[result.confidence] || '#9ca3af'
  const pct = Math.round(result.fake_probability * 100)

  return (
    <>
      {/* Main Result */}
      <motion.div
        className="result-main glass-strong"
        style={{ borderTop: `3px solid ${tier.color}`, borderRadius: 'var(--radius-lg)' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="result-glow"
          style={{ background: `radial-gradient(circle at 50% 0%, ${tier.bg} 0%, transparent 50%)` }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Label Badge */}
          <motion.div
            className="result-label-badge"
            style={{ border: `2px solid ${tier.color}`, boxShadow: `0 0 30px ${tier.bg}` }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
          >
            {tier.icon}
            <h1 style={{
              fontSize: result.result.length > 6 ? '2rem' : '3rem',
              color: tier.color,
              textShadow: `0 0 15px ${tier.color}`,
            }}>
              {result.result}
            </h1>
          </motion.div>

          {/* Confidence Pill */}
          <motion.div
            className="confidence-pill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>CONFIDENCE:</span>
            <span style={{ color: confColor, fontWeight: 700, letterSpacing: '0.05em' }}>{result.confidence}</span>
          </motion.div>

          {/* Gauge */}
          <div className="gauge-container" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="gauge-labels">
              <span>Authentic</span>
              <span>Manipulated</span>
            </div>
            <div className="gauge-track">
              <div className="gauge-zones">
                <div style={{ width: '5%', background: '#22c55e' }} />
                <div style={{ width: '25%', background: '#eab308' }} />
                <div style={{ width: '50%', background: '#f97316' }} />
                <div style={{ width: '20%', background: '#ef4444' }} />
              </div>
              <motion.div
                className="gauge-fill"
                style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
            <div className="gauge-value">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0%</span>
              <span className="gauge-pct">{pct}% Fake Probability</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{result.frames_processed}</div>
          <div className="stat-label">Frames Analyzed</div>
        </motion.div>
        <motion.div className="stat-card glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{(result.fake_probability_mean * 100).toFixed(1)}%</div>
          <div className="stat-label">Mean Probability</div>
        </motion.div>
        <motion.div className="stat-card glass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{(result.fake_probability_max * 100).toFixed(1)}%</div>
          <div className="stat-label">Peak Probability</div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        className="summary-card glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div style={{ flex: 1 }}>
          <h3>AI Decision Summary</h3>
          <p>
            <span style={{ color: confColor, fontWeight: 600 }}>{result.confidence} Confidence: </span>
            {result.summary}
          </p>
        </div>
      </motion.div>
    </>
  )
}
