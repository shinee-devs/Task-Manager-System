import TaskBadges from './TaskBadges.jsx'

function formatNotificationDate(value) {
  const dateValue = String(value || '').replace(' ', 'T')
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

function NotificationItem({ notification, onOpen, onMarkRead, onDelete, compact = false }) {
  const isRead = notification.is_read === true || Number(notification.is_read) === 1

  return (
    <li className={`flex min-w-0 gap-3 border-b border-border-soft px-4 py-3 last:border-b-0 ${isRead ? 'bg-white' : 'bg-sky-50/80'}`}>
      <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${isRead ? 'bg-slate-200' : 'bg-accent'}`} />
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => onOpen(notification)} className="block w-full break-words text-left text-sm text-ink hover:text-accent">
          <span className={isRead ? 'font-medium' : 'font-bold'}>{notification.message}</span>
          {notification.task_title && <span className="mt-1 block truncate text-xs font-medium text-accent">Open: {notification.task_title}</span>}
        </button>
        {notification.task_title && notification.task_priority && notification.task_status && (
          <TaskBadges priority={notification.task_priority} status={notification.task_status} dueDate={notification.task_due_date} className="mt-2" />
        )}
        <time dateTime={String(notification.created_at).replace(' ', 'T')} className="mt-1 block text-xs text-subtle">{formatNotificationDate(notification.created_at)}</time>
        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${isRead ? 'bg-slate-100 text-slate-600' : 'bg-accent-soft text-accent'}`}>{isRead ? 'Read' : 'Unread'}</span>
        {!compact && <span className="mt-1 block text-[10px] font-bold uppercase text-subtle">{String(notification.type).replaceAll('_', ' ')}</span>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {!isRead && <button type="button" onClick={() => onMarkRead(notification)} className="text-xs font-semibold text-accent hover:underline">Mark as read</button>}
          <button type="button" onClick={() => onDelete(notification)} className="text-xs font-semibold text-muted hover:text-rose-700 hover:underline">Delete</button>
        </div>
      </div>
    </li>
  )
}

export default NotificationItem