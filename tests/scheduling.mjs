import assert from 'node:assert/strict'
import { DEFAULT_TASK_FILTERS, filterAndSortTasks, formatDueDate, getTaskDeadlineLabel, groupTasks, getUpcomingTasks } from '../frontend/src/lib/taskUtils.js'
const now = new Date('2026-09-29T16:59:59+08:00')
const task = { id: 1, title: 'Report', due_date: '2026-09-29', due_time: '17:00:00', status: 'To Do', tags: ['report'], category: 'Work' }
assert.equal(getTaskDeadlineLabel(task, now), 'Due Today')
assert.equal(getTaskDeadlineLabel(task, new Date('2026-09-29T17:00:00+08:00')), 'Due Today')
assert.equal(getTaskDeadlineLabel(task, new Date('2026-09-29T17:00:01+08:00')), 'Overdue')
assert.equal(getTaskDeadlineLabel({ ...task, status: 'Completed' }, new Date('2026-09-30')), 'Completed')
assert.equal(formatDueDate(task, now), 'Today, 5:00 PM')
assert.equal(formatDueDate({ ...task, due_date: '2026-09-30', due_time: '09:30:00' }, now), 'Tomorrow, 9:30 AM')
const pinned = { ...task, id: 2, is_pinned: true, due_time: '18:00:00' }
const completed = { ...pinned, id: 3, status: 'Completed' }
const tasks = [task, pinned, completed]
assert.deepEqual(filterAndSortTasks(tasks, { ...DEFAULT_TASK_FILTERS, sort: 'Due Date: Earliest' }, now).map(t => t.id), [2, 1, 3])
assert.deepEqual(filterAndSortTasks(tasks, { ...DEFAULT_TASK_FILTERS, search: 'report', category: 'Work', tag: 'report', status: 'To Do', dueDate: 'Due Today' }, now).map(t => t.id), [2, 1])
assert.deepEqual(groupTasks(tasks, now).map(g => g.label), ['Pinned', 'Today', 'Completed'])
assert.deepEqual(getUpcomingTasks(tasks, 5, new Date('2026-09-29T17:30:00+08:00')).map(t => t.id), [2])
console.log('PASS: exact second boundary, Manila display, deadline states, pin ordering, grouping, combined filters, completed exclusion')
