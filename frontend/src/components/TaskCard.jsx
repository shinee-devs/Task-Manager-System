import TaskBadges from './TaskBadges.jsx'
import { formatTaskDate } from '../lib/taskUtils.js'

const statusActions = {
  'To Do': { label: 'Start task', nextStatus: 'In Progress' },
  'In Progress': { label: 'Mark complete', nextStatus: 'Completed' },
  Completed: { label: 'Reopen', nextStatus: 'To Do' },
}

function TaskCard({ task, onDetails, onEdit, onDelete, onStatusChange, statusUpdating }) {
  const statusAction = statusActions[task.status] || statusActions['To Do']

  return (
    <article className="motion-enter flex min-w-0 flex-col rounded-xl border border-border bg-white p-5 shadow-[0_2px_10px_rgba(24,76,105,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 break-words font-[Manrope] text-lg font-bold leading-snug text-ink"><button type="button" onClick={() => onDetails(task)} className="text-left hover:text-accent">{task.title}</button></h2>
        <TaskBadges priority={task.priority} status={task.status} dueDate={task.due_date} />
      </div>
      {task.description && <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{task.description}</p>}
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border-soft pt-4 text-xs">
        <div>
          <dt className="font-semibold text-subtle">Due date</dt>
          <dd className="mt-1 font-medium text-ink">{formatTaskDate(task.due_date)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-subtle">Created</dt>
          <dd className="mt-1 font-medium text-ink"><time dateTime={String(task.created_at).replace(' ', 'T')}>{formatTaskDate(task.created_at, 'Unknown')}</time></dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border-soft pt-3">
        <button type="button" onClick={() => onStatusChange(task, statusAction.nextStatus)} disabled={statusUpdating} className="button-base button-ghost mr-auto min-h-9 rounded-md bg-accent-soft px-3 py-2 hover:bg-accent-pale">{statusUpdating ? 'Updating...' : statusAction.label}</button>
        <button type="button" onClick={() => onDetails(task)} className="button-base button-ghost min-h-9 px-3 py-2 text-muted">Details</button>
        <button type="button" onClick={() => onEdit(task)} className="button-base button-ghost min-h-9 px-3 py-2">Edit</button>
        <button type="button" onClick={() => onDelete(task)} className="button-base min-h-9 px-3 py-2 text-rose-700 hover:bg-rose-50">Delete</button>
      </div>
    </article>
  )
}

export default TaskCard