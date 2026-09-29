export const DEADLINE_BADGE_STYLES = {
  Overdue: 'border-red-300 bg-red-100 text-red-800',
  'Due Today': 'border-orange-200 bg-orange-100 text-orange-800',
  Upcoming: 'border-blue-200 bg-blue-100 text-blue-700',
  Completed: 'border-green-200 bg-green-50 text-green-700',
}

export const DEFAULT_TASK_FILTERS = {
  search: '',
  category: 'All',
  tag: 'All',
  upcoming: 'All',
  status: 'All',
  dueDate: 'All',
  sort: 'Newest',
}

// Scheduling uses one explicit timezone across API, display, and filters.
export function getLocalDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date))
}

export function dueTimestamp(task) {
  return task.due_date ? Date.parse(`${task.due_date}T${task.due_time || '23:59:00'}+08:00`) : Infinity
}

export function isTaskOverdue(task, now = new Date()) {
  return task.status !== 'Completed' && dueTimestamp(task) < new Date(now).getTime()
}

export function getTaskDeadlineLabel(task, now = new Date()) {
  if (task.status === 'Completed') return 'Completed'
  if (!task.due_date) return null
  if (isTaskOverdue(task, now)) return 'Overdue'
  return task.due_date === getLocalDateString(now) ? 'Due Today' : 'Upcoming'
}

export function dateShortcut(days, now = new Date()) {
  const date = new Date(`${getLocalDateString(now)}T12:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + days)
  return getLocalDateString(date)
}

export function formatDueDate(task, now = new Date()) {
  if (!task.due_date) return 'No deadline'
  const date = new Date(dueTimestamp(task))
  const day = task.due_date === getLocalDateString(now) ? 'Today' : task.due_date === dateShortcut(1, now) ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric' }).format(date)
  const time = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }).format(date)
  return `${day}, ${time}`
}

export function getTaskStatistics(tasks, now = new Date()) {
  return tasks.reduce((stats, task) => {
    stats.total += 1
    if (task.status === 'To Do') stats.toDo += 1
    if (task.status === 'In Progress') stats.inProgress += 1
    if (task.status === 'Completed') stats.completed += 1
    if (isTaskOverdue(task, now)) stats.overdue += 1
    return stats
  }, { total: 0, toDo: 0, inProgress: 0, completed: 0, overdue: 0 })
}

function createdTimestamp(task) {
  const value = String(task.created_at || '').replace(' ', 'T')
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function compareNewest(first, second) {
  return createdTimestamp(second) - createdTimestamp(first) || Number(second.id) - Number(first.id)
}

function compareOldest(first, second) {
  return createdTimestamp(first) - createdTimestamp(second) || Number(first.id) - Number(second.id)
}

function compareDueDate(direction) {
  return (first, second) => {
    if (!first.due_date && second.due_date) return 1
    if (first.due_date && !second.due_date) return -1
    if (first.due_date && second.due_date) {
      const dateOrder = (dueTimestamp(first) - dueTimestamp(second)) * direction
      if (dateOrder !== 0) return dateOrder
    }
    return compareNewest(first, second)
  }
}

const comparators = {
  Newest: compareNewest,
  Oldest: compareOldest,
  'Due Date: Earliest': compareDueDate(1),
  'Due Date: Latest': compareDueDate(-1),
}

export function filterAndSortTasks(tasks, filters, now = new Date()) {
  const search = filters.search.trim().toLowerCase()

  return tasks
    .filter((task) => {
      if (search && ![task.title, ...(task.tags || [])].join(' ').toLowerCase().includes(search)) return false
      if (filters.category && filters.category !== 'All' && (task.category || 'Uncategorized') !== filters.category) return false
      if (filters.tag && filters.tag !== 'All' && !(task.tags || []).includes(filters.tag)) return false
      if (filters.upcoming && filters.upcoming !== 'All' && !isUpcomingTask(task, filters.upcoming, now)) return false
      if (filters.status !== 'All' && task.status !== filters.status) return false

      if (filters.dueDate === 'Overdue' && !isTaskOverdue(task, now)) return false
      if (filters.dueDate === 'Due Today' && getTaskDeadlineLabel(task, now) !== 'Due Today') return false
      if (filters.dueDate === 'Upcoming' && getTaskDeadlineLabel(task, now) !== 'Upcoming') return false
      if (filters.dueDate === 'No Due Date' && task.due_date) return false
      return true
    })
    .sort((a, b) => Number(Boolean(b.is_pinned) && b.status !== 'Completed') - Number(Boolean(a.is_pinned) && a.status !== 'Completed') || (comparators[filters.sort] || compareNewest)(a, b))
}

export function getRecentTasks(tasks, limit = 5) {
  return [...tasks].sort(compareNewest).slice(0, limit)
}

export function formatTaskDate(value, emptyLabel = 'No due date') {
  if (!value) return emptyLabel
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
export function isUpcomingTask(task, period = 'Next 7 Days', now = new Date()) {
  if (task.status === 'Completed' || !task.due_date || isTaskOverdue(task, now)) return false
  const today = getLocalDateString(now)
  if (period === 'Today') return task.due_date === today
  if (period === 'Tomorrow') return task.due_date === dateShortcut(1, now)
  return task.due_date >= today && task.due_date <= dateShortcut(7, now)
}

export function getUpcomingTasks(tasks, limit = 5, now = new Date()) {
  return tasks.filter((task) => task.status !== 'Completed' && task.due_date && !isTaskOverdue(task, now))
    .sort(compareDueDate(1)).slice(0, limit)
}

export function groupTasks(tasks, now = new Date()) {
  const groups = ['Pinned', 'Overdue', 'Today', 'Upcoming', 'No deadline', 'Completed']
  return groups.map((label) => ({ label, tasks: tasks.filter((task) => {
    const group = task.is_pinned && task.status !== 'Completed' ? 'Pinned' : ({ 'Due Today': 'Today' }[getTaskDeadlineLabel(task, now)] || getTaskDeadlineLabel(task, now) || 'No deadline')
    return label === group
  }) })).filter((group) => group.tasks.length)
}
