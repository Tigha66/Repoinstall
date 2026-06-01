import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="container">
        <div className="final-cta-card">
          <h2>Ready to stop missing WhatsApp leads?</h2>
          <p>Get your WhatsApp receptionist set up and start turning more enquiries into booked jobs.</p>
          <a href="#lead-form" className="btn btn-primary btn-lg">
            Request Your Free Trial <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
