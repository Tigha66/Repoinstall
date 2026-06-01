export function PerfectFor() {
  const businesses = [
    'Cleaning companies',
    'Barbers and salons',
    'Garages and mechanics',
    'Plumbers, electricians, roofers, and trades',
    'Estate agents and letting agents',
    'Restaurants and caterers',
    'Gyms and personal trainers',
    'Other local service businesses',
  ]

  return (
    <section className="section perfect-section" id="perfect-for">
      <div className="container">
        <div className="section-center">
          <p className="section-label">Built for busy local businesses</p>
          <h2 className="section-title">Perfect for businesses that get WhatsApp enquiries</h2>
          <p className="section-subtitle">
            LeadReply is designed for UK local service businesses where customers message to ask about prices, availability, or bookings.
          </p>
        </div>
        <div className="perfect-tags">
          {businesses.map((b, i) => (
            <span key={i} className="perfect-tag">{b}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
