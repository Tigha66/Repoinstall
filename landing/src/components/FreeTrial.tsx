import { CheckCircle, ArrowRight } from 'lucide-react'

export function FreeTrial() {
  return (
    <section className="section free-trial-section" id="free-trial">
      <div className="container">
        <div className="free-trial-card">
          <div className="free-trial-content">
            <h2>Try it free for 7 days</h2>
            <p>Full demo setup. No card required. No commitment.</p>
            <ul className="trial-features">
              <li><CheckCircle size={18} /> WhatsApp assistant demo setup</li>
              <li><CheckCircle size={18} /> FAQ/quote flow based on your business</li>
              <li><CheckCircle size={18} /> Test with your staff before going live</li>
              <li><CheckCircle size={18} /> Lead capture demo</li>
              <li><CheckCircle size={18} /> Human handoff demo</li>
            </ul>
            <a href="#pricing" className="btn btn-primary btn-lg">
              Start 7-Day Free Trial <ArrowRight size={20} />
            </a>
          </div>
          <div className="free-trial-note">
            <p><strong>Free trial is for demo/pilot use only.</strong></p>
            <p>No spam. No bulk cold messaging. Only replies to customers who message your business or have opted in. Your WhatsApp Business number is connected only after you agree to a pilot.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
