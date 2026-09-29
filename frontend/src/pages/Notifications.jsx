import useDeadlineClock from '../hooks/useDeadlineClock.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationItem from '../components/NotificationItem.jsx'
import { useNotifications } from '../components/NotificationProvider.jsx'
import { useToast } from '../components/ToastProvider.jsx'

const notificationFilters = ['All', 'Unread', 'Read']

function Notifications() {
  useDeadlineClock()
  const { notifications, unreadCount, loading, error, refreshNotifications, markRead, markAllRead, removeNotification } = useNotifications()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [busyId, setBusyId] = useState(null)
  const visibleNotifications = notifications.filter((notification) => {
    const isRead = notification.is_read === true || Number(notification.is_read) === 1
    return filter === 'All' || (filter === 'Read' ? isRead : !isRead)
  })

  async function handleOpen(notification) {
    try {
      if (!(notification.is_read === true || Number(notification.is_read) === 1)) {
        await markRead(notification.id)
        showToast('Notification marked as read.')
      }
      if (notification.task_id) navigate(`/tasks?task=${notification.task_id}`)
    } catch (requestError) {
      showToast(requestError.message || 'Unable to open notification.', 'error')
    }
  }

  async function handleMarkRead(notification) {
    setBusyId(notification.id)
    try {
      await markRead(notification.id)
      showToast('Notification marked as read.')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to update notification.', 'error')
    } finally {
      setBusyId(null)
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

  async function handleDelete(notification) {
    setBusyId(notification.id)
    try {
      await removeNotification(notification.id)
      showToast('Notification deleted.')
    } catch (requestError) {
      showToast(requestError.message || 'Unable to delete notification.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="motion-enter mx-auto max-w-[1040px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Your workspace</p>
          <h1 className="font-[Manrope] text-3xl font-bold text-ink">Notifications</h1>
          <p className="mt-2 text-sm text-muted">Task reminders and activity from your workspace.</p>
        </div>
        <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0 || loading} className="button-base button-secondary text-accent">Mark All as Read</button>
      </div>

      {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={refreshNotifications} className="font-semibold underline">Try again</button></div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter notifications" className="inline-flex flex-wrap rounded-lg border border-border bg-white p-1">
          {notificationFilters.map((value) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`min-h-10 rounded-md px-3 py-2 text-sm font-semibold transition duration-150 focus-visible:outline-offset-0 motion-reduce:transition-none ${filter === value ? 'bg-accent text-white' : 'text-muted hover:bg-page'}`}>{value}</button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">{unreadCount} unread</p>
      </div>

      <section aria-label="Notification list" className="overflow-hidden rounded-xl border border-border bg-white">
        {loading ? <p role="status" className="px-5 py-10 text-center text-sm text-muted">Loading notifications...</p>
          : visibleNotifications.length > 0 ? (
            <ul>{visibleNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onOpen={handleOpen} onMarkRead={handleMarkRead} onDelete={handleDelete} />
            ))}</ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <span aria-hidden="true" className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-accent-soft text-lg text-accent">✓</span>
              <h2 className="font-[Manrope] text-lg font-bold text-ink">{filter === 'All' ? 'No notifications' : `No ${filter.toLowerCase()} notifications`}</h2>
              <p className="mt-2 text-sm text-muted">You’re all caught up for this view.</p>
            </div>
          )}
      </section>
      {busyId !== null && <span className="sr-only" role="status">Updating notification...</span>}
    </div>
  )
}

export default Notifications