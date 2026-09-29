import { apiRequest } from './api.js'

export async function getTasks() {
  const result = await apiRequest('/tasks/get')
  return result.data.tasks
}

export function createTask(task) {
  return apiRequest('/tasks/create', { method: 'POST', body: task })
}

export function updateTask(id, task) {
  return apiRequest('/tasks/update', { method: 'PUT', body: { id, ...task } })
}

export function deleteTask(id) {
  return apiRequest('/tasks/delete', { method: 'DELETE', body: { id } })
}
export function updateSubtask(taskId, values) {
  return apiRequest('/tasks/subtasks', { method: 'POST', body: { task_id: taskId, ...values } })
}
