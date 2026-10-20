import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchWeather } from '../services/weather'
import { readJSON, removeKey, writeJSON } from '../services/storage'

const LOCATION_KEY = 'weather-location'
const CACHE_KEY = 'weather-cache'
const REFRESH_MS = 10 * 60 * 1000
const STALE_MS = 5 * 60 * 1000

const sameSpot = (a, b) => a && b && a.lat === b.lat && a.lon === b.lon

/**
 * Cuaca hari ini dan besok untuk lokasi pilihan pengguna. Diperbarui otomatis
 * tiap 10 menit, saat aplikasi dibuka kembali, dan lewat tombol Perbarui.
 */
export function useWeather() {
  const [location, setLocationState] = useState(() => readJSON(LOCATION_KEY, null))
  const [state, setState] = useState(() => {
    const cached = readJSON(CACHE_KEY, null)
    const loc = readJSON(LOCATION_KEY, null)
    return cached && sameSpot(cached.location, loc)
      ? { status: 'ready', data: cached.data, error: null }
      : { status: loc ? 'loading' : 'idle', data: null, error: null }
  })
  const [nonce, setNonce] = useState(0)
  const dataRef = useRef(state.data)
  dataRef.current = state.data

  useEffect(() => {
    if (!location) return undefined
    const controller = new AbortController()
    setState((current) => ({ ...current, status: current.data ? 'refreshing' : 'loading' }))
    fetchWeather(location, controller.signal)
      .then((data) => {
        writeJSON(CACHE_KEY, { location, data })
        setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setState((current) => ({
          status: 'error',
          data: current.data,
          error: error?.message || 'Gagal memuat cuaca.',
        }))
      })
    return () => controller.abort()
  }, [location, nonce])

  useEffect(() => {
    if (!location) return undefined
    const timer = window.setInterval(() => setNonce((n) => n + 1), REFRESH_MS)
    const onVisible = () => {
      const data = dataRef.current
      if (document.visibilityState === 'visible' && (!data || Date.now() - data.fetchedAt > STALE_MS)) {
        setNonce((n) => n + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onVisible)
    }
  }, [location])

  const setLocation = useCallback((next) => {
    writeJSON(LOCATION_KEY, next)
    setState({ status: 'loading', data: null, error: null })
    setLocationState(next)
  }, [])

  const clearLocation = useCallback(() => {
    removeKey(LOCATION_KEY)
    removeKey(CACHE_KEY)
    setState({ status: 'idle', data: null, error: null })
    setLocationState(null)
  }, [])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  return { location, ...state, setLocation, clearLocation, refresh }
}
