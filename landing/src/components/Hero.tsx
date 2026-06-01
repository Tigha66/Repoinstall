import { ArrowRight, CheckCircle, MessageCircle } from 'lucide-react'

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">✨ 7-Day Free Trial — No Card Required</div>
          <h1 className="hero-title">Turn Missed WhatsApp Messages Into Booked Jobs</h1>
          <p className="hero-subtitle">
            We set up an AI WhatsApp receptionist for your local business so customers get instant replies, quotes get qualified, and serious leads reach you faster — even at 11pm.
          </p>
          <div className="hero-ctas">
            <a href="#lead-form" className="btn btn-primary btn-lg">
              Start 7-Day Free Trial <ArrowRight size={20} />
            </a>
            <a href="#demo" className="btn btn-outline btn-lg">
              <MessageCircle size={20} /> See Demo
            </a>
          </div>
          <div className="hero-trust">
            <CheckCircle size={18} />
            <span>No spam. No bulk messaging. Only replies to customers who contact you.</span>
          </div>
          <div className="hero-founding">
            <strong>🏆 Founding Client Offer:</strong> £149 setup + £49/month for your first 2 months. Limited to 5 local businesses.
          </div>
        </div>
        <div className="hero-visual">
          <div className="chat-mockup">
            <div className="chat-header">
              <div className="chat-avatar">LR</div>
              <div>
                <div className="chat-name">LeadReply AI</div>
                <div className="chat-status">Online now</div>
              </div>
            </div>
            <div className="chat-messages">
              <div className="chat-bubble chat-bubble-left">
                Hi! 👋 Thanks for contacting CleanPro. I can help get a cleaning quote ready. What postcode is the property in?
              </div>
              <div className="chat-bubble chat-bubble-right">SW6</div>
              <div className="chat-bubble chat-bubble-left">
                Great, SW6 — we cover that area 🏠 What type of property is it?
              </div>
              <div className="chat-bubble chat-bubble-right">2-bed flat</div>
              <div className="chat-bubble chat-bubble-left">
                Perfect! What service do you need — regular, deep clean, or end-of-tenancy?
              </div>
              <div className="chat-bubble chat-bubble-right">Deep clean</div>
              <div className="chat-bubble chat-bubble-left">
                Got it ✅ Any extras like oven, carpets, or windows? And what date works for you?
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
