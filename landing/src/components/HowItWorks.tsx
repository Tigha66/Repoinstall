import { ClipboardList, Settings, TestTube, Rocket } from 'lucide-react'

const steps = [
  { icon: ClipboardList, num: '01', title: 'We learn your business', desc: 'You tell us your services, prices, areas, and FAQs. Takes about 15 minutes.' },
  { icon: Settings, num: '02', title: 'We set up your assistant', desc: 'We configure the AI with your business info, quote flow, and lead capture.' },
  { icon: TestTube, num: '03', title: 'You test it with your team', desc: 'Try it internally first. Make sure it works exactly how you want.' },
  { icon: Rocket, num: '04', title: 'It starts capturing leads', desc: 'Go live and start receiving qualified leads — even while you sleep.' },
]

export function HowItWorks() {
  return (
    <section className="section how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Up and running in days, not weeks</h2>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <div className="step-icon"><s.icon size={28} /></div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
