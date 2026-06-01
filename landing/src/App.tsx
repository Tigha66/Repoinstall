import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { BeforeAfter } from './components/BeforeAfter'
import { Problem } from './components/Problem'
import { Solution } from './components/Solution'
import { Demo } from './components/Demo'
import { HowItWorks } from './components/HowItWorks'
import { WhoIsThisFor } from './components/WhoIsThisFor'
import { Niches } from './components/Niches'
import { Benefits } from './components/Benefits'
import { TrustSignals } from './components/TrustSignals'
import { Pricing } from './components/Pricing'
import { LeadForm } from './components/LeadForm'
import { FreeTrial } from './components/FreeTrial'
import { FAQ } from './components/FAQ'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <BeforeAfter />
        <Problem />
        <Solution />
        <Demo />
        <HowItWorks />
        <WhoIsThisFor />
        <Niches />
        <Benefits />
        <TrustSignals />
        <Pricing />
        <section className="lead-form-section" id="lead-form">
          <div className="container">
            <LeadForm />
          </div>
        </section>
        <FreeTrial />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
