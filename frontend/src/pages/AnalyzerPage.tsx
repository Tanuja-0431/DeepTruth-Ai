import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { predictVideo, type VideoResponse } from '../api'
import FrameChart from '../components/FrameChart'
import InsightCards from '../components/InsightCards'
import { useAuth } from '../context/AuthContext'

// ─── Tier config ────────────────────────────────────────────
const TIER: Record<string, { color: string; bg: string; glow: string }> = {
  REAL: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', glow: 'rgba(34,197,94,0.25)' },
  'MINOR AI TRACE': { color: '#eab308', bg: 'rgba(234,179,8,0.08)', glow: 'rgba(234,179,8,0.25)' },
  SUSPICIOUS: { color: '#f97316', bg: 'rgba(249,115,22,0.08)', glow: 'rgba(249,115,22,0.25)' },
  FAKE: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', glow: 'rgba(239,68,68,0.25)' },
}
const CONF_COLORS: Record<string, string> = { HIGH: '#22c55e', MEDIUM: '#f59e0b', LOW: '#9ca3af' }

// ─── Scroll-reveal wrapper ───────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ value, label, color, delay }: { value: string; label: string; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      className="stat-card glass"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -3 }}
      style={{ transition: 'box-shadow 0.3s' }}
    >
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  )
}

