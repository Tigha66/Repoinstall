import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Will this spam my customers?',
    a: 'No. LeadReply only replies to customers who contact your business first. We never send unsolicited bulk messages.',
  },
  {
    q: 'Can I take over the conversation?',
    a: 'Yes. Human handoff is included. When a serious lead is ready, you or your team can take over directly.',
  },
  {
    q: 'Do I need technical skills?',
    a: 'No. We set it up for you. You tell us about your business, and we handle the rest.',
  },
  {
    q: 'Is this for UK businesses?',
    a: 'Yes, the service is designed for UK local businesses. We understand UK postcodes, pricing, and enquiry patterns.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes. There are no long-term contracts. Cancel anytime.',
  },
  {
    q: 'Do I need a card for the free trial?',
    a: 'No. You can request a trial without adding card details.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-center">
          <p className="section-label">FAQ</p>
          <h2 className="section-title">Common questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'faq-item-open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{faq.q}</span>
                <ChevronDown className={`faq-icon ${openIndex === i ? 'faq-icon-open' : ''}`} size={18} />
              </button>
              {openIndex === i && (
                <div className="faq-answer"><p>{faq.a}</p></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
