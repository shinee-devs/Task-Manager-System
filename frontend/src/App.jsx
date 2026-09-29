import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Tasks from './pages/Tasks.jsx'
import Notifications from './pages/Notifications.jsx'
import Profile from './pages/Profile.jsx'
import NotificationProvider from './components/NotificationProvider.jsx'
import ToastProvider from './components/ToastProvider.jsx'

function WorkspaceLayout() {
  const { loading, user } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted">Checking your session...</main>
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <ToastProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-page text-ink">
          <Navbar mobileNavOpen={mobileNavOpen} onMenuToggle={() => setMobileNavOpen((open) => !open)} />
          <div className="mx-auto flex max-w-[1440px] flex-col md:min-h-[calc(100vh-68px)] md:flex-row">
            <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </NotificationProvider>
    </ToastProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<WorkspaceLayout />} />
    </Routes>
  )
}

export default App