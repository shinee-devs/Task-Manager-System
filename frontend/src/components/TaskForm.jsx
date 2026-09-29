import { useRef, useState } from 'react'
import useEscapeKey from '../hooks/useEscapeKey.js'
import useDialogFocus from '../hooks/useDialogFocus.js'

const defaultTask = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'To Do',
  due_date: '',
}

function TaskForm({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => task ? {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status || 'To Do',
    due_date: task.due_date || '',
  } : defaultTask)
  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const dialogRef = useRef(null)
  const isEditing = Boolean(task)
  useEscapeKey(onClose, !saving)
  useDialogFocus(dialogRef, true, '#task-title')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setErrors({ title: 'Title is required.' })
      return
    }

    const result = await onSave({ ...form, title, description: form.description.trim(), due_date: form.due_date || null })
    if (!result.ok) {
      setErrors(result.fields || {})
      setErrorMessage(result.message)
    }
  }

  return (
    <div className="motion-enter fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (!saving && event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="task-form-title" tabIndex={-1} className="motion-modal my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-form-title" className="font-[Manrope] text-xl font-bold text-ink">{isEditing ? 'Edit task' : 'Add task'}</h2>
            <p className="mt-1 text-sm text-muted">Keep the details up to date in your task list.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close task form" className="button-base button-ghost min-h-9 shrink-0 px-2 py-1 text-lg leading-none">×</button>
        </div>

        {errorMessage && <p role="alert" className="mt-5 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{errorMessage}</p>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label htmlFor="task-title" className="field-label">
            Title <span className="text-rose-700">*</span>
            <input id="task-title" name="title" value={form.title} onChange={updateField} maxLength={255} required aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'task-title-error' : undefined} className="field-control" />
            {errors.title && <span id="task-title-error" className="field-error">{errors.title}</span>}
          </label>
          <label htmlFor="task-description" className="field-label">
            Description
            <textarea id="task-description" name="description" value={form.description} onChange={updateField} rows={3} className="field-control min-h-24 resize-y" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label htmlFor="task-priority" className="field-label">
              Priority
              <select id="task-priority" name="priority" value={form.priority} onChange={updateField} aria-invalid={Boolean(errors.priority)} className="field-control">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              {errors.priority && <span className="mt-1 block text-xs font-normal text-rose-700">{errors.priority}</span>}
            </label>
            <label htmlFor="task-status" className="field-label">
              Status
              <select id="task-status" name="status" value={form.status} onChange={updateField} aria-invalid={Boolean(errors.status)} className="field-control">
                <option>To Do</option><option>In Progress</option><option>Completed</option>
              </select>
              {errors.status && <span className="mt-1 block text-xs font-normal text-rose-700">{errors.status}</span>}
            </label>
          </div>
          <label htmlFor="task-due-date" className="field-label">
            Due date
            <input id="task-due-date" name="due_date" type="date" value={form.due_date} onChange={updateField} aria-invalid={Boolean(errors.due_date)} className="field-control" />
            {errors.due_date && <span className="mt-1 block text-xs font-normal text-rose-700">{errors.due_date}</span>}
          </label>
          <div className="flex justify-end gap-3 border-t border-border-soft pt-5">
            <button type="button" onClick={onClose} disabled={saving} className="button-base button-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="button-base button-primary">{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskForm