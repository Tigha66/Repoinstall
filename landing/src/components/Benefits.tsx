import { Zap, Target, Clock, Shield, Moon, Users } from 'lucide-react'

const benefits = [
  { icon: Zap, title: 'Reply Instantly', desc: 'Customers get an answer in seconds — even at 2am.' },
  { icon: Target, title: 'Capture Better Leads', desc: 'Every enquiry is qualified with the right questions.' },
  { icon: Clock, title: 'Reduce Admin', desc: 'No more typing out the same answers over and over.' },
  { icon: Shield, title: 'Improve Experience', desc: 'Fast, professional replies make your business look sharp.' },
  { icon: Moon, title: 'Work After Hours', desc: 'Leads are captured 24/7, even when you\'re off the clock.' },
  { icon: Users, title: 'Keep Human Control', desc: 'AI handles the routine. Humans handle the complex. Best of both.' },
]

export function Benefits() {
  return (
    <section className="section benefits-section" id="benefits">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Why LeadReply AI</span>
          <h2 className="section-title">More leads. Less stress.</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className="benefit-card">
              <div className="benefit-icon"><b.icon size={24} /></div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
