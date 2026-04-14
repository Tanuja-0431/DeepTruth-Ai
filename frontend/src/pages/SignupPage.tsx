import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{ name?: string; email?: string; password?: string; form?: string }>({})
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim())                          e.name     = 'Full name is required'
    if (!email)                                e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))     e.email    = 'Enter a valid email'
    if (!password)                             e.password = 'Password is required'
    else if (password.length < 6)             e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    try {
      login(email)
      navigate('/dashboard', { state: { tab: 'profile' }, replace: true })
    } catch {
      setErrors({ form: 'Could not create account. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px var(--neon-glow)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="auth-title">Create <span className="gradient-text">Account</span></h1>
          <p className="auth-subtitle">Join DeepTruth - it's free</p>
        </div>

        {errors.form && (
          <div className="auth-error-banner">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="auth-label">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className={`auth-input ${errors.name ? 'auth-input--error' : ''}`}
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })) }}
              autoComplete="name"
            />
            {errors.name && <span className="auth-field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
              autoComplete="new-password"
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          <motion.button
            id="signup-submit"
            type="submit"
            className="hero-cta"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </motion.button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
