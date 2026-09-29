import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useToast } from '../components/ToastProvider.jsx'
import { changePassword, getProfile, updateProfile } from '../lib/profile.js'
import { formatAccountDate, getInitials } from '../lib/userUtils.js'

function Profile() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [nameError, setNameError] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let active = true
    getProfile()
      .then((result) => {
        if (!active) return
        setProfile(result)
        setName(result.name)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function handleNameSave(event) {
    event.preventDefault()
    const nextName = name.trim()
    if (!nextName || nextName.length > 100) {
      setNameError(!nextName ? 'Name is required.' : 'Name must be 100 characters or fewer.')
      return
    }
    setSavingName(true)
    setNameError('')
    try {
      const result = await updateProfile(nextName)
      setProfile(result.profile)
      updateUser(result.user)
      showToast('Profile name updated.')
    } catch (requestError) {
      setNameError(requestError.fields?.name || requestError.message || 'Unable to update profile.')
      showToast(requestError.message || 'Unable to update profile.', 'error')
    } finally {
      setSavingName(false)
    }
  }

  function updatePasswordField(event) {
    const { name: field, value } = event.target
    setPassword((current) => ({ ...current, [field]: value }))
    setPasswordErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handlePasswordSave(event) {
    event.preventDefault()
    const errors = {}
    if (!password.current_password) errors.current_password = 'Enter your current password.'
    if (password.new_password.length < 8) errors.new_password = 'Use at least 8 characters.'
    if (password.new_password !== password.confirm_password) errors.confirm_password = 'Passwords do not match.'
    setPasswordErrors(errors)
    if (Object.keys(errors).length) return

    setSavingPassword(true)
    try {
      await changePassword(password)
      setPassword({ current_password: '', new_password: '', confirm_password: '' })
      showToast('Password changed successfully.')
    } catch (requestError) {
      setPasswordErrors(requestError.fields || {})
      showToast(requestError.message || 'Unable to change password.', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <div role="status" className="mx-auto max-w-3xl space-y-4"><div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" /><div className="h-48 animate-pulse rounded-xl bg-white" /><div className="h-64 animate-pulse rounded-xl bg-white" /></div>

  return (
    <div className="motion-enter mx-auto max-w-3xl">
      <header className="mb-7">
        <p className="mb-2 text-sm font-semibold text-muted">Account</p>
        <h1 className="font-[Manrope] text-3xl font-bold text-ink">Profile &amp; settings</h1>
        <p className="mt-2 text-sm text-muted">Manage your account details and sign-in credentials.</p>
      </header>

      {error && <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}

      <section aria-labelledby="profile-details-title" className="mb-5 rounded-xl border border-border bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-4 border-b border-border-soft pb-5">
          <span aria-label={`${getInitials(profile?.name)} initials`} className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-[Manrope] text-lg font-extrabold text-accent">{getInitials(profile?.name)}</span>
          <div className="min-w-0">
            <h2 id="profile-details-title" className="font-[Manrope] text-lg font-bold text-ink">Personal details</h2>
            <p className="break-all text-sm text-muted">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleNameSave} className="space-y-5">
          <label className="block text-sm font-semibold text-ink">
            Full name
            <input name="name" autoComplete="name" maxLength={100} value={name} onChange={(event) => { setName(event.target.value); setNameError('') }} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'profile-name-error' : undefined} className="field-control" />
            {nameError && <span id="profile-name-error" className="mt-1 block text-sm font-medium text-rose-800">{nameError}</span>}
          </label>
          <dl className="grid gap-4 border-t border-border-soft pt-5 sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase text-subtle">Email address</dt><dd className="mt-1 break-all text-sm text-ink">{profile?.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-subtle">Member since</dt><dd className="mt-1 text-sm text-ink">{formatAccountDate(profile?.created_at)}</dd></div>
          </dl>
          <div className="flex justify-end border-t border-border-soft pt-5">
            <button type="submit" disabled={savingName || !profile || name.trim() === profile.name} className="button-base button-primary">{savingName ? 'Saving...' : 'Save profile'}</button>
          </div>
        </form>
      </section>

      <section aria-labelledby="change-password-title" className="rounded-xl border border-border bg-white p-5 sm:p-7">
        <div className="mb-5">
          <h2 id="change-password-title" className="font-[Manrope] text-lg font-bold text-ink">Change password</h2>
          <p className="mt-1 text-sm text-muted">Choose a password with at least 8 characters.</p>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            ['current_password', 'Current password', 'current-password'],
            ['new_password', 'New password', 'new-password'],
            ['confirm_password', 'Confirm new password', 'new-password'],
          ].map(([field, label, autocomplete]) => (
            <label key={field} className="block text-sm font-semibold text-ink">
              {label}
              <input id={`${field}-input`} name={field} type="password" autoComplete={autocomplete} value={password[field]} onChange={updatePasswordField} aria-invalid={Boolean(passwordErrors[field])} aria-describedby={passwordErrors[field] ? `${field}-error` : undefined} className="field-control" />
              {passwordErrors[field] && <span id={`${field}-error`} className="mt-1 block text-sm font-medium text-rose-800">{passwordErrors[field]}</span>}
            </label>
          ))}
          <div className="flex justify-end border-t border-border-soft pt-5">
            <button type="submit" disabled={savingPassword} className="button-base button-primary">{savingPassword ? 'Updating...' : 'Update password'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Profile