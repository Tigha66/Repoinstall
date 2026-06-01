export function Demo() {
  const messages = [
    { side: 'left', text: 'Hi! 👋 Thanks for contacting CleanPro. I can help get a cleaning quote ready. What postcode is the property in?' },
    { side: 'right', text: 'SW6' },
    { side: 'left', text: 'Great, SW6 — we cover that area 🏠 Is it a flat, house, office, or commercial property?' },
    { side: 'right', text: '2-bed flat' },
    { side: 'left', text: 'Perfect! How many bathrooms?' },
    { side: 'right', text: '1' },
    { side: 'left', text: 'What type of cleaning do you need?\n\n1️⃣ Regular cleaning\n2️⃣ Deep cleaning\n3️⃣ End-of-tenancy\n4️⃣ After-builders' },
    { side: 'right', text: 'Deep cleaning' },
    { side: 'left', text: 'Any extras? Oven, carpets, windows, fridge?' },
    { side: 'right', text: 'Oven and windows' },
    { side: 'left', text: 'What date works best for you? And could I get your name and number?' },
    { side: 'right', text: 'Friday. Sarah, 07700 900123' },
  ]

  return (
    <section className="section demo-section" id="demo">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Live Demo</span>
          <h2 className="section-title">See it in action</h2>
          <p className="section-subtitle">
            This is a real conversation flow for a cleaning company. The AI collects everything you need for a quote.
          </p>
        </div>
        <div className="demo-layout">
          <div className="chat-mockup chat-mockup-large">
            <div className="chat-header">
              <div className="chat-avatar">LR</div>
              <div>
                <div className="chat-name">LeadReply AI — CleanPro</div>
                <div className="chat-status">Online now</div>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble chat-bubble-${m.side}`}>
                  {m.text.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="lead-summary">
            <h3>📋 Lead Summary</h3>
            <div className="lead-card">
              <div className="lead-row"><span className="lead-label">Name</span><span className="lead-value">Sarah</span></div>
              <div className="lead-row"><span className="lead-label">Contact</span><span className="lead-value">07700 900123</span></div>
              <div className="lead-row"><span className="lead-label">Postcode</span><span className="lead-value">SW6</span></div>
              <div className="lead-row"><span className="lead-label">Property</span><span className="lead-value">2-bed flat, 1 bath</span></div>
              <div className="lead-row"><span className="lead-label">Service</span><span className="lead-value">Deep cleaning</span></div>
              <div className="lead-row"><span className="lead-label">Extras</span><span className="lead-value">Oven + windows</span></div>
              <div className="lead-row"><span className="lead-label">Date</span><span className="lead-value">Friday</span></div>
            </div>
            <p className="lead-note">This summary is sent to your WhatsApp group or email instantly.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
