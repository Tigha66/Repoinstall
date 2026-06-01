import { ArrowRight } from 'lucide-react'

export function BeforeAfter() {
  return (
    <section className="section ba-section" id="before-after">
      <div className="container">
        <div className="section-center">
          <p className="section-label">The difference</p>
          <h2 className="section-title">Before vs. After LeadReply</h2>
        </div>

        <div className="ba-grid">
          <div className="ba-card ba-before-card">
            <div className="ba-label ba-before-label">Before</div>
            <div className="ba-items">
              <div className="ba-item">
                <span className="ba-time">8:42pm</span>
                <span className="ba-text">A customer messages you: "How much for a deep clean in SW6?"</span>
              </div>
              <div className="ba-item">
                <span className="ba-time">Next morning</span>
                <span className="ba-text">You finally reply... but the customer already booked someone else.</span>
              </div>
            </div>
            <div className="ba-result ba-before-result">Lost lead. Lost booking. Customer gone.</div>
          </div>

          <div className="ba-card ba-after-card">
            <div className="ba-label ba-after-label">After</div>
            <div className="ba-items">
              <div className="ba-item">
                <span className="ba-time">8:42pm</span>
                <span className="ba-text">A customer messages you: "How much for a deep clean in SW6?"</span>
              </div>
              <div className="ba-item">
                <span className="ba-time">8:42pm</span>
                <span className="ba-text">LeadReply replies instantly. Asks for property type, service, date, and name.</span>
              </div>
              <div className="ba-item">
                <span className="ba-time">8:45pm</span>
                <span className="ba-text">Lead summary sent to your WhatsApp group. You follow up the next day.</span>
              </div>
            </div>
            <div className="ba-result ba-after-result">Lead captured. Quote sent. Booking confirmed.</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="#lead-form" className="btn btn-primary btn-lg">
            Start Your Free Trial <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
