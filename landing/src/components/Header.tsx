import { MessageCircle, Menu, X } from 'lucide-react'

interface HeaderProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const navLinks = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#demo', label: 'Demo' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ]

  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <MessageCircle className="logo-icon" size={28} />
          <span className="logo-text">LeadReply AI</span>
        </a>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#pricing" className="btn btn-primary btn-sm nav-cta">
            Start Free Trial
          </a>
        </nav>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
