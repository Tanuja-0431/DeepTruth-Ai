import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function AboutPage() {
  return (
    <div className="container">
      <div className="section-wrapper">
        <motion.div className="section-header-cnt about-hero" {...fadeUp} transition={{ duration: 0.6 }}>
          <h1 className="section-title">
            About <span className="gradient-text">DeepTruth</span>
          </h1>
          <p className="section-subtitle">
            Understanding neural forensic technology and our mission to protect digital integrity.
          </p>
        </motion.div>

        <div className="about-grid">
          <motion.div className="about-card glass" {...fadeUp} transition={{ delay: 0.1 }}>
            <div className="about-card-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h2>What is a Deepfake?</h2>
            <p>
              A deepfake is synthetic media where a person's likeness is replaced with
              someone else's using artificial intelligence. Deepfakes leverage deep
              neural networks — particularly Generative Adversarial Networks (GANs) and
              autoencoders — to create highly convincing fake videos that are often
              indistinguishable from real footage to the naked eye.
            </p>
            <p style={{ marginTop: '1rem' }}>
              These manipulations can be used for entertainment, but also pose serious
              threats to journalism, politics, personal privacy, and trust in digital media.
            </p>
          </motion.div>

          <motion.div className="about-card glass" {...fadeUp} transition={{ delay: 0.2 }}>
            <div className="about-card-icon purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2>Xception Architecture</h2>
            <p>
              Our system uses the <strong>Xception</strong> (Extreme Inception)
              architecture — a deep convolutional neural network originally designed by
              Google for image classification, which has proven highly effective at
              detecting deepfake artifacts.
            </p>
            <ul style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', listStyleType: 'disc', paddingLeft: '1.2rem' }}>
              <li>Transfer learning from ImageNet pre-trained weights</li>
              <li>Binary classification: Real (0) vs Fake (1)</li>
              <li>Sigmoid output layer for probability scoring</li>
              <li>Xception-specific preprocessing ([-1, 1] normalization)</li>
              <li>Frame-by-frame video analysis with aggregated scoring</li>
            </ul>
          </motion.div>

          <motion.div className="about-card glass" {...fadeUp} transition={{ delay: 0.3 }}>
            <div className="about-card-icon cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h2>Detection Process</h2>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', listStyleType: 'disc', paddingLeft: '1.2rem' }}>
              <li>Video is uploaded and decoded into individual frames</li>
              <li>Frames are sampled at regular intervals for efficiency</li>
              <li>Each frame is resized to 224×224 pixels</li>
              <li>Xception preprocessing normalizes pixel values to [-1, 1]</li>
              <li>The CNN extracts features and outputs a fake probability</li>
              <li>Frame scores are aggregated into an overall verdict</li>
              <li>Multi-tier classification provides nuanced results</li>
            </ul>
          </motion.div>

          <motion.div className="about-card glass-strong" {...fadeUp} transition={{ delay: 0.4 }}>
            <div className="about-card-icon amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2>Limitations & Transparency</h2>
            <p style={{ marginBottom: '1rem' }}>No AI model is 100% accurate — results should be used as an aid to human judgment.</p>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', listStyleType: 'disc', paddingLeft: '1.2rem' }}>
              <li>False positives and negatives can occur based on quality</li>
              <li>New deepfake techniques may not be detected if not in training</li>
              <li>Model may not generalize to all deepfake types</li>
              <li>Low resolution or heavily compressed videos reduce accuracy</li>
            </ul>
          </motion.div>
        </div>

        {/* ── HOW IT WORKS SECTION ─────────────────────────────── */}
        <div className="section-header-cnt" style={{ marginTop: '6rem', marginBottom: '3rem' }}>
          <motion.h2 className="section-title" {...fadeUp} transition={{ duration: 0.6 }}>
            How It <span className="gradient-text">Works</span>
          </motion.h2>
          <motion.p className="section-subtitle" {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
            Step-by-step breakdown of the AI deepfake detection pipeline.
          </motion.p>
        </div>

        <div className="demo-steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            {
              step: '01', title: 'Video Upload', desc: 'User uploads a video for analysis',
              icon: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
              color: '#3B82F6'
            },
            {
              step: '02', title: 'Frame Extraction', desc: 'Video is split into multiple frames',
              icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></>,
              color: '#8B5CF6'
            },
            {
              step: '03', title: 'Deep Learning Model', desc: 'Xception model analyzes each frame',
              icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
              color: '#06B6D4'
            },
            {
              step: '04', title: 'Prediction', desc: 'Each frame is classified as real or fake',
              icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
              color: '#F59E0B'
            },
            {
              step: '05', title: 'Final Decision', desc: 'All frame results are combined to give final output',
              icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
              color: '#10B981'
            }
          ].map((s, i) => (
            <motion.div
              key={i}
              className="demo-step-card glass-ai"
              {...fadeUp} transition={{ delay: 0.1 * i }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              style={{ padding: '1.5rem', gap: '0.75rem' }}
            >
              <div className="demo-step-number" style={{ color: s.color }}>{s.step}</div>
              <div className="demo-step-icon" style={{ background: `${s.color}18`, color: s.color, width: 44, height: 44 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </div>
              <h3 className="demo-step-title" style={{ fontSize: '0.95rem' }}>{s.title}</h3>
              <p className="demo-step-desc" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
