import { useState } from 'react'
import { Send, CheckCircle, MessageCircle } from 'lucide-react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwdqjkl'

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    whatsapp: '',
    businessType: '',
    website: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _subject: `WhatsApp AI Receptionist — ${formData.businessName}`,
        }),
      })
      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="lead-form-success">
        <div className="success-icon"><CheckCircle size={48} /></div>
        <h3>Thanks — we've received your request</h3>
        <p>We'll review your business and contact you within 24 hours to set up your WhatsApp AI receptionist demo.</p>
        <div className="success-next">
          <h4>What happens next:</h4>
          <ol>
            <li>We review your business and common WhatsApp questions</li>
            <li>We build your demo assistant with your services, prices, and areas</li>
            <li>We send you a test link to try with your team</li>
            <li>If you're happy, we go live — only real customers see it</li>
          </ol>
        </div>
        <a href="mailto:hello@leadreply.ai?subject=WhatsApp AI Receptionist — Quick Question" className="btn btn-outline btn-lg">
          <MessageCircle size={18} /> Prefer email? Contact us directly
        </a>
      </div>
    )
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>Request Your Free Trial</h3>
      <p>Fill in your details and we'll set up your WhatsApp assistant demo.</p>

      {error && (
        <div className="form-error">
          <p>⚠️ Something went wrong. Please try again or email us directly at <a href="mailto:hello@leadreply.ai">hello@leadreply.ai</a></p>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="businessName">Business Name *</label>
          <input id="businessName" name="businessName" required placeholder="e.g. Sparkle Clean" value={formData.businessName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="contactName">Your Name *</label>
          <input id="contactName" name="contactName" required placeholder="e.g. Sarah" value={formData.contactName} onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" required placeholder="sarah@sparkleclean.co.uk" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="whatsapp">WhatsApp Business Number *</label>
          <input id="whatsapp" name="whatsapp" required placeholder="e.g. 447700900123" value={formData.whatsapp} onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="businessType">Business Type *</label>
          <select id="businessType" name="businessType" required value={formData.businessType} onChange={handleChange}>
            <option value="">Select...</option>
            <option value="cleaning">Cleaning Company</option>
            <option value="barber-salon">Barber / Salon</option>
            <option value="garage-mechanic">Garage / Mechanic</option>
            <option value="trades">Trades (Plumber, Electrician, Roofer)</option>
            <option value="estate-agent">Estate Agent / Letting</option>
            <option value="restaurant-caterer">Restaurant / Caterer</option>
            <option value="gym-trainer">Gym / Personal Trainer</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="website">Website / Instagram</label>
          <input id="website" name="website" placeholder="https://..." value={formData.website} onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="message">Anything else we should know?</label>
        <textarea id="message" name="message" rows={3} placeholder="Tell us about your business, how many WhatsApp enquiries you get, etc." value={formData.message} onChange={handleChange} />
      </div>
      <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting}>
        {submitting ? 'Submitting...' : <><Send size={18} /> Request Free Trial</>}
      </button>
      <p className="form-note">No spam. No commitment. Your data is never shared. We only reply to customers who contact you.</p>
    </form>
  )
}
