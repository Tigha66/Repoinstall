import { X, Check, ArrowRight } from 'lucide-react'

export function BeforeAfter() {
  return (
    <section className="section before-after-section" id="before-after">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The Difference</span>
          <h2 className="section-title">Before vs. After LeadReply AI</h2>
        </div>
        <div className="ba-grid">
          <div className="ba-card ba-before">
            <div className="ba-label ba-label-before">❌ Before</div>
            <div className="ba-timeline">
              <div className="ba-item">
                <div className="ba-time">8:42pm</div>
                <div className="ba-text">Customer messages: "How much for a deep clean in SW6?"</div>
              </div>
              <div className="ba-item">
                <div className="ba-time">Next morning</div>
                <div className="ba-text">You finally reply... but the customer already booked someone else.</div>
              </div>
              <div className="ba-item">
                <div className="ba-time">Result</div>
                <div className="ba-text ba-lost">Lost lead. Lost £150+ booking. Customer gone.</div>
              </div>
            </div>
            <div className="ba-summary ba-summary-before">
              <X size={18} /> <span>Slow replies = lost customers</span>
            </div>
          </div>

          <div className="ba-card ba-after">
            <div className="ba-label ba-label-after">✅ After</div>
            <div className="ba-timeline">
              <div className="ba-item">
                <div className="ba-time">8:42pm</div>
                <div className="ba-text">Customer messages: "How much for a deep clean in SW6?"</div>
              </div>
              <div className="ba-item">
                <div className="ba-time">8:42pm</div>
                <div className="ba-text">AI replies instantly. Asks postcode, property type, service, date, name.</div>
              </div>
              <div className="ba-item">
                <div className="ba-time">8:45pm</div>
                <div className="ba-text">Lead summary sent to your WhatsApp group. Human follows up next day.</div>
              </div>
              <div className="ba-item">
                <div className="ba-time">Result</div>
                <div className="ba-text ba-won">Lead captured. Quote sent. Booking confirmed.</div>
              </div>
            </div>
            <div className="ba-summary ba-summary-after">
              <Check size={18} /> <span>Instant replies = more bookings</span>
            </div>
          </div>
        </div>
        <div className="ba-cta">
          <a href="#lead-form" className="btn btn-primary btn-lg">
            Start Your Free Trial <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}
