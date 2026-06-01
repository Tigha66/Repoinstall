import { Sparkles, Scissors, Wrench, Home, UtensilsCrossed, Dumbbell } from 'lucide-react'

const niches = [
  { icon: Sparkles, title: 'Cleaning Companies', desc: 'Postcode, property type, rooms, service, extras, date — all collected automatically.' },
  { icon: Scissors, title: 'Barbers & Salons', desc: 'Service enquiries, availability checks, booking requests, and pricing.' },
  { icon: Wrench, title: 'Trades & Mechanics', desc: 'Job descriptions, location, urgency, and contact details captured.' },
  { icon: Home, title: 'Estate Agents', desc: 'Viewing requests, property enquiries, and tenant applications.' },
  { icon: UtensilsCrossed, title: 'Restaurants & Caterers', desc: 'Booking enquiries, group sizes, dietary requirements, and availability.' },
  { icon: Dumbbell, title: 'Gyms & Trainers', desc: 'Membership enquiries, trial bookings, and class schedules.' },
]

export function Niches() {
  return (
    <section className="section niches-section" id="niches">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Built for Local Business</span>
          <h2 className="section-title">Designed for your industry</h2>
          <p className="section-subtitle">
            We start with cleaning companies and are expanding to every local service business.
          </p>
        </div>
        <div className="niches-grid">
          {niches.map((n, i) => (
            <div key={i} className="niche-card">
              <div className="niche-icon"><n.icon size={24} /></div>
              <h3>{n.title}</h3>
              <p>{n.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
