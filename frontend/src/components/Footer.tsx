import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer glass-strong">
      <div className="container">
        <div className="footer-content">

          {/* Brand column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span>Deep<span className="gradient-text">Truth</span></span>
            </Link>
            <p className="footer-desc">
              The world's most accessible neural network for verifying digital integrity.
              Protecting digital truth through advanced CNN-based forensics.
            </p>
          </div>

          {/* Link columns */}
          <div className="footer-links">
            <div className="footer-group">
              <h4>Platform</h4>
              <Link to="/">Home</Link>
              <Link to="/analyzer">Analyzer</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="footer-group">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DeepTruth. All rights reserved.</p>
          <p>Secure · Scalable · Transparent</p>
        </div>
      </div>
    </footer>
  )
}
