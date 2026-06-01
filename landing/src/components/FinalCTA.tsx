import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="section final-cta-section">
      <div className="container">
        <div className="final-cta-card">
          <h2>Ready to stop missing WhatsApp leads?</h2>
          <p>Start your 7-day free trial today. See how many leads you\'ve been losing.</p>
          <div className="final-ctas">
            <a href="#pricing" className="btn btn-primary btn-lg">
              Start Free Trial <ArrowRight size={20} />
            </a>
            <a href="#demo" className="btn btn-outline btn-lg">
              See Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
