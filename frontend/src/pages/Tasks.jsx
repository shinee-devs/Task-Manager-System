import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TaskCard from '../components/TaskCard.jsx'
import TaskDetails from '../components/TaskDetails.jsx'
import TaskForm from '../components/TaskForm.jsx'
import { useNotifications } from '../components/NotificationProvider.jsx'
import { useToast } from '../components/ToastProvider.jsx'
import { createTask, deleteTask, getTasks, updateTask } from '../lib/tasks.js'
import { DEFAULT_TASK_FILTERS, filterAndSortTasks } from '../lib/taskUtils.js'
import useEscapeKey from '../hooks/useEscapeKey.js'
import useDialogFocus from '../hooks/useDialogFocus.js'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS)
  const [selectedTask, setSelectedTask] = useState(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const deleteDialogRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { refreshNotifications } = useNotifications()
  const { showToast } = useToast()
  useEscapeKey(() => { if (!deleting) setDeletingTask(null) }, Boolean(deletingTask) && !deleting)
  useDialogFocus(deleteDialogRef, Boolean(deletingTask))

  useEffect(() => {
    let active = true

    getTasks()
      .then((result) => { if (active) setTasks(result) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  useEffect(() => {
    const taskId = searchParams.get('task')
    if (!taskId || loading) return
    const matchingTask = tasks.find((task) => Number(task.id) === Number(taskId))
    if (matchingTask) setSelectedTask(matchingTask)
  }, [loading, searchParams, tasks])

  async function refreshTasks() {
    setLoading(true)
    try {
      setTasks(await getTasks())
      setError('')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  function openCreateForm() {
    setEditingTask(null)
    setSuccess('')
    setFormOpen(true)
  }

  function openEditForm(task) {
    setEditingTask(task)
    setSuccess('')
    setFormOpen(true)
  }

  async function handleSave(taskValues) {
    setSaving(true)
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskValues)
      } else {
        await createTask(taskValues)
      }
      setFormOpen(false)
      setEditingTask(null)
      setSuccess(editingTask ? 'Task updated.' : 'Task created.')
      await refreshTasks()
      await refreshNotifications()
      showToast(editingTask ? 'Task updated successfully.' : 'Task created successfully.')
      return { ok: true }
    } catch (requestError) {
      return { ok: false, message: requestError.message, fields: requestError.fields }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTask) return
    setDeleting(true)
    setError('')
    setSuccess('')
    try {
      await deleteTask(deletingTask.id)
      setDeletingTask(null)
      setSelectedTask(null)
      clearTaskQuery()
      setSuccess('Task deleted.')
      await refreshTasks()
      await refreshNotifications()
      showToast('Task deleted.')
    } catch (requestError) {
      setError(requestError.message)
      showToast(requestError.message || 'Unable to delete task.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(task, nextStatus) {
    setStatusUpdatingId(task.id)
    setError('')
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: nextStatus,
        due_date: task.due_date,
      })
      await refreshTasks()
      await refreshNotifications()
      const message = nextStatus === 'Completed' ? 'Task marked as completed.' : nextStatus === 'In Progress' ? 'Task started.' : 'Task reopened.'
      setSuccess(message)
      showToast(message)
      setSelectedTask((current) => current && Number(current.id) === Number(task.id) ? { ...current, status: nextStatus } : current)
    } catch (requestError) {
      setError(requestError.message)
      showToast(requestError.message || 'Unable to update task.', 'error')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  function clearTaskQuery() {
    if (!searchParams.has('task')) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('task')
    setSearchParams(nextParams, { replace: true })
  }

  function openDetails(task) {
    setSelectedTask(task)
    setSearchParams({ task: String(task.id) }, { replace: true })
  }

  function closeDetails() {
    setSelectedTask(null)
    clearTaskQuery()
  }

  function editFromDetails(task) {
    setSelectedTask(null)
    clearTaskQuery()
    openEditForm(task)
  }

  function deleteFromDetails(task) {
    setSelectedTask(null)
    clearTaskQuery()
    setDeletingTask(task)
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_TASK_FILTERS })
  }

  const visibleTasks = filterAndSortTasks(tasks, filters)
  const filtersChanged = Object.keys(DEFAULT_TASK_FILTERS).some((key) => filters[key] !== DEFAULT_TASK_FILTERS[key])

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Your workspace</p>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em]">My tasks</h1>
          <p className="mt-2 text-sm text-muted">A clear view of what needs your attention.</p>
        </div>
        <button type="button" onClick={openCreateForm} className="button-base button-primary">Add task</button>
      </div>

      {success && <p role="status" className="mb-5 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-950">{success}</p>}
      {error && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={refreshTasks} className="font-semibold underline underline-offset-2">Try again</button>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <section aria-label="Search, filters, and sorting" className="mb-5 grid gap-3 rounded-xl border border-border bg-white p-4 sm:grid-cols-2 xl:grid-cols-7">
          <label className="block text-xs font-bold text-muted sm:col-span-2 xl:col-span-2">
            Search by title
            <input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search tasks..." className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-normal text-ink outline-none placeholder:text-placeholder focus:border-accent focus:ring-2 focus:ring-accent/15" />
          </label>
          <label className="block text-xs font-bold text-muted">
            Status
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15">
              <option>All</option><option>To Do</option><option>In Progress</option><option>Completed</option>
            </select>
          </label>
          <label className="block text-xs font-bold text-muted">
            Priority
            <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15">
              <option>All</option><option>Low</option><option>Medium</option><option>High</option>
            </select>
          </label>
          <label className="block text-xs font-bold text-muted">
            Due date
            <select value={filters.dueDate} onChange={(event) => updateFilter('dueDate', event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15">
              <option>All</option><option>Overdue</option><option>Due Today</option><option>Upcoming</option><option>No Due Date</option>
            </select>
          </label>
          <label className="block text-xs font-bold text-muted">
            Sort
            <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/15">
              <option>Newest</option><option>Oldest</option><option>Due Date: Earliest</option><option>Due Date: Latest</option><option>Priority: High to Low</option><option>Priority: Low to High</option>
            </select>
          </label>
          <button type="button" onClick={resetFilters} disabled={!filtersChanged} className="self-end rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:text-subtle sm:col-span-2 xl:col-span-1">Reset Filters</button>
        </section>
      )}

      {!loading && tasks.length > 0 && (
        <p className="mb-3 text-sm text-muted" aria-live="polite">Showing <span className="font-semibold text-ink">{visibleTasks.length}</span> of <span className="font-semibold text-ink">{tasks.length}</span> tasks</p>
      )}

      {loading ? (
        <p role="status" className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-muted">Loading tasks...</p>
      ) : tasks.length === 0 && !error ? (
        <section className="rounded-xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent-soft text-xl font-semibold text-accent" aria-hidden="true">+</span>
          <h2 className="mt-4 font-[Manrope] text-lg font-bold text-ink">No tasks yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Add your first task to start building your list.</p>
          <button type="button" onClick={openCreateForm} className="button-base button-primary mt-5">Add task</button>
        </section>
      ) : tasks.length > 0 && visibleTasks.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <h2 className="font-[Manrope] text-lg font-bold text-ink">No matching tasks</h2>
          <p className="mt-2 text-sm text-muted">Try changing your search or filters.</p>
          <button type="button" onClick={resetFilters} disabled={!filtersChanged} className="mt-4 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-60">Reset filters</button>
        </section>
      ) : (
        <section aria-label="Tasks" className="grid gap-4 lg:grid-cols-2">
          {visibleTasks.map((task) => <TaskCard key={task.id} task={task} onDetails={openDetails} onEdit={openEditForm} onDelete={setDeletingTask} onStatusChange={handleStatusChange} statusUpdating={Number(statusUpdatingId) === Number(task.id)} />)}
        </section>
      )}

      {formOpen && (
        <TaskForm
          key={editingTask?.id ?? 'new-task'}
          task={editingTask}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditingTask(null) }}
        />
      )}

      {selectedTask && (
        <TaskDetails
          task={tasks.find((task) => Number(task.id) === Number(selectedTask.id)) || selectedTask}
          onClose={closeDetails}
          onEdit={editFromDetails}
          onDelete={deleteFromDetails}
          onStatusChange={handleStatusChange}
          statusUpdating={Number(statusUpdatingId) === Number(selectedTask.id)}
        />
      )}

      {deletingTask && (
        <div className="motion-enter fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-3 sm:p-4" onMouseDown={(event) => { if (!deleting && event.target === event.currentTarget) setDeletingTask(null) }}>
          <section ref={deleteDialogRef} role="alertdialog" aria-modal="true" aria-labelledby="delete-task-title" tabIndex={-1} className="motion-modal my-auto w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-2xl sm:p-6">
            <h2 id="delete-task-title" className="font-[Manrope] text-lg font-bold text-ink">Delete this task?</h2>
            <p className="mt-2 break-words text-sm leading-6 text-muted">“{deletingTask.title}” will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingTask(null)} disabled={deleting} className="button-base button-secondary">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="button-base button-danger">{deleting ? 'Deleting...' : 'Delete task'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Tasks