import { createContext, useContext, useEffect, useState } from 'react'
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/notifications.js'

const NotificationContext = createContext(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === null) throw new Error('useNotifications must be used within NotificationProvider')
  return context
}

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const unreadCount = notifications.filter((notification) => !(notification.is_read === true || Number(notification.is_read) === 1)).length

  async function refreshNotifications() {
    setLoading(true)
    try {
      const result = await getNotifications()
      setNotifications(result.notifications)
      setError('')
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshNotifications()
  }, [])

  async function markRead(id) {
    await markNotificationRead(id)
    setNotifications((current) => current.map((notification) => (
      Number(notification.id) === Number(id) ? { ...notification, is_read: true } : notification
    )))
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
  }

  async function removeNotification(id) {
    await deleteNotification(id)
    setNotifications((current) => current.filter((notification) => Number(notification.id) !== Number(id)))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, error, refreshNotifications, markRead, markAllRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider