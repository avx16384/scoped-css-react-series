import { useState } from 'react'
import { useCSS } from '@gmono/scoped-css-react'

export function ContactForm() {
  const { classes, style } = useCSS(`
    .form {
      max-width: 520px;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .field {
      margin-bottom: 1.25rem;
    }
    .label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }
    .required {
      color: #ef4444;
      margin-left: 2px;
    }
    .input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      color: #1e293b;
      background: white;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      outline: none;
    }
    .input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .input-error {
      border-color: #ef4444;
    }
    .input-error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
    .textarea {
      resize: vertical;
      min-height: 100px;
    }
    .error-text {
      display: block;
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 0.3rem;
    }
    .row {
      display: flex;
      gap: 1rem;
    }
    .row .field { flex: 1; }
    .submit-btn {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }
    .submit-btn:hover { background: #4f46e5; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-msg {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }
  `)

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!form.message.trim()) errs.message = 'Message is required'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      setSubmitted(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 4000)
    }
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div>
      {style}
      <form className={classes['form']} onSubmit={handleSubmit} noValidate>
        {submitted && <div className={classes['success-msg']}>✓ Thank you! Your message has been sent.</div>}

        <div className={classes['row']}>
          <div className={classes['field']}>
            <label className={classes['label']} htmlFor="cf-name">
              Name<span className={classes['required']}>*</span>
            </label>
            <input
              id="cf-name"
              className={`${classes['input']} ${errors.name ? classes['input-error'] : ''}`}
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.name && <span className={classes['error-text']}>{errors.name}</span>}
          </div>

          <div className={classes['field']}>
            <label className={classes['label']} htmlFor="cf-email">
              Email<span className={classes['required']}>*</span>
            </label>
            <input
              id="cf-email"
              className={`${classes['input']} ${errors.email ? classes['input-error'] : ''}`}
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="jane@example.com"
            />
            {errors.email && <span className={classes['error-text']}>{errors.email}</span>}
          </div>
        </div>

        <div className={classes['field']}>
          <label className={classes['label']} htmlFor="cf-subject">
            Subject
          </label>
          <input
            id="cf-subject"
            className={classes['input']}
            type="text"
            value={form.subject}
            onChange={(e) => update('subject', e.target.value)}
            placeholder="What is this about?"
          />
        </div>

        <div className={classes['field']}>
          <label className={classes['label']} htmlFor="cf-message">
            Message<span className={classes['required']}>*</span>
          </label>
          <textarea
            id="cf-message"
            className={`${classes['input']} ${classes['textarea']} ${errors.message ? classes['input-error'] : ''}`}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Tell us more..."
            rows={4}
          />
          {errors.message && <span className={classes['error-text']}>{errors.message}</span>}
        </div>

        <button type="submit" className={classes['submit-btn']}>Send Message</button>
      </form>
    </div>
  )
}
