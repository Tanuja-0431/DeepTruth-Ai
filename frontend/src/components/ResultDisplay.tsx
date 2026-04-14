import { motion } from 'framer-motion'

interface Props {
  prob: number
  frames: number
  label?: string
  confidence?: string
  summary?: string
  onClose: () => void
}

const TIER_CONFIG: Record<string, { color: string; bg: string; glow: string; icon: 'shield' | 'warning' | 'alert' | 'danger' }> = {
  REAL:              { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.10)', glow: 'rgba(34, 197, 94, 0.15)', icon: 'shield' },
  'MINOR AI TRACE':  { color: '#eab308', bg: 'rgba(234, 179, 8, 0.10)', glow: 'rgba(234, 179, 8, 0.15)', icon: 'alert' },
  SUSPICIOUS:        { color: '#f97316', bg: 'rgba(249, 115, 22, 0.10)', glow: 'rgba(249, 115, 22, 0.15)', icon: 'warning' },
  FAKE:              { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.10)', glow: 'rgba(239, 68, 68, 0.15)', icon: 'danger' },
}

const CONF_COLORS: Record<string, string> = {
  HIGH: '#22c55e',
  MEDIUM: '#f59e0b',
  LOW: '#9ca3af',
}

function TierIcon({ type, color, size = 48 }: { type: string; color: string; size?: number }) {
  if (type === 'shield')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  if (type === 'alert')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  if (type === 'warning')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  // danger
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

export function ResultDisplay({ prob, frames, label, confidence, summary, onClose }: Props) {
  // Derive tier from backend label, or fall back to local logic
  const resolvedLabel = label || (prob > 0.8 ? 'FAKE' : prob > 0.3 ? 'SUSPICIOUS' : prob > 0.05 ? 'MINOR AI TRACE' : 'REAL')
  const resolvedConf = confidence || (prob > 0.8 || prob <= 0.05 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW')
  const resolvedSummary = summary || (
    resolvedLabel === 'FAKE' ? 'Strong indicators of deepfake manipulation detected.' :
    resolvedLabel === 'SUSPICIOUS' ? 'Some inconsistencies detected. Content may be manipulated.' :
    resolvedLabel === 'MINOR AI TRACE' ? 'Very weak AI artifacts detected. Likely real but not fully certain.' :
    'Content appears authentic with no significant deepfake indicators.'
  )

  const tier = TIER_CONFIG[resolvedLabel] || TIER_CONFIG.REAL
  const confColor = CONF_COLORS[resolvedConf] || '#9ca3af'
  const pct = Math.round(prob * 100)

  return (
    <motion.div
      className="result-card glass"
      style={{
        padding: '2rem',
        borderTop: `4px solid ${tier.color}`,
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 12px 40px ${tier.bg}`,
        position: 'relative',
        overflow: 'hidden'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle at 50% 0%, ${tier.glow} 0%, transparent 50%)`,
        opacity: 0.8,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="result-header" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Analysis Complete</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close" style={{ zIndex: 10 }}>×</button>
      </div>

      {/* Main Label Badge */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '1.25rem 3.5rem',
            borderRadius: '24px',
            background: 'rgba(0,0,0,0.4)',
            border: `2px solid ${tier.color}`,
            boxShadow: `0 0 30px ${tier.bg}, inset 0 0 20px ${tier.bg}`
          }}
        >
          <TierIcon type={tier.icon} color={tier.color} />
          <h1 style={{
            fontSize: resolvedLabel.length > 6 ? '2.25rem' : '3.5rem',
            margin: 0,
            color: tier.color,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textShadow: `0 0 15px ${tier.color}`,
            lineHeight: 1,
            textAlign: 'center'
          }}>
            {resolvedLabel}
          </h1>
        </motion.div>

        {/* Confidence Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(0,0,0,0.5)',
            padding: '0.5rem 1.25rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CONFIDENCE:</span>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: confColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {resolvedConf}
          </span>
        </motion.div>
      </div>

      {/* Probability Gauge */}
      <div className="gauge-wrap" style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>AUTHENTIC</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>MANIPULATED</span>
        </div>

        {/* Multi-color gradient gauge background */}
        <div style={{ position: 'relative', height: '12px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {/* Subtle tier zone indicators */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.15 }}>
            <div style={{ width: '5%', background: '#22c55e' }} />
            <div style={{ width: '25%', background: '#eab308' }} />
            <div style={{ width: '50%', background: '#f97316' }} />
            <div style={{ width: '20%', background: '#ef4444' }} />
          </div>
          <motion.div
            style={{
              height: '100%',
              borderRadius: '6px',
              background: tier.color,
              boxShadow: `0 0 10px ${tier.color}`,
              position: 'relative',
              zIndex: 1
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0%</span>
          <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', color: 'var(--text)', fontWeight: 600 }}>{pct}% Fake Probability</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>100%</span>
        </div>
      </div>

      {/* AI Decision Summary */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '1.25rem',
        borderRadius: '16px'
      }}>
        <div className="explanation" style={{ padding: 0, background: 'none', margin: 0, flex: 1 }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>AI Decision Summary</h3>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text)' }}>
            <span style={{ color: confColor, fontWeight: 600 }}>{resolvedConf} Confidence: </span>
            {resolvedSummary}
          </p>
        </div>

        <div style={{
          textAlign: 'right',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: '1.5rem',
          marginLeft: '1.5rem',
          minWidth: '90px'
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{frames}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Frames<br/>Analyzed</div>
        </div>
      </div>
    </motion.div>
  )
}
