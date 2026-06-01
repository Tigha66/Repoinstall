import { MessageCircle, Menu, X } from 'lucide-react'

interface HeaderProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <MessageCircle className="logo-icon" />
          <span>LeadReply</span>
        </a>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#pricing" className="nav-link" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" className="nav-link" onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="#lead-form" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>
            Start Free Trial
          </a>
        </nav>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
