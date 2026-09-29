import { useState } from 'react'
import { updateSubtask } from '../lib/tasks.js'

export default function SubtaskChecklist({ task, onTaskUpdated }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const items = task.subtasks || []
  async function change(values) {
    setBusy(true)
    setError('')
    try {
      const result = await updateSubtask(task.id, values)
      onTaskUpdated(result.data.task)
      if (values.action === 'add') setTitle('')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <section aria-label="Subtask checklist" className="border-t border-border-soft px-5 py-5 sm:px-7">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-bold text-ink">Checklist</h3><span className="text-xs text-muted">{items.filter((item) => item.is_completed).length} of {items.length} done</span></div>
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    <ul className="mt-3 space-y-2">{items.map((item) => <li key={item.id} className="flex items-start gap-2">
      <label className="flex min-w-0 flex-1 items-start gap-3 py-2 text-sm"><input type="checkbox" checked={item.is_completed} disabled={busy} onChange={(event) => change({ action: 'set_completed', subtask_id: item.id, is_completed: event.target.checked })} className="mt-0.5 size-4 shrink-0 accent-blue-600" /><span className={`break-words ${item.is_completed ? 'text-subtle line-through' : 'text-ink'}`}>{item.title}</span></label>
      <button type="button" disabled={busy} onClick={() => change({ action: 'delete', subtask_id: item.id })} aria-label={`Delete subtask ${item.title}`} className="size-9 shrink-0 rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700">&times;</button>
    </li>)}</ul>
    <form className="mt-3 flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); if (title.trim()) change({ action: 'add', title: title.trim() }) }}>
      <label className="field-label min-w-0 flex-1">Add subtask<input value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} placeholder="Next small step..." className="field-control" /></label>
      <button disabled={busy || !title.trim()} className="button-base button-secondary">Add</button>
    </form>
  </section>
}
