import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEMO_MODE, subscribe, subscribeWhere } from '../services/db'
import { readJSON, writeJSON } from '../services/storage'
import { useAuth } from '../providers/AuthProvider'

const KEY = 'announce:read'

function audienceMatches(audience, { isAdmin, plan }) {
  if (audience === 'Admin') return isAdmin
  if (audience === 'Plan Studio') return String(plan || '').toLowerCase() === 'studio'
  return true
}

/**
 * Pengumuman yang diterbitkan admin untuk pengguna ini (real-time).
 * Tampil di lonceng notifikasi pada header.
 */
export function useAnnouncements() {
  const { session, user, isAdmin } = useAuth()
  const uid = session?.uid
  const plan = user?.plan
  const [rows, setRows] = useState([])
  const [read, setRead] = useState(() => readJSON(KEY, []))

  useEffect(() => {
    if (!uid) return undefined
    const onData = (next) => setRows(next)
    const onError = () => {}
    return DEMO_MODE
      ? subscribe('announcements', onData, onError)
      : subscribeWhere('announcements', 'status', 'terbit', onData, onError)
  }, [uid])

  const items = useMemo(() => {
    const now = new Date().toISOString()
    return rows
      .filter(
        (row) =>
          row.status === 'terbit' &&
          (!row.publishAt || String(row.publishAt) <= now) &&
          audienceMatches(row.audience, { isAdmin, plan }),
      )
      .sort((a, b) => String(b.publishAt).localeCompare(String(a.publishAt)))
      .slice(0, 20)
  }, [rows, isAdmin, plan])

  const unread = items.filter((item) => !read.includes(item.id)).length

  const markAllRead = useCallback(() => {
    setRead((current) => {
      const next = Array.from(new Set([...current, ...items.map((item) => item.id)])).slice(-100)
      writeJSON(KEY, next)
      return next
    })
  }, [items])

  return { items, unread, read, markAllRead }
}
