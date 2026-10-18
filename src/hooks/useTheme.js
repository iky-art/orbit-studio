import { useEffect, useState } from 'react'
import { usePersistentState } from './usePersistentState'

const QUERY = '(prefers-color-scheme: dark)'

export function useTheme() {
  const [preference, setPreference] = usePersistentState('orbit-theme', 'dark')
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(QUERY).matches
      : true,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolved
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', resolved === 'dark' ? '#17191c' : '#e8ebe4')
    }
  }, [resolved])

  const toggle = () =>
    setPreference((current) => {
      const base = current === 'system' ? (systemDark ? 'dark' : 'light') : current
      return base === 'dark' ? 'light' : 'dark'
    })

  return { preference, setPreference, resolved, toggle }
}
