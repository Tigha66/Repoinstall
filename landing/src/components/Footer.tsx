import { MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <MessageCircle size={24} />
            <span>LeadReply AI</span>
          </div>
          <div className="footer-links">
            <a href="#how-it-works">How it works</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-contact">
            <span>hello@leadreply.ai</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LeadReply AI. All rights reserved.</p>
          <p className="footer-legal">
            We do not support spam, scraped lists, or bulk cold WhatsApp campaigns. This service is for replying to customers who contact your business or have opted in.
          </p>
        </div>
      </div>
    </footer>
  )
}
