import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api.js'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    else if (form.name.trim().length > 100) nextErrors.name = 'Name must be 100 characters or fewer.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters for your password.'
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { name: form.name.trim(), email: form.email.trim(), password: form.password },
      })
      navigate('/login', { replace: true, state: { message: 'Account created. Sign in to continue.' } })
    } catch (error) {
      setErrors(error.fields || {})
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="motion-enter grid min-h-screen place-items-center bg-page px-5 py-10">
      <section className="w-full max-w-[420px] rounded-xl border border-border bg-white p-6 shadow-[0_8px_32px_rgba(22,51,71,0.055)] sm:p-9">
        <Link to="/dashboard" className="font-[Manrope] text-lg font-extrabold tracking-[-0.03em] text-accent">daymark</Link>
        <h1 className="mt-8 text-2xl font-bold tracking-[-0.03em]">Create your account</h1>
        <p className="mt-2 text-sm text-muted">Set up your account to organize your work.</p>
        {message && <p role="alert" className="mt-4 rounded-md bg-[#fbeceb] px-3 py-2 text-sm text-red-800">{message}</p>}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <label htmlFor="register-name" className="field-label">
            Name
            <input id="register-name" name="name" type="text" autoComplete="name" maxLength={100} value={form.name} onChange={updateField} placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} className="field-control" />
            {errors.name && <span id="register-name-error" className="field-error">{errors.name}</span>}
          </label>
          <label htmlFor="register-email" className="field-label">
            Email address
            <input id="register-email" name="email" type="email" autoComplete="email" maxLength={150} value={form.email} onChange={updateField} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} className="field-control" />
            {errors.email && <span id="register-email-error" className="field-error">{errors.email}</span>}
          </label>
          <label htmlFor="register-password" className="field-label">
            Password
            <input id="register-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} className="field-control" />
            {errors.password && <span id="register-password-error" className="field-error">{errors.password}</span>}
          </label>
          <label htmlFor="register-confirm-password" className="field-label">
            Confirm password
            <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined} className="field-control" />
            {errors.confirmPassword && <span id="register-confirm-password-error" className="field-error">{errors.confirmPassword}</span>}
          </label>
          <button type="submit" disabled={submitting} className="button-base button-primary w-full">{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Already registered? <Link to="/login" className="font-semibold text-accent">Sign in</Link></p>
      </section>
    </main>
  )
}

export default Register