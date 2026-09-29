import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-muted">Checking your session...</main>
  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    setErrorMessage('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrors(error.fields || {})
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="motion-enter grid min-h-screen place-items-center bg-page px-5 py-10">
      <section className="w-full max-w-[420px] rounded-xl border border-border bg-white p-6 shadow-[0_8px_32px_rgba(22,51,71,0.055)] sm:p-9">
        <Link to="/dashboard" className="font-[Manrope] text-lg font-extrabold tracking-[-0.03em] text-accent">daymark</Link>
        <h1 className="mt-8 text-2xl font-bold tracking-[-0.03em]">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to continue to your workspace.</p>
        {location.state?.message && <p role="status" className="mt-4 rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">{location.state.message}</p>}
        {errorMessage && <p role="alert" className="mt-4 rounded-md bg-[#fbeceb] px-3 py-2 text-sm text-red-800">{errorMessage}</p>}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email" className="field-label">
            Email address
            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} className="field-control" />
            {errors.email && <span id="login-email-error" className="field-error">{errors.email}</span>}
          </label>
          <label htmlFor="login-password" className="field-label">
            Password
            <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} className="field-control" />
            {errors.password && <span id="login-password-error" className="field-error">{errors.password}</span>}
          </label>
          <button type="submit" disabled={submitting} className="button-base button-primary w-full">{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">New here? <Link to="/register" className="font-semibold text-accent">Create an account</Link></p>
      </section>
    </main>
  )
}

export default Login