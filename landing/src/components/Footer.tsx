import { MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <MessageCircle size={20} />
            <span>LeadReply</span>
          </div>
          <div className="footer-links">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#lead-form">Start free trial</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LeadReply. All rights reserved.</p>
          <p className="footer-legal">
            LeadReply only replies to customers who contact your business. We do not support spam, scraped lists, or bulk cold messaging.
          </p>
        </div>
      </div>
    </footer>
  )
}
