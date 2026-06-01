import { ArrowRight, CheckCircle } from 'lucide-react'

export function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Stop Losing Customers Who Message You on WhatsApp</h1>
          <p className="hero-subtitle">
            LeadReply acts like your WhatsApp receptionist. It replies instantly, asks the right questions, captures the customer's details, and sends you a clean lead summary — so you can book the job faster.
          </p>
          <div className="hero-ctas">
            <a href="#lead-form" className="btn btn-primary btn-lg">
              Start Your 7-Day Free Trial <ArrowRight size={18} />
            </a>
            <a href="#example" className="btn btn-outline btn-lg">
              See How It Works
            </a>
          </div>
          <div className="hero-proof">
            <div className="hero-proof-item">
              <CheckCircle size={16} />
              <span>No spam. No bulk messaging.</span>
            </div>
            <div className="hero-proof-item">
              <CheckCircle size={16} />
              <span>Only replies to people who contact you.</span>
            </div>
            <div className="hero-proof-item">
              <CheckCircle size={16} />
              <span>Built for UK local businesses.</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-notch"></div>
            <div className="phone-header">
              <div className="phone-avatar">LR</div>
              <div>
                <div className="phone-name">LeadReply — CleanPro</div>
                <div className="phone-status">Online now</div>
              </div>
            </div>
            <div className="phone-messages">
              <div className="phone-bubble phone-bubble-left">
                Hi! 👋 Thanks for contacting CleanPro. I can help get a cleaning quote ready. What postcode is the property in?
              </div>
              <div className="phone-bubble phone-bubble-right">SW6</div>
              <div className="phone-bubble phone-bubble-left">
                Great, SW6 — we cover that area 🏠 What type of property is it — studio, flat, or house?
              </div>
              <div className="phone-bubble phone-bubble-right">2-bed flat</div>
              <div className="phone-bubble phone-bubble-left">
                Perfect. What service do you need — regular, deep clean, or end-of-tenancy?
              </div>
              <div className="phone-bubble phone-bubble-right">Deep clean</div>
              <div className="phone-bubble phone-bubble-left">
                Got it ✅ Any extras like oven, carpets, or windows? And what date works for you?
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
