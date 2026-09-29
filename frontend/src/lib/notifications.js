import { apiRequest } from './api.js'

export async function getNotifications() {
  const result = await apiRequest('/notifications/get')
  return result.data
}

export function markNotificationRead(id) {
  return apiRequest('/notifications/mark-read', { method: 'POST', body: { id } })
}

export function markAllNotificationsRead() {
  return apiRequest('/notifications/mark-all-read', { method: 'POST' })
}

export function deleteNotification(id) {
  return apiRequest('/notifications/delete', { method: 'DELETE', body: { id } })
}