import { useCallback, useEffect, useMemo, useState } from 'react'
import { activity, insights, metrics, week } from '../data/dashboard'
import { computeDashboard } from '../lib/stats'
import { DEMO_MODE, create, remove as removeDoc, subscribeWhere } from '../services/db'
import { useAuth } from '../providers/AuthProvider'

const DEMO = {
  items: activity,
  metrics,
  week,
  insights,
  summary: 'Fokus minggu ini stabil. Satu sesi lagi untuk menutup target harian sebelum sore.',
  total: activity.length,
}

/**
 * Data dasbor. Mode Firebase: dihitung real-time dari koleksi `activities`
 * milik pengguna yang masuk. Mode demo: data contoh.
 */
export function useDashboard() {
  const { session } = useAuth()
  const uid = session?.uid
  const [state, setState] = useState({ status: 'loading', rows: [], error: null })

  useEffect(() => {
    if (DEMO_MODE || !uid) return undefined
    setState({ status: 'loading', rows: [], error: null })
    return subscribeWhere(
      'activities',
      'uid',
      uid,
      (rows) => setState({ status: 'ready', rows, error: null }),
      (error) => setState({ status: 'error', rows: [], error }),
    )
  }, [uid])

  const data = useMemo(
    () => (DEMO_MODE ? DEMO : computeDashboard(state.rows)),
    [state.rows],
  )

  const add = useCallback(
    async ({ type, title, project, minutes }) => {
      const doc = {
        uid,
        type,
        title: title.trim(),
        project: (project || '').trim(),
        createdAt: new Date().toISOString(),
      }
      const mins = Number(minutes)
      if (mins > 0) doc.minutes = Math.round(mins)
      return create('activities', doc)
    },
    [uid],
  )

  const remove = useCallback((id) => removeDoc('activities', id), [])

  return {
    demo: DEMO_MODE,
    status: DEMO_MODE ? 'ready' : state.status,
    error: state.error,
    user: session,
    ...data,
    add,
    remove,
  }
}
