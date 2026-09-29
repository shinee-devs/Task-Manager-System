const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost/Task%20Manager%20System/backend/public/api'

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
    throw new Error('Could not reach the PHP API. Check that WampServer is running and the API URL is correct.')
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success !== true) {
    const error = new Error(result?.error?.message || 'The request could not be completed.')
    error.fields = result?.error?.fields || {}
    throw error
  }
  return result
}