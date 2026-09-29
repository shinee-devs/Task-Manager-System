import assert from 'node:assert/strict'
import { DEFAULT_TASK_FILTERS, filterAndSortTasks, getUpcomingTasks, isUpcomingTask } from '../frontend/src/lib/taskUtils.js'
const today = '2026-09-29'
const tasks = [
  { id: 1, title: 'Report', category: 'Work', tags: ['frontend'], status: 'To Do', due_date: today },
  { id: 2, title: 'Other', category: 'Work', tags: ['frontend'], status: 'Completed', due_date: today },
  { id: 3, title: 'Tomorrow', category: 'School', tags: [], status: 'To Do', due_date: '2026-09-30' },
  { id: 4, title: 'Later', category: null, tags: [], status: 'To Do', due_date: '2026-10-07' },
]
assert.deepEqual(filterAndSortTasks(tasks, { ...DEFAULT_TASK_FILTERS, search: 'front', category: 'Work', tag: 'frontend', status: 'To Do', dueDate: 'Due Today', upcoming: 'Today', sort: 'Due Date: Earliest' }, today).map(t => t.id), [1])
assert.deepEqual(getUpcomingTasks(tasks, 5, today).map(t => t.id), [1, 3, 4])
assert.equal(isUpcomingTask(tasks[2], 'Tomorrow', today), true)
assert.equal(isUpcomingTask(tasks[3], 'Next 7 Days', today), false)
assert.equal(isUpcomingTask(tasks[1], 'Today', today), false)
assert.equal(isUpcomingTask({ ...tasks[0], due_date: null }, 'Today', today), false)
assert.equal(isUpcomingTask({ ...tasks[0], due_date: '2026-10-06' }, 'Next 7 Days', today), true)
assert.equal(filterAndSortTasks(tasks, DEFAULT_TASK_FILTERS, today).length, 4)
console.log('PASS: combined filters, tag search, upcoming boundaries, completed exclusion, deadline sorting and reset')
