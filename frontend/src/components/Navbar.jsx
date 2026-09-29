import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNotifications } from './NotificationProvider.jsx'
import NotificationItem from './NotificationItem.jsx'
import { useToast } from './ToastProvider.jsx'
import { getInitials } from '../lib/userUtils.js'

function Navbar({ mobileNavOpen, onMenuToggle }) {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error: notificationError, markRead, markAllRead, removeNotification } = useNotifications()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const location = useLocation()

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'My tasks',
    '/notifications': 'Notifications',
    '/profile': 'Profile & settings',
  }
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  useEffect(() => {
    if (!panelOpen) return undefined
    function handleDismiss(event) {
      if (event instanceof KeyboardEvent && event.key === 'Escape') setPanelOpen(false)
      if (event instanceof PointerEvent && !panelRef.current?.contains(event.target)) setPanelOpen(false)
    }
    document.addEventListener('keydown', handleDismiss)
    document.addEventListener('pointerdown', handleDismiss)
    return () => {
      document.removeEventListener('keydown', handleDismiss)
      document.removeEventListener('pointerdown', handleDismiss)
    }
  }, [panelOpen])

  async function handleNotificationOpen(notification) {
    try {
      if (!(notification.is_read === true || Number(notification.is_read) === 1)) {
        await markRead(notification.id)
        showToast('Notification marked as read.')
      }
      setPanelOpen(false)
      navigate(notification.task_id ? `/tasks?task=${notification.task_id}` : '/notifications')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to open notification.', 'error')
    }
  }

  async function handleMarkRead(notification) {
    try {
      await markRead(notification.id)
      showToast('Notification marked as read.')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to update notification.', 'error')
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead()
      showToast('All notifications marked as read.')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to update notifications.', 'error')
    }
  }

  async function handleDeleteNotification(notification) {
    try {
      await removeNotification(notification.id)
      showToast('Notification deleted.')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to delete notification.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-border/80 bg-white/95 px-3 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button type="button" onClick={onMenuToggle} aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="primary-navigation" aria-expanded={mobileNavOpen} className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-page focus-visible:outline-offset-0 md:hidden">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Daymark dashboard">
        <span className="grid size-8 place-items-center rounded-[9px] bg-accent text-white">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2">
            <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
          <span className="font-[Manrope] text-base font-extrabold text-ink sm:text-[17px]">daymark</span>
        </Link>
        <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />
        <span className="max-w-20 truncate text-xs font-semibold text-muted sm:max-w-none sm:text-base">{pageTitle}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <div className="relative" ref={panelRef}>
          <button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={panelOpen} aria-haspopup="dialog" onClick={() => setPanelOpen((open) => !open)} className="relative grid size-10 place-items-center rounded-lg text-accent hover:bg-accent-soft">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
          {panelOpen && (
            <div role="dialog" aria-label="Notifications" className="motion-dropdown fixed left-2 right-2 top-[72px] z-50 flex max-h-[min(75vh,38rem)] flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[min(24rem,calc(100vw-2rem))]">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                  <h2 className="font-[Manrope] font-bold text-ink">Notifications</h2>
                  <p className="mt-0.5 text-xs text-muted">{unreadCount} unread</p>
                </div>
                <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="text-xs font-semibold text-accent hover:underline disabled:text-subtle">Mark all read</button>
              </div>
              {notificationError ? <p role="alert" className="px-4 py-5 text-sm text-rose-800">{notificationError}</p>
                : loading ? <p role="status" className="px-4 py-6 text-center text-sm text-muted">Loading notifications...</p>
                  : notifications.length ? (
                    <ul className="min-h-0 overflow-y-auto">
                      {notifications.slice(0, 7).map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} compact onOpen={handleNotificationOpen} onMarkRead={handleMarkRead} onDelete={handleDeleteNotification} />
                      ))}
                    </ul>
                  ) : <p className="px-4 py-8 text-center text-sm text-muted">You’re all caught up.</p>}
              <Link to="/notifications" onClick={() => setPanelOpen(false)} className="border-t border-border px-4 py-3 text-center text-sm font-semibold text-accent hover:bg-page">View all notifications</Link>
            </div>
          )}
        </div>
        <Link to="/profile" aria-label={`Profile for ${user?.name || 'your account'}`} className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent transition hover:bg-accent-pale focus-visible:outline-offset-2">{getInitials(user?.name)}</Link>
        <span className="hidden max-w-32 truncate text-sm font-medium text-ink lg:block">{user?.name}</span>
      </div>
    </header>
  )
}

export default Navbar