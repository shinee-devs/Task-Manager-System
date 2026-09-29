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

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-[#68716a]">Checking your session...</main>
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
    <main className="grid min-h-screen place-items-center bg-[#f4f5f2] px-5 py-10">
      <section className="w-full max-w-[420px] rounded-xl border border-[#e4e8e2] bg-white p-7 sm:p-9">
        <Link to="/dashboard" className="font-[Manrope] text-lg font-extrabold tracking-[-0.03em] text-[#28623e]">daymark</Link>
        <h1 className="mt-8 text-2xl font-bold tracking-[-0.03em]">Welcome back</h1>
        <p className="mt-2 text-sm text-[#7b847c]">Sign in to continue to your workspace.</p>
        {location.state?.message && <p role="status" className="mt-4 rounded-md bg-[#edf4ee] px-3 py-2 text-sm text-[#28623e]">{location.state.message}</p>}
        {errorMessage && <p role="alert" className="mt-4 rounded-md bg-[#fbeceb] px-3 py-2 text-sm text-red-800">{errorMessage}</p>}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Email address
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.email && <span className="mt-1 block text-xs font-normal text-red-700">{errors.email}</span>}
          </label>
          <label className="block text-sm font-semibold text-[#4e574f]">
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} className="mt-2 w-full rounded-lg border border-[#dfe4de] px-3.5 py-3 font-normal outline-none placeholder:text-[#a3aaa4] focus:border-[#679477]" />
            {errors.password && <span className="mt-1 block text-xs font-normal text-red-700">{errors.password}</span>}
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-[#28623e] px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-[#7b847c]">New here? <Link to="/register" className="font-semibold text-[#28623e]">Create an account</Link></p>
      </section>
    </main>
  )
}

export default Login