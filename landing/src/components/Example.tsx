export function Example() {
  const chatMessages = [
    { side: 'left', text: 'Hi, do you do end-of-tenancy cleaning?' },
    { side: 'right', text: 'Yes, we can help with that. What postcode is the property in?' },
    { side: 'left', text: 'SW6' },
    { side: 'right', text: 'Great. What type of property is it — studio, flat, or house?' },
    { side: 'left', text: '2-bed flat' },
    { side: 'right', text: 'Perfect. Do you need any extras like oven, carpets, or windows?' },
    { side: 'left', text: 'Oven and windows' },
    { side: 'right', text: 'Thanks. What date would you like the clean done?' },
  ]

  return (
    <section className="section example-section" id="example">
      <div className="container">
        <div className="section-center">
          <p className="section-label">Example conversation</p>
          <h2 className="section-title">See how it works in practice</h2>
          <p className="section-subtitle">
            Here's a real enquiry flow for a cleaning company. The assistant collects everything you need for a quote.
          </p>
        </div>

        <div className="example-layout">
          <div className="chat-card">
            <div className="chat-card-header">
              <div className="phone-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>LR</div>
              <div>
                <div className="phone-name">LeadReply — CleanPro</div>
                <div className="phone-status">Online now</div>
              </div>
            </div>
            <div className="chat-card-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-bubble chat-bubble-${m.side}`}>
                  {m.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="lead-card">
              <h4>Lead captured</h4>
              <div className="lead-row"><span className="lead-label">Service</span><span className="lead-value">End-of-tenancy clean</span></div>
              <div className="lead-row"><span className="lead-label">Location</span><span className="lead-value">SW6</span></div>
              <div className="lead-row"><span className="lead-label">Property</span><span className="lead-value">2-bed flat</span></div>
              <div className="lead-row"><span className="lead-label">Extras</span><span className="lead-value">Oven + windows</span></div>
              <div className="lead-row"><span className="lead-label">Status</span><span className="lead-value">Ready for quote</span></div>
            </div>
            <p className="lead-note">This summary is sent to your WhatsApp group or email instantly.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
