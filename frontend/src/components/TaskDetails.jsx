import { useRef } from 'react'
import TaskBadges from './TaskBadges.jsx'
import { formatTaskDate } from '../lib/taskUtils.js'
import useEscapeKey from '../hooks/useEscapeKey.js'
import useDialogFocus from '../hooks/useDialogFocus.js'

const statusActions = {
  'To Do': { label: 'Start task', nextStatus: 'In Progress' },
  'In Progress': { label: 'Mark complete', nextStatus: 'Completed' },
  Completed: { label: 'Reopen', nextStatus: 'To Do' },
}

function TaskDetails({ task, onClose, onEdit, onDelete, onStatusChange, statusUpdating }) {
  const statusAction = statusActions[task.status] || statusActions['To Do']
  const dialogRef = useRef(null)
  useEscapeKey(onClose)
  useDialogFocus(dialogRef)

  return (
    <div className="motion-enter fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="task-details-title" tabIndex={-1} className="motion-modal my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-soft px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <h2 id="task-details-title" className="break-words font-[Manrope] text-xl font-bold text-ink">{task.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TaskBadges priority={task.priority} status={task.status} dueDate={task.due_date} />
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close task details" className="button-base button-ghost min-h-9 shrink-0 px-2 py-1 text-lg leading-none">×</button>
        </div>
        <dl className="grid gap-x-5 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7">
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-subtle">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{task.description || 'No description provided.'}</dd>
          </div>
          <div><dt className="text-xs font-bold uppercase text-subtle">Due date</dt><dd className="mt-1 text-sm text-ink">{formatTaskDate(task.due_date)}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-subtle">Created</dt><dd className="mt-1 text-sm text-ink">{formatTaskDate(task.created_at, 'Unknown')}</dd></div>
          <div><dt className="text-xs font-bold uppercase text-subtle">Last updated</dt><dd className="mt-1 text-sm text-ink">{formatTaskDate(task.updated_at, 'Unknown')}</dd></div>
        </dl>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border-soft px-5 py-4 sm:px-7">
          <button type="button" onClick={() => onDelete(task)} className="button-base button-danger mr-auto">Delete</button>
          <button type="button" onClick={() => onStatusChange(task, statusAction.nextStatus)} disabled={statusUpdating} className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-semibold text-accent hover:bg-accent-pale disabled:opacity-60">{statusUpdating ? 'Updating...' : statusAction.label}</button>
          <button type="button" onClick={() => onEdit(task)} className="button-base button-secondary">Edit</button>
          <button type="button" onClick={onClose} className="button-base button-secondary">Close</button>
        </div>
      </section>
    </div>
  )
}

export default TaskDetails