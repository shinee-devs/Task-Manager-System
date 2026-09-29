import { useEffect, useRef, useState } from 'react'
import TaskBadges from './TaskBadges.jsx'
import TaskOrganization from './TaskOrganization.jsx'
import { formatDueDate } from '../lib/taskUtils.js'

const actions = { 'To Do': ['Start', 'In Progress'], 'In Progress': ['Complete', 'Completed'], Completed: ['Reopen', 'To Do'] }

export default function TaskCard({ task, onDetails, onEdit, onDelete, onStatusChange, onPin, statusUpdating }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const [label, nextStatus] = actions[task.status] || actions['To Do']
  const completed = (task.subtasks || []).filter((item) => item.is_completed).length
  useEffect(() => {
    if (!menuOpen) return
    function dismiss(event) { if (!menuRef.current?.contains(event.target)) setMenuOpen(false) }
    function escape(event) { if (event.key === 'Escape') { setMenuOpen(false); triggerRef.current?.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [menuOpen])
  function choose(callback) { setMenuOpen(false); callback(task) }
  return <article className={`motion-enter relative flex min-w-0 flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none ${menuOpen ? 'z-10' : ''}`}>
    <div className="flex items-start justify-between gap-3">
      <h2 className="min-w-0 flex-1 font-[Manrope] text-lg font-bold leading-snug text-ink"><button type="button" onClick={() => onDetails(task)} className="w-full break-words text-left hover:text-accent">{task.title}</button></h2>
      {task.is_pinned && <svg aria-label="Pinned task" role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-1 size-4 shrink-0 text-accent"><path d="m8 3 8 0-1 6 3 4v2H6v-2l3-4-1-6ZM12 15v7" /></svg>}
      <div ref={menuRef} className="relative shrink-0" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false) }}>
        <button ref={triggerRef} type="button" aria-label={`Actions for ${task.title}`} aria-expanded={menuOpen} aria-controls={`task-actions-${task.id}`} onClick={() => setMenuOpen((open) => !open)} className="grid size-9 place-items-center rounded-lg text-xl leading-none text-muted hover:bg-slate-100">&hellip;</button>
        {menuOpen && <div id={`task-actions-${task.id}`} className="absolute right-0 top-11 z-20 w-40 rounded-xl border border-border bg-white p-1.5 shadow-lg">
          {[[onDetails, 'View Details'], [onEdit, 'Edit'], [onPin, task.is_pinned ? 'Unpin' : 'Pin'], [onDelete, 'Delete']].map(([callback, name]) => <button key={name} type="button" onClick={() => choose(callback)} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${name === 'Delete' ? 'text-rose-700' : 'text-ink'}`}>{name}</button>)}
        </div>}
      </div>
    </div>
    {task.description && <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted">{task.description}</p>}
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-ink">{formatDueDate(task)}</p><span className="inline-flex items-center gap-1.5 text-xs text-muted"><span className={`size-1.5 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-400' : 'bg-slate-300'}`} />{task.status}</span></div>
    {(task.category || task.tags?.length > 0) && <TaskOrganization task={task} />}
    {task.subtasks?.length > 0 && <button type="button" onClick={() => onDetails(task)} className="mt-3 self-start text-xs text-muted hover:text-accent">{completed} of {task.subtasks.length} subtasks</button>}
    <div className="mt-auto pt-5"><div className="flex items-center justify-between gap-3 border-t border-border-soft pt-4"><TaskBadges status={task.status} dueDate={task.due_date} dueTime={task.due_time} /><button type="button" onClick={() => onStatusChange(task, nextStatus)} disabled={statusUpdating} className="button-base button-secondary ml-auto min-h-9 px-4 py-2 text-sm">{statusUpdating ? 'Updating...' : label}</button></div></div>
  </article>
}
