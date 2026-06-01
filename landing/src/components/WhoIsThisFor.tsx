import { MessageCircle, Clock, HelpCircle, Users } from 'lucide-react'

const criteria = [
  { icon: MessageCircle, title: 'You receive enquiries on WhatsApp', desc: 'Customers message you about prices, availability, or bookings.' },
  { icon: Clock, title: 'You miss messages while working', desc: 'You can\'t reply instantly when you\'re on a job or off the clock.' },
  { icon: HelpCircle, title: 'You get repetitive questions every day', desc: '"How much?" "What areas?" "When are you available?" — over and over.' },
  { icon: Users, title: 'You want faster replies without hiring staff', desc: 'One person can\'t be everywhere. AI handles the routine so you don\'t have to.' },
]

export function WhoIsThisFor() {
  return (
    <section className="section who-section" id="who">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Is this for you?</span>
          <h2 className="section-title">Perfect for local businesses that...</h2>
        </div>
        <div className="who-grid">
          {criteria.map((c, i) => (
            <div key={i} className="who-card">
              <div className="who-icon"><c.icon size={24} /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
