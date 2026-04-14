import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── helpers ─────────────────────────────────────────────────
function detectionStrength(max: number, mean: number): { label: string; color: string; icon: string } {
  const score = max * 0.6 + mean * 0.4
  if (score >= 0.65) return { label: 'Strong', color: '#ef4444', icon: '⚠' }
  if (score >= 0.35) return { label: 'Moderate', color: '#f97316', icon: '〜' }
  return { label: 'Weak', color: '#22c55e', icon: '✓' }
}

function suspiciousFrames(scores: number[], threshold = 0.6): number[] {
  return scores.reduce<number[]>((acc, s, i) => {
    if (s >= threshold) acc.push(i + 1)
    return acc
  }, [])
}

// ─── animated number ─────────────────────────────────────────
function AnimatedBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="insight-bar-track">
      <motion.div
        className="insight-bar-fill"
        style={{ background: color, boxShadow: `0 0 10px ${color}88` }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  )
}

// ─── confidence meter ─────────────────────────────────────────
function ConfidenceMeter({ fakePct }: { fakePct: number }) {
  const realPct = 100 - fakePct
  const pointerLeft = fakePct          // pointer sits at fake probability %

  // Hue: green (120) → yellow (60) → red (0) as fakePct goes 0→100
  const hue = Math.round(120 - fakePct * 1.2)
  const meterColor = `hsl(${hue}, 90%, 55%)`

  return (
    <div className="insight-meter-wrap">
      <div className="insight-meter-labels">
        <span style={{ color: '#22c55e', fontWeight: 700 }}>REAL</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Confidence Spectrum
        </span>
        <span style={{ color: '#ef4444', fontWeight: 700 }}>FAKE</span>
      </div>

      {/* gradient track */}
      <div className="insight-meter-track">
        <div className="insight-meter-gradient" />
        {/* animated pointer */}
        <motion.div
          className="insight-meter-pointer"
          style={{ borderColor: meterColor, boxShadow: `0 0 12px ${meterColor}` }}
          initial={{ left: '0%' }}
          animate={{ left: `${pointerLeft}%` }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </div>

      {/* percentage labels */}
      <div className="insight-meter-pcts">
        <span style={{ color: '#22c55e' }}>{realPct.toFixed(1)}% Real</span>
        <span style={{ color: '#ef4444' }}>{fakePct.toFixed(1)}% Fake</span>
      </div>
    </div>
  )
}

// ─── single insight card ─────────────────────────────────────
function ICard({
  label, value, sub, color, icon, delay,
}: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      className="insight-card glass"
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ scale: 1.03, y: -3 }}
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="insight-card-icon" style={{ color, background: `${color}18` }}>{icon}</div>
      <div className="insight-card-body">
        <p className="insight-card-label">{label}</p>
        <p className="insight-card-value" style={{ color }}>{value}</p>
        {sub && <p className="insight-card-sub">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ─── suspicious frames list ───────────────────────────────────
function SuspiciousFrames({ frames }: { frames: number[] }) {
  if (frames.length === 0)
    return (
      <div className="suspicious-empty">
        <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span>
        No high-risk frames detected — manipulation signal is low throughout.
      </div>
    )

  return (
    <div className="suspicious-list">
      <p className="suspicious-title">
        <span style={{ color: '#ef4444', marginRight: '0.5rem' }}>⚠</span>
        {frames.length} spike{frames.length > 1 ? 's' : ''} detected — high manipulation likelihood
      </p>
      <div className="suspicious-chips">
        {frames.slice(0, 30).map((f) => (
          <motion.span
            key={f}
            className="suspicious-chip"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.02 * f }}
            title="High manipulation likelihood detected here"
          >
            #{f}
          </motion.span>
        ))}
        {frames.length > 30 && (
          <span className="suspicious-chip" style={{ opacity: 0.5 }}>+{frames.length - 30} more</span>
        )}
      </div>
    </div>
  )
}

