import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is this spam?',
    a: 'No. This service is designed to reply to customers who contact your business or have opted in. We do not support spam, scraped lists, or bulk cold WhatsApp campaigns.',
  },
  {
    q: 'Does it send bulk WhatsApp messages?',
    a: 'No. The AI only replies to inbound messages — customers who message your business first. We never send unsolicited bulk messages.',
  },
  {
    q: 'Do I need WhatsApp Business?',
    a: 'Yes, you need a WhatsApp Business number. This is a dedicated business number, not your personal WhatsApp.',
  },
  {
    q: 'Can I approve replies before they go live?',
    a: 'Yes. During the trial and testing phase, you and your team test everything internally. Nothing goes live to real customers until you approve it.',
  },
  {
    q: 'What happens when the assistant doesn\'t know the answer?',
    a: 'The AI will hand off to a human (you or your team) when it can\'t confidently answer. You\'re always in control.',
  },
  {
    q: 'Is this the official WhatsApp?',
    a: 'We use fast demo and pilot tooling to prove the workflow quickly. For production clients who need maximum reliability, we can help migrate to the official WhatsApp Business Platform / Cloud API.',
  },
  {
    q: 'What if I want to cancel?',
    a: 'You can cancel anytime. No long-term contracts. If you\'re on a monthly plan, cancel before your next billing date.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most businesses are set up within 2–3 days. The initial discovery call takes 15 minutes, and we handle the technical setup for you.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'faq-item-open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{faq.q}</span>
                <ChevronDown className={`faq-icon ${openIndex === i ? 'faq-icon-open' : ''}`} size={20} />
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