// ─── Main ────────────────────────────────────────────────────
export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const { user, freeTrialCount, incrementTrial } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const trialLimitReached = !user && freeTrialCount >= 1

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) handleFile(f)
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predictVideo(file)
      setResult(res)
      if (!user) incrementTrial()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll to results
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [result])

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  const tier = result ? (TIER[result.result] ?? TIER.REAL) : null
  const pct = result ? Math.round(result.fake_probability * 100) : 0
  const confColor = result ? (CONF_COLORS[result.confidence] ?? '#9ca3af') : '#9ca3af'

  return (
    <div className="page">
      <section className="section-wrapper">
        <div className="container" style={{ maxWidth: 900 }}>
          {/* ══ Header ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-header-cnt"
            style={{ textAlign: 'left', margin: '0 0 var(--space-xl)' }}
          >
            <h1 className="section-title" style={{ textAlign: 'left' }}>
              Video{' '}
              <span className="gradient-text">
                Analyzer
              </span>
            </h1>
            <p className="section-subtitle" style={{ textAlign: 'left' }}>Upload a video to detect deepfake manipulation with frame-level insights</p>
          </motion.div>

          {/* ══ SECTION A — Upload ════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {!file && !loading && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`upload-zone glass ${dragOver ? 'drag-over' : ''}`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <motion.div
                    className="upload-icon"
                    animate={dragOver ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </motion.div>
                  <h3>Drop your video here</h3>
                  <p style={{ marginTop: '0.4rem' }}>or click to browse · MP4, AVI, MOV, MKV</p>
                  <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              </motion.div>
            )}

            {file && !loading && !result && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="glass-strong" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                  {trialLimitReached ? (
                    <motion.div 
                      className="glass" 
                      style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Free trial limit reached</h3>
                      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Please login or create an account to continue your deepfake analysis.
                      </p>
                      <div className="hero-btn-group">
                        <Link to="/login" className="hero-cta" style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}>Login</Link>
                        <Link to="/signup" className="hero-cta secondary" style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}>Sign Up</Link>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{file.name}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        <button onClick={handleReset} style={{ color: 'var(--text-muted)', fontSize: '1.75rem' }}>×</button>
                      </div>
                      {preview && (
                        <div className="video-preview" style={{ marginBottom: '2rem' }}>
                          <video src={preview} controls />
                        </div>
                      )}
                      <motion.button
                        className="btn-analyze"
                        onClick={handleAnalyze}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Analyze Video
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                className="glass-strong scanning-overlay"
                style={{ borderRadius: 'var(--radius-lg)', padding: '4rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="scan-ring" />
                <div className="scanning-text">
                  <strong style={{ fontSize: '1.2rem' }}>Analyzing frames using deep learning...</strong>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Processing with Xception CNN • This may take a few seconds</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1.5rem', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.95rem' }}>
              {error}
            </motion.div>
          )}

          {/* ══ SECTION B + C — Results + Insights ═══════════════ */}
          <AnimatePresence>
            {result && tier && (
              <div ref={resultsRef} style={{ marginTop: 'var(--space-3xl)' }}>

                {/* Divider */}
                <Reveal>
                  <div className="insight-section-header">
                    <div className="insight-section-line" />
                    <span className="insight-section-title">Analysis Results</span>
                    <div className="insight-section-line" />
                  </div>
                </Reveal>

                {/* ── Result Card ─────────────────────────────────── */}
                <Reveal delay={0.05}>
                  <motion.div
                    className="glass-strong"
                    style={{
                      padding: '2.5rem',
                      borderRadius: 'var(--radius-lg)',
                      borderTop: `4px solid ${tier.color}`,
                      boxShadow: `0 0 60px ${tier.glow}`,
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: 'var(--space-lg)',
                    }}
                    whileHover={{ boxShadow: `0 0 80px ${tier.glow}` }}
                  >
                    {/* Glow bg */}
                    <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: `radial-gradient(circle at 50% 0%, ${tier.bg} 0%, transparent 60%)`, pointerEvents: 'none', zIndex: 0 }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Label badge */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1.5rem',
                          padding: '1.5rem 4rem', borderRadius: 'var(--radius-lg)',
                          background: 'rgba(0,0,0,0.5)', border: `2px solid ${tier.color}`,
                          boxShadow: `0 0 35px ${tier.bg}`,
                          marginBottom: '1.5rem',
                        }}
                      >
                        <ResultIcon label={result.result} color={tier.color} />
                        <h1 style={{ fontSize: result.result.length > 6 ? '2.5rem' : '3.5rem', fontFamily: 'Poppins, sans-serif', fontWeight: 900, color: tier.color, textShadow: `0 0 25px ${tier.color}`, letterSpacing: '0.08em', margin: 0, lineHeight: 1 }}>
                          {result.result}
                        </h1>
                      </motion.div>

                      {/* Confidence pill */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.25rem', borderRadius: 100, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}
                      >
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence:</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: confColor, letterSpacing: '0.05em' }}>{result.confidence}</span>
                      </motion.div>

                      {/* Gauge */}
                      <div style={{ width: '100%', maxWidth: 520 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                          <span>Authentic</span><span>Manipulated</span>
                        </div>
                        <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.15 }}>
                            <div style={{ width: '15%', background: '#22c55e' }} />
                            <div style={{ width: '25%', background: '#eab308' }} />
                            <div style={{ width: '30%', background: '#f97316' }} />
                            <div style={{ width: '30%', background: '#ef4444' }} />
                          </div>
                          <motion.div
                            style={{ height: '100%', borderRadius: 6, background: tier.color, boxShadow: `0 0 15px ${tier.color}`, position: 'relative', zIndex: 1 }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>0%</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>{pct}% Probability</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>100%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>

                {/* ── AI Summary ─────────────────────────────────── */}
                <Reveal delay={0.1}>
                  <motion.div
                    className="glass"
                    style={{ padding: '1.5rem 2rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)', borderLeft: `4px solid ${tier.color}` }}
                    whileHover={{ scale: 1.005 }}
                  >
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 700 }}>AI Decision Reasoning</h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                      <span style={{ color: confColor, fontWeight: 700 }}>{result.confidence} Confidence: </span>
                      {result.summary}
                    </p>
                  </motion.div>
                </Reveal>

                {/* ── Stats ══════════════════════════════════════════ */}
                <Reveal>
                  <div className="insight-section-header">
                    <div className="insight-section-line" />
                    <span className="insight-section-title">Detailed Metrics</span>
                    <div className="insight-section-line" />
                  </div>
                </Reveal>

                <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)', gap: '1.5rem' }}>
                  <StatCard value={String(result.frames_processed)} label="Frames Scanned" color="var(--accent-blue)" delay={0.1} />
                  <StatCard value={`${(result.fake_probability_mean * 100).toFixed(1)}%`} label="Avg Fraud Index" color="var(--accent-purple)" delay={0.15} />
                  <StatCard value={`${(result.fake_probability_max * 100).toFixed(1)}%`} label="Peak Manipulation" color="var(--accent-cyan)" delay={0.2} />
                </div>

                {/* ── Frame Chart ────────────────────────────────── */}
                {result.scores && result.scores.length > 0 && (
                  <>
                    <Reveal delay={0.1}>
                      <InsightCards
                        fakeProbability={result.fake_probability}
                        mean={result.fake_probability_mean}
                        max={result.fake_probability_max}
                        scores={result.scores}
                        classification={result.result}
                        confidence={result.confidence}
                      />
                    </Reveal>
                    <Reveal delay={0.15}>
                      <FrameChart scores={result.scores} />
                    </Reveal>
                  </>
                )}

                {/* ── Reset ─────────────────────────────────────── */}
                <Reveal delay={0.2}>
                  <motion.button
                    className="btn-analyze"
                    onClick={handleReset}
                    style={{ marginTop: 'var(--space-xl)' }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Analyze Another Video
                  </motion.button>
                </Reveal>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

// ─── Icon per tier ───────────────────────────────────────────
function ResultIcon({ label, color }: { label: string; color: string }) {
  const w = 42
  if (label === 'REAL')
    return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  if (label === 'MINOR AI TRACE')
    return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  if (label === 'SUSPICIOUS')
    return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  return <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
}
