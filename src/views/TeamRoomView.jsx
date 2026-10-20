import { useState } from 'react'
import { TeamChat } from '../components/TeamChat'
import { TeamDetail } from '../components/TeamSection'
import { TeamLinks } from '../components/TeamLinks'
import { ViewHeader } from '../components/ViewHeader'
import { useMyTeams, useTeam, useTeamMembers } from '../hooks/useTeams'
import { Link } from '../lib/router'
import { formatRelative } from '../lib/format'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { DEMO_MODE } from '../services/db'
import { TEAM_ROLES, setTeamNotice } from '../services/teams'

const TABS = [
  { id: 'chat', label: 'Obrolan' },
  { id: 'members', label: 'Anggota' },
  { id: 'links', label: 'Tautan' },
]

/** Ruang khusus tim: obrolan, catatan tim, anggota, dan tautan undangan. */
export function TeamRoomView({ teamId }) {
  const { session } = useAuth()
  const toast = useToast()
  const mine = useMyTeams()
  const members = useTeamMembers(teamId)
  const team = useTeam(teamId)
  const [tab, setTab] = useState('chat')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const membership = mine.rows.find((item) => item.teamId === teamId)
  const canManage = membership?.role === 'owner' || membership?.role === 'admin'

  if (DEMO_MODE) {
    return <p className="section-note">Ruang tim tersedia saat aplikasi terhubung ke Firebase.</p>
  }
  if (mine.status === 'loading') return <p className="section-note">Memuat ruang tim…</p>
  if (!membership) {
    return (
      <section className="surface plan-section">
        <h1 className="card-title">Kamu bukan anggota tim ini</h1>
        <p className="section-note">
          Minta pemilik atau admin tim mengirim tautan undangan, atau buka{' '}
          <Link to="/app/settings">Pengaturan → Tim</Link>.
        </p>
      </section>
    )
  }

  const saveNotice = async () => {
    setBusy(true)
    try {
      await setTeamNotice(teamId, draft, session)
      setEditing(false)
      toast.success('Catatan tim disimpan.')
    } catch (error) {
      toast.error(error?.message || 'Gagal menyimpan catatan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ViewHeader
        eyebrow="Ruang tim"
        title={membership.teamName}
        sub={`${members.rows.length} anggota · kamu ${(TEAM_ROLES[membership.role] ?? membership.role).toLowerCase()}`}
      />

      <div className="section">
        <Link to="/app/settings" className="btn btn-ghost btn-sm">
          Kembali ke Pengaturan
        </Link>
      </div>

      {team?.notice || canManage ? (
        <div className="section">
          <section className="surface plan-section" aria-labelledby="notice-title">
            <div className="section-head">
              <div>
                <h2 className="card-title" id="notice-title">
                  Catatan tim
                </h2>
                {team?.noticeBy ? (
                  <p className="card-sub">
                    {team.noticeBy} · {formatRelative(team.noticeAt)}
                  </p>
                ) : null}
              </div>
              {canManage && !editing ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setDraft(team?.notice ?? '')
                    setEditing(true)
                  }}
                >
                  Ubah
                </button>
              ) : null}
            </div>
            {editing ? (
              <div className="support-form">
                <textarea
                  className="field-input"
                  rows={4}
                  maxLength={500}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Pengumuman, aturan, atau tautan penting untuk tim."
                />
                <div className="support-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={saveNotice} disabled={busy}>
                    Simpan
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p className="team-notice">{team?.notice || 'Belum ada catatan.'}</p>
            )}
          </section>
        </div>
      ) : null}

      <div className="section">
        <section className="surface plan-section">
          <div className="chip-row" role="tablist" aria-label="Bagian ruang tim">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className="chip"
                aria-selected={tab === item.id}
                aria-pressed={tab === item.id}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'chat' ? <TeamChat membership={membership} canModerate={canManage} /> : null}
          {tab === 'members' ? <TeamDetail membership={membership} /> : null}
          {tab === 'links' ? <TeamLinks membership={membership} /> : null}
        </section>
      </div>
    </>
  )
}
