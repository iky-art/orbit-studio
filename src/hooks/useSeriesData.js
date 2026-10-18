import { useMemo } from 'react'
import { useCollection } from './useCollection'
import { buildSeries } from '../lib/series'
import { DEMO_MODE } from '../services/db'

/**
 * Deret harian untuk Ikhtisar & Analitik.
 * Mode demo: data contoh. Mode Firebase: dihitung dari pengguna dan aktivitas nyata.
 */
export function useSeriesData() {
  const demo = useCollection('series')
  const users = useCollection('users')
  const activities = useCollection('activities')

  return useMemo(() => {
    if (DEMO_MODE) return demo
    const loading = users.status === 'loading' || activities.status === 'loading'
    return {
      status: loading ? 'loading' : 'ready',
      rows: loading ? [] : buildSeries(users.rows, activities.rows),
    }
  }, [demo, users.status, users.rows, activities.status, activities.rows])
}