// ─── main export ─────────────────────────────────────────────
interface Props {
  fakeProbability: number      // 0-1, overall
  mean: number                 // 0-1
  max: number                  // 0-1
  scores: number[]
  classification: string       // 'FAKE', 'REAL', etc.
  confidence: string           // 'HIGH', 'MEDIUM', 'LOW'
}

function ModelLimitationWarning() {
  return (
    <motion.div
      className="model-warning-card glass"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="warning-icon">⚠️</div>
      <div className="warning-content">
        <p>This video may be generated using methods not present in the training dataset. The model detected patterns outside its learned distribution, so results may vary.</p>
      </div>
    </motion.div>
  )
}

export default function InsightCards({ fakeProbability, mean, max, scores, classification, confidence }: Props) {
  const strength = detectionStrength(max, mean)
  const spikes   = suspiciousFrames(scores, 0.6)

  // Condition for warning:
  // 1. Mean is very low (< 0.1)
  // 2. Or it's REAL but confidence is not HIGH
  const showWarning = (mean < 0.1) || (classification === 'REAL' && (confidence === 'LOW' || confidence === 'MEDIUM'))

  const peakColor  = max >= 0.7 ? '#ef4444' : max >= 0.4 ? '#f97316' : '#22c55e'
  const meanColor  = mean >= 0.5 ? '#ef4444' : mean >= 0.25 ? '#f97316' : '#22c55e'

  const PeakIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
  const AvgIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
  const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )

  return (
    <div className="insight-section">

      {/* ── Section header ───────────────────────────── */}
      <div className="insight-section-header">
        <div className="insight-section-line" />
        <span className="insight-section-title">Deep Analysis</span>
        <div className="insight-section-line" />
      </div>

      {/* ── Confidence Meter ─────────────────────────── */}
      <motion.div
        className="glass-strong insight-meter-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="insight-block-label">
          <span style={{ marginRight: '0.4rem' }}>⚡</span>Confidence Meter
        </p>
        <ConfidenceMeter fakePct={fakeProbability * 100} />

        {/* bar breakdown */}
        <div className="insight-bars">
          <div className="insight-bar-row">
            <span className="insight-bar-label" style={{ color: '#22c55e' }}>Authentic signal</span>
            <AnimatedBar value={1 - fakeProbability} color="#22c55e" />
            <span className="insight-bar-pct">{((1 - fakeProbability) * 100).toFixed(1)}%</span>
          </div>
          <div className="insight-bar-row">
            <span className="insight-bar-label" style={{ color: '#ef4444' }}>Manipulation signal</span>
            <AnimatedBar value={fakeProbability} color="#ef4444" />
            <span className="insight-bar-pct">{(fakeProbability * 100).toFixed(1)}%</span>
          </div>
        </div>
      </motion.div>

      {/* ── Three insight cards ───────────────────────── */}
      <div className="insight-cards-grid">
        <ICard
          label="Peak Fake Probability"
          value={`${(max * 100).toFixed(1)}%`}
          sub="Highest risk frame in the video"
          color={peakColor}
          icon={<PeakIcon />}
          delay={0.15}
        />
        <ICard
          label="Average Probability"
          value={`${(mean * 100).toFixed(1)}%`}
          sub="Mean fake score across all frames"
          color={meanColor}
          icon={<AvgIcon />}
          delay={0.22}
        />
        <ICard
          label="Detection Strength"
          value={strength.label}
          sub={
            strength.label === 'Strong'  ? 'Multiple high-confidence manipulation signals found' :
            strength.label === 'Moderate' ? 'Some frames show elevated manipulation signals' :
                                            'Low overall manipulation signal detected'
          }
          color={strength.color}
          icon={<ShieldIcon />}
          delay={0.29}
        />
      </div>

      {/* ── Suspicious frames ────────────────────────── */}
      <motion.div
        className="glass-strong insight-suspicious-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <p className="insight-block-label">
          <span style={{ marginRight: '0.4rem' }}>🔍</span>Suspicious Frame Scanner
        </p>
        <SuspiciousFrames frames={spikes} />
      </motion.div>

      {/* ── Model Limitation Warning ────────────────── */}
      {showWarning && <ModelLimitationWarning />}

    </div>
  )
}
