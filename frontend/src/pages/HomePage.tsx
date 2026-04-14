import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AnimatedCounter from '../components/AnimatedCounter'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="page">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-badge">
              <span className="dot" />
              Empowering Digital Trust
            </div>

            <h1>
              AI <span className="gradient-text">Deepfake</span><br />
              Detection for Everyone
            </h1>

            <p className="hero-subtitle">
              The world's most accessible neural network for verifying digital integrity.
              Protect yourself from face-swaps and synthetic media with a single click.
            </p>

            <div className="hero-btn-group">
              <Link to="/analyzer" className="hero-cta">Analyze Video</Link>
            </div>
          </motion.div>
        </div>
      </section>



      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="section-wrapper">
        <div className="container">
          <motion.div
            className="hero-features-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
          >
            {[
              { title: 'CNN Model',        desc: 'Xception-based architecture trained on massive forensic datasets.',         icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,                                                                                      color: '#3B82F6', anim: 'pulse'  },
                { title: 'Frame Analysis',  desc: 'Every single frame is verified for pixel-level inconsistencies.',           icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="12" y1="17" x2="12" y2="21" /></>,                                 color: '#8B5CF6', anim: 'pulse'  },
                { title: 'Confidence Score',desc: 'Granular accuracy statistics for every detection attempt.',                icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,                                                                                   color: '#06B6D4', anim: 'rotate' },
                { title: 'Explainable AI', desc: 'Natural language summaries explaining the detection reasoning.',            icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />, color: '#EC4899', anim: 'pulse' },
              ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card glass-ai"
                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className={`feature-icon ${f.anim}`} style={{ background: `${f.color}18`, color: f.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">{f.icon}</svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="section-wrapper stats-bg">
        <div className="container">
          <div className="stats-main-grid">
            {[
              { from: 70, to: 98.2, decimals: 1, suffix: '%',  label: 'ACCURACY' },
              { from: 0,  to: 15,   decimals: 0, prefix: '< ', suffix: 's', label: 'ANALYSIS SPEED' },
              { from: 0,  to: 1,    decimals: 0, suffix: 'M+', label: 'FRAMES SCANNED' },
              { from: 0,  to: 24,   decimals: 0, suffix: '/7', label: 'MONITORING' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-number">
                  <AnimatedCounter from={s.from} to={s.to} decimals={s.decimals ?? 0} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section-wrapper footer-cta">
        <div className="container">
          <div className="cta-box glass-strong">
            <h2 className="cta-title">Ready to <span className="gradient-text">Verify?</span></h2>
            <p className="cta-subtitle">
              Join thousands of users who trust DeepTruth to protect their digital authenticity.
              Create an account today or contact our team.
            </p>
            <div className="hero-btn-group">
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div key="dashboard" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                    <Link to="/dashboard" className="hero-cta">Visit Dashboard</Link>
                  </motion.div>
                ) : (
                  <motion.div key="signup" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                    <Link to="/signup" className="hero-cta">Create Account</Link>
                  </motion.div>
                )}
              </AnimatePresence>
              <Link to="/contact" className="hero-cta secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
