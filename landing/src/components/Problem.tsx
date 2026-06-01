import { Clock, MessageSquare, Moon, HelpCircle, AlertTriangle } from 'lucide-react'

const problems = [
  {
    icon: Clock,
    title: 'You reply late and lose leads',
    desc: 'Customers message while you\'re on a job. By the time you reply, they\'ve already booked someone else.',
  },
  {
    icon: MessageSquare,
    title: 'Repetitive questions waste your time',
    desc: '"How much?" "What areas?" "When are you available?" — the same questions every single day.',
  },
  {
    icon: HelpCircle,
    title: 'Vague quote requests slow you down',
    desc: '"I need cleaning" — but you don\'t know the postcode, property type, or what service they need.',
  },
  {
    icon: Moon,
    title: 'After-hours messages get missed',
    desc: 'Customers message at 10pm expecting a reply. They don\'t get one until morning — if at all.',
  },
  {
    icon: AlertTriangle,
    title: 'You can\'t be everywhere at once',
    desc: 'One person, one phone. Every missed message is a missed booking worth £100+.',
  },
]

export function Problem() {
  return (
    <section className="section problem-section" id="problem">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">The Problem</span>
          <h2 className="section-title">Sound familiar?</h2>
          <p className="section-subtitle">
            Local businesses lose up to 40% of WhatsApp enquiries because they can\'t reply fast enough.
          </p>
        </div>
        <div className="problem-grid">
          {problems.map((p, i) => (
            <div key={i} className="problem-card">
              <div className="problem-icon"><p.icon size={28} /></div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
