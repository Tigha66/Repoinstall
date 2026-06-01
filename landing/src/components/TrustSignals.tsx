import { MessageCircle, Clock, Users, HelpCircle, Briefcase, Shield } from 'lucide-react'

const signals = [
  { icon: Shield, text: 'No spam or bulk messaging' },
  { icon: MessageCircle, text: 'Only replies to customers who contact you' },
  { icon: Users, text: 'Human handoff included — you stay in control' },
  { icon: Clock, text: 'Cancel anytime — no long-term contracts' },
  { icon: Briefcase, text: 'Built for UK local businesses' },
  { icon: HelpCircle, text: 'GDPR-conscious setup — your data is safe' },
]

export function TrustSignals() {
  return (
    <section className="section trust-section" id="trust">
      <div className="container">
        <div className="trust-grid">
          {signals.map((s, i) => (
            <div key={i} className="trust-item">
              <s.icon size={20} />
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
