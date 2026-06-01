import { ArrowRight } from 'lucide-react'

export function FoundingOffer() {
  return (
    <section className="founding-section">
      <div className="container">
        <div className="founding-card">
          <h2>Founding Client Offer</h2>
          <p className="founding-subtitle">
            We're setting up WhatsApp receptionists for the first 5 local businesses at a reduced launch price.
          </p>
          <div className="founding-details">
            <div className="founding-detail">
              <div className="detail-label">Setup fee</div>
              <div className="detail-value">£149</div>
            </div>
            <div className="founding-detail">
              <div className="detail-label">First 2 months</div>
              <div className="detail-value">£49/mo</div>
            </div>
            <div className="founding-detail">
              <div className="detail-label">After that</div>
              <div className="detail-value">Normal rate</div>
            </div>
          </div>
          <a href="#lead-form" className="btn btn-lg" style={{ background: '#92400e', color: '#fff' }}>
            Claim Your Spot <ArrowRight size={18} />
          </a>
          <p className="founding-note">No long-term contract. No card required for the trial. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}
