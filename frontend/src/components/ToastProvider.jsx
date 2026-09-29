import { createContext, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)
let nextToastId = 0

function ToastMessage({ toast, onDismiss }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast.id, onDismiss])

  const styles = toast.type === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-900'
    : 'border-cyan-200 bg-white text-ink'

  return (
    <div role={toast.type === 'error' ? 'alert' : 'status'} className={`motion-enter flex min-w-0 items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm shadow-lg ${styles}`}>
      <span className="min-w-0 break-words font-medium">{toast.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)} className="shrink-0 font-semibold text-muted hover:text-ink">×</button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === null) throw new Error('useToast must be used within ToastProvider')
  return context
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = ++nextToastId
    setToasts((current) => [...current, { id, message, type }].slice(-4))
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-label="Messages" className="fixed bottom-4 right-4 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => <ToastMessage key={toast.id} toast={toast} onDismiss={dismissToast} />)}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider