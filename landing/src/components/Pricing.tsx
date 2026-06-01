import { Check, Star, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '£99',
    period: '/month',
    setup: '£299 setup',
    desc: 'Best for small local businesses that want faster WhatsApp replies and basic lead capture.',
    features: [
      'WhatsApp FAQ assistant',
      'Basic quote/booking questions',
      'Business hours and service info',
      'Human handoff',
      'Lead summary via email',
      'Monthly update',
      'Basic support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '£199',
    period: '/month',
    setup: '£699 setup',
    desc: 'Best for businesses that depend on bookings, quotes, and after-hours enquiries.',
    features: [
      'Everything in Starter',
      'Advanced quote flow',
      'After-hours automation',
      'Google Sheets or CRM handoff',
      'Conversation summaries',
      'Monthly performance report',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Managed',
    price: 'Custom',
    period: '',
    setup: 'From £1,000',
    desc: 'Best for multi-location businesses or those needing full setup, monitoring, and integrations.',
    features: [
      'Everything in Pro',
      'Multi-location support',
      'Custom workflows',
      'Integrations',
      'Advanced reporting',
      'Official WhatsApp Cloud API migration',
      'Managed optimization',
    ],
    cta: 'Talk to Us',
    popular: false,
  },
]

export function Pricing() {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">Start with a 7-day free trial. No card required. We only recommend a paid plan if the demo helps your business respond faster.</p>
        </div>

        {/* Founding Client Banner */}
        <div className="founding-banner">
          <Star size={20} />
          <div>
            <strong>🏆 Founding Client Offer:</strong> £149 setup + £49/month for the first 2 months. Limited to the first 5 local businesses. <a href="#lead-form">Claim your spot →</a>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="plan-setup">{plan.setup}</p>
              <p className="plan-desc">{plan.desc}</p>
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j}><Check size={16} /> {f}</li>
                ))}
              </ul>
              <a href="#lead-form" className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-lg btn-full`}>
                {plan.cta} <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>

        <div className="pricing-reassurance">
          <p>🔒 Cancel anytime. No long-term contracts. Start with a free trial — no card required.</p>
        </div>
      </div>
    </section>
  )
}
