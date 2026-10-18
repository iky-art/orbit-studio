import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { audienceMatches, broadcastState } from '../lib/broadcast'
import { subscribe } from '../services/db'
import { readJSON, writeJSON } from '../services/storage'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'

const KEY = 'broadcast:dismissed'

/**
 * Broadcast dari admin untuk pengguna yang sedang masuk.
 * Real-time: pesan yang baru dikirim langsung muncul tanpa muat ulang.
 */
export function useBroadcasts() {
  const { session } = useAuth()
  const toast = useToast()
  const uid = session?.uid
  const role = session?.role

  const [rows, setRows] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [dismissed, setDismissed] = useState(() => readJSON(KEY, []))
  const [tick, setTick] = useState(0)
  const seen = useRef(null)

  useEffect(() => {
    if (!uid) return undefined
    seen.current = null
    setLoaded(false)
    return subscribe(
      'broadcasts',
      (next) => {
        setRows(next)
        setLoaded(true)
      },
      () => {},
    )
  }, [uid])

  // cek kedaluwarsa tiap menit
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60000)
    return () => window.clearInterval(id)
  }, [])

  const active = useMemo(() => {
    const now = Date.now()
    return rows
      .filter((row) => broadcastState(row, now) === 'aktif' && audienceMatches(row.audience, role))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, role, tick])

  // toast untuk pesan yang datang setelah pemuatan awal
  useEffect(() => {
    if (!loaded) return
    const ids = new Set(active.map((row) => row.id))
    if (seen.current) {
      active
        .filter((row) => !seen.current.has(row.id) && !dismissed.includes(row.id))
        .forEach((row) => toast.info(`Pesan baru: ${row.title}`))
    }
    seen.current = ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, loaded])

  const dismiss = useCallback((id) => {
    setDismissed((current) => {
      const next = [...current.filter((x) => x !== id), id].slice(-50)
      writeJSON(KEY, next)
      return next
    })
  }, [])

  const items = useMemo(
    () => active.filter((row) => !dismissed.includes(row.id)).slice(0, 3),
    [active, dismissed],
  )

  return { items, dismiss }
}
