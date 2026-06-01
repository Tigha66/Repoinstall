import { Zap, MessageSquareText, UserCheck, Clock, Shield, TrendingUp } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Instant Replies', desc: 'Customers get an answer in seconds, not hours. Even at midnight.' },
  { icon: MessageSquareText, title: 'Smart Qualification', desc: 'Asks the right questions — postcode, property type, service, date — so you get complete leads.' },
  { icon: UserCheck, title: 'Human Handoff', desc: 'When a customer needs a person, the AI hands off seamlessly.' },
  { icon: Clock, title: 'After-Hours Coverage', desc: 'Captures leads 24/7. No more "Sorry I missed your message."' },
  { icon: Shield, title: 'You Stay in Control', desc: 'Test with your team first. Go live only when you\'re happy.' },
  { icon: TrendingUp, title: 'Monthly Reports', desc: 'See how many leads were captured, handed off, and missed.' },
]

export function Solution() {
  return (
    <section className="section solution-section" id="solution">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The Solution</span>
          <h2 className="section-title">Your AI WhatsApp Receptionist</h2>
          <p className="section-subtitle">
            An assistant that answers enquiries, qualifies quotes, captures leads, and hands off to you — automatically.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon"><f.icon size={24} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
