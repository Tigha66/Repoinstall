import { useState } from 'react'
import { Send } from 'lucide-react'

export function LeadForm() {
  const [submitted, setSubmitted] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, open mailto with form data
    const body = Object.entries(formData)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    window.location.href = `mailto:hello@leadreply.ai?subject=WhatsApp AI Receptionist Free Trial&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="lead-form-success">
        <h3>✅ Thank you!</h3>
        <p>Your email client should open with your details. We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>Request Your Free Trial</h3>
      <p>Fill in your details and we'll set up your WhatsApp assistant demo.</p>
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
      <button type="submit" className="btn btn-primary btn-lg btn-full">
        <Send size={18} /> Request Free Trial
      </button>
      <p className="form-note">No spam. No commitment. Your data is never shared.</p>
    </form>
  )
}
