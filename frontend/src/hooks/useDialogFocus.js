import { useEffect } from 'react'

const focusableSelector = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

function useDialogFocus(dialogRef, enabled = true, initialFocusSelector = null) {
  useEffect(() => {
    if (!enabled) return undefined
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const previousFocus = document.activeElement
    const getFocusable = () => Array.from(dialog.querySelectorAll(focusableSelector)).filter((element) => element.getClientRects().length > 0)
    const focusable = getFocusable()
    const initialFocus = initialFocusSelector ? dialog.querySelector(initialFocusSelector) : null
    ;(initialFocus || focusable[0] || dialog).focus()

    function handleTab(event) {
      if (event.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleTab)
    return () => {
      dialog.removeEventListener('keydown', handleTab)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [dialogRef, enabled, initialFocusSelector])
}

export default useDialogFocus