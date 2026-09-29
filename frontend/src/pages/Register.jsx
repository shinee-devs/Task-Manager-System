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
    <main className="grid min-h-screen place-items-center bg-[#f4f5f2] px-5 py-10">
      <section className="w-full max-w-[420px] rounded-xl border border-[#e4e8e2] bg-white p-7 sm:p-9">
        <Link to="/dashboard" className="font-[Manrope] text-lg font-extrabold tracking-[-0.03em] text-[#28623e]">daymark</Link>
        <h1 className="mt-8 text-2xl font-bold tracking-[-0.03em]">Create your account</h1>
        <p className="mt-2 text-sm text-[#7b847c]">Set up your account to organize your work.</p>
        {message && <p role="alert" className="mt-4 rounded-md bg-[#fbeceb] px-3 py-2 text-sm text-red-800">{message}</p>}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Name
            <input name="name" type="text" autoComplete="name" maxLength={100} value={form.name} onChange={updateField} placeholder="Your name" aria-invalid={Boolean(errors.name)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.name && <span className="mt-1 block text-xs font-normal text-red-700">{errors.name}</span>}
          </label>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Email address
            <input name="email" type="email" autoComplete="email" maxLength={150} value={form.email} onChange={updateField} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.email && <span className="mt-1 block text-xs font-normal text-red-700">{errors.email}</span>}
          </label>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Password
            <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.password && <span className="mt-1 block text-xs font-normal text-red-700">{errors.password}</span>}
          </label>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Confirm password
            <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" aria-invalid={Boolean(errors.confirmPassword)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.confirmPassword && <span className="mt-1 block text-xs font-normal text-red-700">{errors.confirmPassword}</span>}
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#28623e] px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#7b847c]">Already registered? <Link to="/login" className="font-semibold text-[#28623e]">Sign in</Link></p>
      </section>
    </main>
  )
}

export default Register