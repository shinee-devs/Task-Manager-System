import { useEffect, useState } from 'react'

// Re-evaluate deadline labels while a screen stays open; no network polling.
export default function useDeadlineClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}
