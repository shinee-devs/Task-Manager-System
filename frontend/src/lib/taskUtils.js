export const STATUS_BADGE_STYLES = {
  'To Do': 'border-slate-200 bg-slate-100 text-slate-700',
  'In Progress': 'border-blue-200 bg-blue-100 text-blue-700',
  Completed: 'border-green-200 bg-green-100 text-green-700',
}

export const PRIORITY_BADGE_STYLES = {
  Low: 'border-green-200 bg-green-100 text-green-700',
  Medium: 'border-amber-200 bg-amber-100 text-amber-800',
  High: 'border-red-200 bg-red-100 text-red-700',
}

export const DEADLINE_BADGE_STYLES = {
  Overdue: 'border-red-300 bg-red-100 text-red-800',
  'Due Today': 'border-orange-200 bg-orange-100 text-orange-800',
  Upcoming: 'border-blue-200 bg-blue-100 text-blue-700',
  'No Due Date': 'border-slate-200 bg-slate-100 text-slate-700',
}

export const DEFAULT_TASK_FILTERS = {
  search: '',
  status: 'All',
  priority: 'All',
  dueDate: 'All',
  sort: 'Newest',
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isTaskOverdue(task, today = getLocalDateString()) {
  return Boolean(task.due_date && task.due_date < today && task.status !== 'Completed')
}

export function getTaskDeadlineLabel(task, today = getLocalDateString()) {
  if (isTaskOverdue(task, today)) return 'Overdue'
  if (!task.due_date) return 'No Due Date'
  if (task.status !== 'Completed' && task.due_date === today) return 'Due Today'
  if (task.due_date > today) return 'Upcoming'
  return null
}

export function getTaskStatistics(tasks, today = getLocalDateString()) {
  return tasks.reduce((stats, task) => {
    stats.total += 1
    if (task.status === 'To Do') stats.toDo += 1
    if (task.status === 'In Progress') stats.inProgress += 1
    if (task.status === 'Completed') stats.completed += 1
    if (isTaskOverdue(task, today)) stats.overdue += 1
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
      const dateOrder = first.due_date.localeCompare(second.due_date) * direction
      if (dateOrder !== 0) return dateOrder
    }
    return compareNewest(first, second)
  }
}

const priorityRank = { Low: 1, Medium: 2, High: 3 }

function comparePriority(direction) {
  return (first, second) => {
    const rankOrder = ((priorityRank[first.priority] || 0) - (priorityRank[second.priority] || 0)) * direction
    return rankOrder || compareNewest(first, second)
  }
}

const comparators = {
  Newest: compareNewest,
  Oldest: compareOldest,
  'Due Date: Earliest': compareDueDate(1),
  'Due Date: Latest': compareDueDate(-1),
  'Priority: High to Low': comparePriority(-1),
  'Priority: Low to High': comparePriority(1),
}

export function filterAndSortTasks(tasks, filters, today = getLocalDateString()) {
  const search = filters.search.trim().toLowerCase()

  return tasks
    .filter((task) => {
      if (search && !task.title.toLowerCase().includes(search)) return false
      if (filters.status !== 'All' && task.status !== filters.status) return false
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false

      if (filters.dueDate === 'Overdue' && !isTaskOverdue(task, today)) return false
      if (filters.dueDate === 'Due Today' && task.due_date !== today) return false
      if (filters.dueDate === 'Upcoming' && !(task.due_date && task.due_date > today)) return false
      if (filters.dueDate === 'No Due Date' && task.due_date) return false
      return true
    })
    .sort(comparators[filters.sort] || compareNewest)
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