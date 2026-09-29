const apiHost = window.location.hostname || 'localhost'
const developmentApiUrl = `http://${apiHost}/Task%20Manager%20System/backend/public/api`
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? developmentApiUrl : '/api')).replace(/\/$/, '')

export async function apiRequest(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the PHP API. Check that Apache and MySQL are running and the API URL is correct.')
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success !== true) {
    const error = new Error(result?.error?.message || 'The request could not be completed.')
    error.fields = result?.error?.fields || {}
    throw error
  }
  return result
}