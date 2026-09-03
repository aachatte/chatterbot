import { Link } from 'react-router-dom'
import { ChatterbotLogo } from './ChatterbotLogo.jsx'
import './PublicShell.css'

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" className="public-header__brand">
          <ChatterbotLogo size={32} />
          <span>Chatterbot</span>
        </Link>
        <nav className="public-header__nav" aria-label="Main navigation">
          <Link to="/trust-center">Trust Center</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/demo">Live demo</Link>
          <Link to="/register" className="public-header__cta">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <ChatterbotLogo size={28} />
          <span>Chatterbot</span>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/safety">Safety</Link>
          <Link to="/support">Support</Link>
        </nav>
        <span>Support technology, not emergency care.</span>
      </div>
    </footer>
  )
}
