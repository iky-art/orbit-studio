import { useEffect, useMemo, useState } from 'react'
import { normalizeEmail } from '../services/teams'
import { DEMO_MODE, subscribeDoc, subscribeMessages, subscribeWhere } from '../services/db'
import { useAuth } from '../providers/AuthProvider'

function useWhere(name, field, value, enabled = true) {
  const [state, setState] = useState({ status: 'loading', rows: [] })
  useEffect(() => {
    if (DEMO_MODE || !enabled || !value) {
      setState({ status: 'ready', rows: [] })
      return undefined
    }
    setState({ status: 'loading', rows: [] })
    return subscribeWhere(
      name,
      field,
      value,
      (rows) => setState({ status: 'ready', rows }),
      () => setState({ status: 'error', rows: [] }),
    )
  }, [name, field, value, enabled])
  return state
}

/** Keanggotaan tim milik pengguna yang masuk (real-time). */
export function useMyTeams() {
  const { session } = useAuth()
  const state = useWhere('memberships', 'uid', session?.uid)
  const rows = useMemo(
    () => state.rows.slice().sort((a, b) => String(a.teamName).localeCompare(String(b.teamName), 'id')),
    [state.rows],
  )
  return { ...state, rows }
}

export function useTeamMembers(teamId) {
  const state = useWhere('memberships', 'teamId', teamId)
  const rows = useMemo(() => {
    const order = { owner: 0, admin: 1, member: 2 }
    return state.rows
      .slice()
      .sort((a, b) => (order[a.role] ?? 3) - (order[b.role] ?? 3) || String(a.name).localeCompare(String(b.name), 'id'))
  }, [state.rows])
  return { ...state, rows }
}

export function useTeamInvitations(teamId, enabled) {
  const state = useWhere('invitations', 'teamId', teamId, enabled)
  const rows = useMemo(
    () =>
      state.rows
        .filter((item) => item.status === 'tertunda')
        .sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt))),
    [state.rows],
  )
  return { ...state, rows }
}

/** Undangan tim yang menunggu jawaban untuk email pengguna ini. */
export function useMyInvitations() {
  const { session } = useAuth()
  const email = normalizeEmail(session?.email)
  const state = useWhere('invitations', 'email', email)
  const rows = useMemo(() => {
    const now = new Date().toISOString()
    return state.rows
      .filter((item) => item.status === 'tertunda' && (!item.expiresAt || item.expiresAt > now))
      .sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)))
  }, [state.rows])
  return { ...state, rows }
}

/** Dokumen tim (catatan tim). */
export function useTeam(teamId) {
  const [team, setTeam] = useState(null)
  useEffect(() => {
    if (DEMO_MODE || !teamId) return undefined
    return subscribeDoc('teams', teamId, (doc) => setTeam(doc), () => {})
  }, [teamId])
  return team
}

/** Tautan undangan milik tim (hanya admin yang boleh membaca daftarnya). */
export function useTeamLinks(teamId, enabled) {
  const state = useWhere('teamLinks', 'teamId', teamId, enabled)
  const rows = useMemo(
    () => state.rows.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [state.rows],
  )
  return { ...state, rows }
}

/** 100 pesan obrolan tim terbaru (urut lama ke baru), real-time. */
export function useTeamMessages(teamId) {
  const [state, setState] = useState({ status: 'loading', rows: [] })
  useEffect(() => {
    if (DEMO_MODE || !teamId) {
      setState({ status: 'ready', rows: [] })
      return undefined
    }
    setState({ status: 'loading', rows: [] })
    return subscribeMessages(
      teamId,
      (rows) => setState({ status: 'ready', rows }),
      () => setState({ status: 'error', rows: [] }),
    )
  }, [teamId])
  return state
}
