import { apiRequest } from './api.js'

export async function getProfile() {
  const result = await apiRequest('/profile/get')
  return result.data.profile
}

export async function updateProfile(name) {
  const result = await apiRequest('/profile/update', { method: 'PUT', body: { name } })
  return result.data
}

export function changePassword(values) {
  return apiRequest('/profile/change-password', { method: 'POST', body: values })
}