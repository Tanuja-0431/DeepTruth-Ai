import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout, completeProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'settings'>('overview')

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
      setActiveTab((location.state as any).tab)
    }
  }, [location.state])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Multi-tab transition setup
  const tabVariants = {
    hidden: { opacity: 0, x: 10 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
  }

  // ── Profile State
  const [profileData, setProfileData] = useState({ name: user?.name || '', role: user?.role || '' })
  const [isEditingProfile, setIsEditingProfile] = useState(!user?.isProfileComplete)

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    completeProfile(profileData)
    setIsEditingProfile(false)
  }

  // ── Settings State
  const [passData, setPassData] = useState({ oldPass: '', newPass: '' })
  
  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Password updated (Mock)')
    setPassData({ oldPass: '', newPass: '' })
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      logout()
      navigate('/')
    }
  }

  // Mock data for the dashboard
  const stats = [
    { label: 'Total Videos Analyzed', value: '12', color: 'var(--accent-blue)' },
    { label: 'Threats Detected', value: '3', color: '#ef4444' },
    { label: 'Current Plan', value: 'Pro Tier', color: 'var(--accent-purple)' },
  ]

  const history = [
    { name: 'ceo_announcement.mp4', date: '2026-03-28', status: 'Fake', confidence: '98.2%' },
    { name: 'internal_memo_v2.mov', date: '2026-03-25', status: 'Real', confidence: '99.5%' },
    { name: 'interview_clip.mp4', date: '2026-03-20', status: 'Real', confidence: '88.7%' },
  ]

  return (
    <div className="dashboard-container">
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="dashboard-sidebar glass-strong">
        <div className="sidebar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>DeepGuard</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link">Home</Link>
          <Link to="/analyzer" className="sidebar-link">Analyzer</Link>
          
          <div className="sidebar-separator" />
          
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: activeTab === 'overview' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: activeTab === 'profile' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            User Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: activeTab === 'settings' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Settings
          </button>
          
          <div className="sidebar-separator" />

          <button onClick={handleLogout} className="sidebar-link" style={{ marginTop: 'auto', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}>
            Logout
          </button>
        </nav>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="dashboard-main">
        <div className="dashboard-content-inner">
          <header className="dashboard-header">
            <div className="dashboard-welcome">
              <h1 className="dashboard-h1">
                {activeTab === 'overview' && <>Hello, <span className="gradient-text">{user?.name || user?.email}</span></>}
                {activeTab === 'profile' && <>User <span className="gradient-text">Profile</span></>}
                {activeTab === 'settings' && <>Account <span className="gradient-text">Settings</span></>}
              </h1>
              <p className="welcome-sub">
                {activeTab === 'overview' && 'Welcome back to your forensic analytics dashboard.'}
                {activeTab === 'profile' && 'Manage your personal details and role.'}
                {activeTab === 'settings' && 'Update your password and manage account security.'}
              </p>
            </div>
            <div className="user-pill glass">
              <div className="avatar">{(user?.name?.charAt(0) || user?.email.charAt(0))?.toUpperCase()}</div>
              <div className="user-info">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">{user?.role || 'Basic Tier'}</p>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="dashboard-tab">
                {/* ── Stats Grid ───────────────────────────────────────── */}
                <div className="dashboard-stats-grid">
                  {stats.map((s, i) => (
                    <motion.div 
                      key={i} 
                      className="dashboard-stat-card glass"
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <p className="stat-label">{s.label}</p>
                      <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* ── Analysis History Table ────────────────────────────── */}
                <section className="dashboard-section glass-strong">
                  <div className="section-header">
                    <h2 className="dashboard-h2">Recent Analysis</h2>
                    <Link to="/analyzer" className="hero-cta" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>New Scan</Link>
                  </div>
                  <div className="table-wrapper">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Confidence</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, i) => (
                          <tr key={i}>
                            <td className="file-name-cell">{h.name}</td>
                            <td className="date-cell">{h.date}</td>
                            <td>
                              <span className={`status-tag ${h.status.toLowerCase()}`}>
                                {h.status}
                              </span>
                            </td>
                            <td className="confidence-cell">{h.confidence}</td>
                            <td><button className="view-btn">View Result</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="dashboard-tab">
                <section className="dashboard-section glass-strong" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="dashboard-h2">{isEditingProfile ? 'Complete Your Profile' : 'Profile Details'}</h2>
                    {!isEditingProfile && (
                      <button className="view-btn" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                    )}
                  </div>
                  
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                        <input
                          type="text"
                          className="auth-input glass"
                          placeholder="Your Name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                        <input
                          type="email"
                          className="auth-input glass"
                          value={user?.email}
                          disabled
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Role / Profession (Optional)</label>
                        <input
                          type="text"
                          className="auth-input glass"
                          placeholder="E.g. Analyst"
                          value={profileData.role}
                          onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="hero-cta">Save Changes</button>
                        {user?.isProfileComplete && (
                          <button type="button" className="hero-cta secondary" onClick={() => {
                            setProfileData({ name: user?.name || '', role: user?.role || '' })
                            setIsEditingProfile(false)
                          }}>Cancel</button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <p className="stat-label">Full Name</p>
                        <p className="dashboard-h3" style={{ margin: 0 }}>{user?.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="stat-label">Email Address</p>
                        <p className="dashboard-h3" style={{ margin: 0 }}>{user?.email}</p>
                      </div>
                      <div>
                        <p className="stat-label">Role</p>
                        <p className="dashboard-h3" style={{ margin: 0 }}>{user?.role || 'Not provided'}</p>
                      </div>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="dashboard-tab">
                <section className="dashboard-section glass-strong" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
                  <h2 className="dashboard-h2" style={{ marginBottom: '1.5rem' }}>Change Password</h2>
                  <form onSubmit={handlePassChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                      <input
                        type="password"
                        className="auth-input glass"
                        placeholder="••••••••"
                        value={passData.oldPass}
                        onChange={(e) => setPassData({ ...passData, oldPass: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                      <input
                        type="password"
                        className="auth-input glass"
                        placeholder="••••••••"
                        value={passData.newPass}
                        onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <button type="submit" className="hero-cta" style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>Update Password</button>
                    </div>
                  </form>
                </section>

                <section className="dashboard-section glass-strong" style={{ maxWidth: '600px', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <h2 className="dashboard-h2" style={{ color: '#ef4444', marginBottom: '1rem' }}>Danger Zone</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button onClick={handleDeleteAccount} className="hero-cta" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'none' }}>
                    Delete Account
                  </button>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
