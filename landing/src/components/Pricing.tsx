import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '£99',
    period: '/month',
    setup: '£299 setup',
    desc: 'For small local businesses that want faster replies and basic lead capture.',
    features: [
      'WhatsApp FAQ assistant',
      'Basic quote questions',
      'Business hours and service info',
      'Human handoff',
      'Lead summary by email',
      'Monthly updates',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: '£199',
    period: '/month',
    setup: '£699 setup',
    desc: 'For businesses that rely on bookings, quotes, and after-hours enquiries. Everything in Starter, plus:',
    features: [
      'Advanced quote flows',
      'After-hours automation',
      'Google Sheets or CRM handoff',
      'Monthly performance report',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Managed',
    price: 'Custom',
    period: '',
    setup: 'From £1,000',
    desc: 'For businesses that want full setup, custom workflows, integrations, and ongoing optimisation.',
    features: [
      'Everything in Pro',
      'Multi-location support',
      'Custom workflows',
      'Integrations',
      'Ongoing optimisation',
    ],
    popular: false,
  },
]

export function Pricing() {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-center">
          <p className="section-label">Simple pricing</p>
          <h2 className="section-title">Start with a free trial. Pay only if it helps your business.</h2>
          <p className="section-subtitle">
            We only recommend a paid plan after the demo proves it helps you respond faster and capture more leads.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="pricing-setup">{plan.setup}</p>
              <p className="pricing-desc">{plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map((f, j) => (
                  <li key={j}><Check size={16} /> {f}</li>
                ))}
              </ul>
              <a href="#lead-form" className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-full`}>
                {plan.name === 'Managed' ? 'Talk to Us' : 'Start Free Trial'}
              </a>
            </div>
          ))}
        </div>

        <p className="pricing-reassurance">
          🔒 Cancel anytime. No long-term contracts. No card required for the trial.
        </p>
      </div>
    </section>
  )
}
