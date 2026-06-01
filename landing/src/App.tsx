import { useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { WhatWeDo } from './components/WhatWeDo'
import { Example } from './components/Example'
import { BeforeAfter } from './components/BeforeAfter'
import { PerfectFor } from './components/PerfectFor'
import { FoundingOffer } from './components/FoundingOffer'
import { Pricing } from './components/Pricing'
import { LeadForm } from './components/LeadForm'
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
        <WhatWeDo />
        <Example />
        <BeforeAfter />
        <PerfectFor />
        <FoundingOffer />
        <Pricing />
        <section className="section" id="lead-form">
          <div className="container">
            <LeadForm />
          </div>
        </section>
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
