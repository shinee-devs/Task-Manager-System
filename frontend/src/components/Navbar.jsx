import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <header className="flex h-[68px] items-center justify-between border-b border-[#e5e8e2] bg-white px-5 sm:px-8">
      <Link to="/dashboard" className="flex items-center gap-3" aria-label="Daymark dashboard">
        <span className="grid size-9 place-items-center rounded-[10px] bg-[#d9ebdf] text-[#23613b]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2">
            <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-[Manrope] text-[17px] font-extrabold tracking-[-0.03em]">daymark</span>
      </Link>
      <div className="flex items-center gap-3">
        {error && <span role="alert" className="max-w-48 text-xs text-red-700">{error}</span>}
        <span className="hidden text-sm text-[#778078] sm:block">{user?.name}</span>
        <button type="button" onClick={handleLogout} className="rounded-md border border-[#dfe4de] px-3 py-2 text-sm font-semibold text-[#4e574f] hover:bg-[#f5f7f4]">
          Log out
        </button>
      </div>
    </header>
  )
}

export default Navbar