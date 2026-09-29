import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { useToast } from './ToastProvider.jsx'
import useEscapeKey from '../hooks/useEscapeKey.js'
import useDialogFocus from '../hooks/useDialogFocus.js'

const links = [
  { to: '/dashboard', label: 'Overview', icon: 'grid' },
  { to: '/tasks', label: 'My tasks', icon: 'check' },
  { to: '/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/profile', label: 'Profile & settings', icon: 'profile' },
]

function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const drawerRef = useRef(null)
  useEscapeKey(onClose, mobileOpen)
  useDialogFocus(drawerRef, mobileOpen)

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      showToast(error.message || 'Unable to log out.', 'error')
    }
  }

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation menu" onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/30 md:hidden" />}
      <aside ref={drawerRef} id="primary-navigation" role={mobileOpen ? 'dialog' : undefined} aria-label={mobileOpen ? 'Main navigation menu' : undefined} aria-modal={mobileOpen || undefined} tabIndex={-1} className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-[60] flex w-72 max-w-[85vw] translate-x-0 shadow-xl' : 'hidden -translate-x-full'} flex-col bg-white px-4 py-4 transition-transform duration-200 motion-reduce:transition-none md:sticky md:top-16 md:flex md:h-[calc(100vh-4rem)] md:w-[232px] md:shrink-0 md:translate-x-0 md:rounded-r-lg md:shadow-[2px_0_20px_rgba(26,72,98,0.035)] md:px-5 md:py-8`}>
      <div className="mb-5 flex items-center justify-between px-2 md:hidden">
        <span className="text-xs font-bold uppercase text-subtle">Navigation</span>
        <button type="button" onClick={onClose} aria-label="Close navigation menu" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-page">×</button>
      </div>
      <p className="hidden px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-subtle md:block">Workspace</p>
      <nav aria-label="Main navigation" className="flex gap-1.5 md:flex-col">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-offset-0 ${isActive ? 'bg-accent-soft text-accent shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-muted hover:bg-page hover:text-ink'}`}
          >
            {icon === 'grid' ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.6">
                <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" />
                <rect x="3" y="12" width="5" height="5" rx="1" /><rect x="12" y="12" width="5" height="5" rx="1" />
              </svg>
            ) : icon === 'bell' ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 7a5 5 0 0 0-10 0c0 5.8-2.5 5.8-2.5 7.5h15C17.5 12.8 15 12.8 15 7M8 18h4" />
              </svg>
            ) : icon === 'profile' ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="6.5" r="3" /><path d="M4 17c.6-3 2.5-4.5 6-4.5s5.4 1.5 6 4.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.7">
                <circle cx="10" cy="10" r="7" /><path d="m6.7 10.2 2.1 2.1 4.6-4.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-border-soft px-3 pt-4 md:mt-auto md:pt-5">
        <p className="mb-3 hidden text-xs leading-5 text-subtle md:block">Your tasks, gathered in one calm place.</p>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-offset-0">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8M12.5 6.5 16 10l-3.5 3.5M7 10h9" /></svg>
          Log out
        </button>
      </div>
      </aside>
    </>
  )
}

export default Sidebar