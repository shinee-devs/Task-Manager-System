import useDeadlineClock from '../hooks/useDeadlineClock.js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import TaskBadges from '../components/TaskBadges.jsx'
import { getTasks } from '../lib/tasks.js'
import { getUpcomingTasks, formatDueDate, getRecentTasks, getTaskStatistics } from '../lib/taskUtils.js'

function Dashboard() {
  useDeadlineClock()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getTasks()
      .then((result) => { if (active) setTasks(result) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  async function reloadTasks() {
    setLoading(true)
    try {
      setTasks(await getTasks())
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const statistics = getTaskStatistics(tasks)
  const pinnedTasks = tasks.filter((task) => task.is_pinned && task.status !== 'Completed')
  const recentTasks = getRecentTasks(tasks, 5)
  const completedPercent = statistics.total === 0 ? 0 : Math.round((statistics.completed / statistics.total) * 100)
  const statusBreakdown = [
    { label: 'To Do', value: statistics.toDo, color: 'bg-slate-400', legend: 'bg-slate-400' },
    { label: 'In Progress', value: statistics.inProgress, color: 'bg-blue-600', legend: 'bg-blue-600' },
    { label: 'Completed', value: statistics.completed, color: 'bg-green-600', legend: 'bg-green-600' },
  ]
  const summary = [
    { label: 'Total Tasks', value: statistics.total, tone: 'text-accent', mark: 'bg-accent-soft' },
    { label: 'To Do', value: statistics.toDo, tone: 'text-sky', mark: 'bg-sky-soft' },
    { label: 'In Progress', value: statistics.inProgress, tone: 'text-blue-700', mark: 'bg-blue-100' },
    { label: 'Completed', value: statistics.completed, tone: 'text-cyan', mark: 'bg-cyan-soft' },
    { label: 'Overdue', value: statistics.overdue, tone: 'text-rose-700', mark: 'bg-rose-100' },
  ]

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em]">Good morning, {user?.name?.trim().split(/\s+/)[0] || 'there'}</h1>
          <p className="mt-2 text-sm text-muted">Here’s what needs your attention today.</p>
        </div>
        <Link to="/tasks" className="button-base button-primary">View tasks</Link>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={reloadTasks} className="font-semibold underline underline-offset-2">Try again</button>
        </div>
      )}

      {!loading && pinnedTasks.length > 0 && (
        <section aria-labelledby="pinned-tasks-title" className="mb-5 overflow-hidden rounded-xl border border-accent-pale bg-white">
          <div className="flex items-center gap-2 border-b border-border-soft px-5 py-4 sm:px-6">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-accent" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 2.5 6 0-.8 5 2.4 3.2v1.5H5.4v-1.5L7.8 7.5 7 2.5ZM10 12.2v5.3" />
            </svg>
            <div className="min-w-0">
              <h2 id="pinned-tasks-title" className="font-[Manrope] text-base font-bold text-ink">Pinned tasks</h2>
              <p className="mt-0.5 text-xs text-muted">Kept at the top of your overview.</p>
            </div>
            <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">{pinnedTasks.length}</span>
          </div>
          <ul className="divide-y divide-border-soft">
            {pinnedTasks.map((task) => (
              <li key={task.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                <div className="min-w-0 flex-1">
                  <Link to={`/tasks?task=${task.id}`} className="block break-words font-semibold text-ink hover:text-accent hover:underline">{task.title}</Link>
                  <p className="mt-1 text-xs text-muted">{formatDueDate(task)}</p>
                </div>
                <TaskBadges status={task.status} dueDate={task.due_date} dueTime={task.due_time} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <article key={item.label} className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
            <span className={`grid size-10 place-items-center rounded-lg ${item.mark}`}>
              <span className={`size-2.5 rounded-full ${item.tone.replace('text-', 'bg-')}`} />
            </span>
            <div>
              <p className="text-sm text-muted">{item.label}</p>
              <p className={`mt-0.5 font-[Manrope] text-2xl font-bold ${item.tone}`} aria-live="polite">{loading ? '...' : item.value}</p>
            </div>
          </article>
        ))}
      </section>

      <section aria-label="Progress and status breakdown" className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-[Manrope] text-base font-bold text-ink">Task progress</h2>
            <p className="text-sm font-semibold text-muted">{loading ? '...' : `${statistics.completed} of ${statistics.total} tasks completed`}</p>
          </div>
          <div role="progressbar" aria-label="Tasks completed" aria-valuemin="0" aria-valuemax={statistics.total} aria-valuenow={statistics.completed} aria-valuetext={`${completedPercent}% complete`} className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-green-600 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${completedPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{loading ? 'Loading progress...' : statistics.total === 0 ? 'Add tasks to track your progress.' : `${completedPercent}% complete`}</p>
        </article>

        <article className="rounded-xl border border-border bg-white p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-[Manrope] text-base font-bold text-ink">Task status</h2>
            <span className="text-xs text-muted">{loading ? '...' : `${statistics.total} total`}</span>
          </div>
          <div role="img" aria-label={`Task status breakdown: ${statusBreakdown.map(({ label, value }) => `${label} ${value}`).join(', ')}`} className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {!loading && statistics.total > 0 ? statusBreakdown.map(({ label, value, color }) => value > 0 && (
              <span key={label} className={`${color} transition-[width] duration-300 motion-reduce:transition-none`} style={{ width: `${(value / statistics.total) * 100}%` }} />
            )) : <span className="h-full w-full bg-slate-100" />}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {statusBreakdown.map(({ label, value, legend }) => (
              <li key={label} className="flex items-center gap-2 text-xs text-muted"><span className={`size-2.5 rounded-full ${legend}`} />{label}<span className="font-bold text-ink">{loading ? '...' : value}</span></li>
            ))}
          </ul>
        </article>
      </section>

      <section aria-label="Upcoming Deadlines" className="mt-6 rounded-xl border border-border bg-white p-5 sm:p-6">
        <h2 className="font-[Manrope] text-lg font-bold text-ink">Upcoming Deadlines</h2>
        {loading ? <p className="mt-3 text-sm text-muted">Loading deadlines...</p> : error ? <p className="mt-3 text-sm text-muted">Deadlines are unavailable.</p> : getUpcomingTasks(tasks).length ? <ul className="mt-3 divide-y divide-border-soft">{getUpcomingTasks(tasks).map((task) => <li key={task.id} className="flex flex-wrap justify-between gap-2 py-3"><Link to={`/tasks?task=${task.id}`} className="min-w-0 break-words font-semibold text-accent hover:underline">{task.title}</Link><span className="text-sm text-muted">{formatDueDate(task)}</span></li>)}</ul> : <p className="mt-3 text-sm text-muted">No upcoming deadlines.</p>}
      </section>
      <section aria-labelledby="recent-tasks-title" className="motion-enter mt-6 overflow-hidden rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-5 py-4 sm:px-6">
          <div>
            <h2 id="recent-tasks-title" className="font-[Manrope] text-lg font-bold text-ink">Recent Tasks</h2>
            <p className="mt-1 text-sm text-muted">The five most recently created tasks.</p>
          </div>
          <Link to="/tasks" className="text-sm font-semibold text-accent hover:underline">View all</Link>
        </div>
        {loading ? (
          <p role="status" className="px-5 py-8 text-center text-sm text-muted">Loading recent tasks...</p>
        ) : recentTasks.length > 0 ? (
          <ul className="divide-y divide-border-soft">
            {recentTasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-ink">{task.title}</h3>
                  <p className="mt-1 text-xs text-muted">Due {formatDueDate(task)}</p>
                </div>
                <TaskBadges status={task.status} dueDate={task.due_date} dueTime={task.due_time} />
              </li>
            ))}
          </ul>
        ) : error ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Recent tasks are unavailable.</p>
        ) : (
          <div className="px-5 py-10 text-center">
            <span aria-hidden="true" className="mx-auto grid size-10 place-items-center rounded-full bg-accent-soft text-lg font-bold text-accent">+</span>
            <h3 className="mt-3 font-semibold text-ink">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted">Create your first task to get started.</p>
            <Link to="/tasks" className="button-base button-primary mt-4">Add a task</Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard