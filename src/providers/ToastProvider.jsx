import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Icon } from '../components/Icon'

const ToastContext = createContext(null)

let counter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (message, options = {}) => {
      counter += 1
      const id = `toast_${counter}`
      const toast = {
        id,
        message,
        tone: options.tone ?? 'default',
        action: options.action ?? null,
      }
      setToasts((list) => [...list.slice(-3), toast])
      const timer = setTimeout(() => dismiss(id), options.duration ?? 4200)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
      timers.current.clear()
    },
    [],
  )

  const api = useMemo(
    () => ({
      push,
      dismiss,
      success: (message, options) => push(message, { ...options, tone: 'success' }),
      error: (message, options) => push(message, { ...options, tone: 'danger' }),
      info: (message, options) => push(message, { ...options, tone: 'info' }),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <Icon
              name={
                toast.tone === 'success'
                  ? 'check'
                  : toast.tone === 'danger'
                    ? 'alert'
                    : 'info'
              }
              size={17}
              strokeWidth={1.9}
            />
            <span className="toast-msg">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action.onClick?.()
                  dismiss(toast.id)
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
            <button
              type="button"
              className="toast-close"
              aria-label="Tutup notifikasi"
              onClick={() => dismiss(toast.id)}
            >
              <Icon name="close" size={15} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return context
}
