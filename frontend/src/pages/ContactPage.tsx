import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendContactMessage } from '../api'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const res = await sendContactMessage(formData)
      setSuccessMsg(res.message || 'Your message has been sent successfully!')
      setFormData({ name: '', email: '', message: '' }) // Clear form
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while sending your message.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-header">
          <h1 className="auth-title">Contact <span className="gradient-text">Us</span></h1>
          <p className="auth-subtitle">Have questions about our AI technology? We're here to help.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Elon Musk"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Message</label>
            <textarea
              className="auth-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="How can we help you today?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                {successMsg}
              </motion.div>
            )}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="hero-cta"
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', opacity: isSubmitting ? 0.7 : 1 }}
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.99 } : {}}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>Our experts typically respond within 24 hours.</p>
        </div>
      </motion.div>
    </div>
  )
}
