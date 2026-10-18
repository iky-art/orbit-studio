import { useCallback, useEffect, useState } from 'react'
import { logAudit } from '../lib/audit'
import { create, list, remove, subscribe, update } from '../services/db'
import { useAuth } from '../providers/AuthProvider'

/**
 * Muat koleksi data dengan status loading/error/empty yang eksplisit.
 * Menyediakan mutasi optimistis sederhana untuk panel admin.
 */
export function useCollection(name) {
  const { user } = useAuth()
  const actor = user?.name
  const [state, setState] = useState({ status: 'loading', rows: [], error: null })

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, status: current.rows.length ? 'refreshing' : 'loading', error: null }))
    try {
      const rows = await list(name)
      setState({ status: rows.length ? 'ready' : 'empty', rows, error: null })
    } catch (error) {
      setState({ status: 'error', rows: [], error })
    }
  }, [name])

  useEffect(() => {
    setState({ status: 'loading', rows: [], error: null })
    // Real-time di mode Firebase; sekali muat di mode demo.
    const stop = subscribe(
      name,
      (rows) => setState({ status: rows.length ? 'ready' : 'empty', rows, error: null }),
      (error) => setState({ status: 'error', rows: [], error }),
    )
    return stop
  }, [name])

  const patch = useCallback(
    async (id, changes) => {
      setState((current) => ({
        ...current,
        rows: current.rows.map((row) =>
          String(row.id) === String(id) ? { ...row, ...changes } : row,
        ),
      }))
      await update(name, id, changes)
      if (name !== 'auditLog') logAudit({ actor, action: `ubah ${name}`, target: id })
    },
    [name, actor],
  )

  const destroy = useCallback(
    async (id) => {
      setState((current) => ({
        ...current,
        rows: current.rows.filter((row) => String(row.id) !== String(id)),
      }))
      await remove(name, id)
      if (name !== 'auditLog')
        logAudit({ actor, action: `hapus ${name}`, target: id, severity: 'peringatan' })
    },
    [name, actor],
  )

  const insert = useCallback(
    async (doc) => {
      const created = await create(name, doc)
      setState((current) => ({
        ...current,
        status: 'ready',
        rows: [created, ...current.rows.filter((row) => String(row.id) !== String(created.id))],
      }))
      if (name !== 'auditLog')
        logAudit({ actor, action: `buat ${name}`, target: created.id })
      return created
    },
    [name, actor],
  )

  return { ...state, refresh, patch, destroy, insert }
}
