import { useState } from 'react'
import { Link } from '../lib/router'
import { DEMO_MODE } from '../services/db'
import {
  TEAM_ROLES,
  cancelInvitation,
  createTeam,
  deleteTeam,
  inviteMember,
  normalizeEmail,
  removeMember,
  setMemberRole,
} from '../services/teams'
import { useMyTeams, useTeamInvitations, useTeamMembers } from '../hooks/useTeams'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function TeamDetail({ membership, showRoomLink = false }) {
  const { session } = useAuth()
  const toast = useToast()
  const isOwner = membership.role === 'owner'
  const canManage = isOwner || membership.role === 'admin'
  const members = useTeamMembers(membership.teamId)
  const invites = useTeamInvitations(membership.teamId, canManage)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'leave' | 'delete'

  const run = async (task, success) => {
    setBusy(true)
    try {
      await task()
      if (success) toast.success(success)
    } catch (error) {
      toast.error(error?.message || 'Aksi gagal dijalankan.')
    } finally {
      setBusy(false)
    }
  }

  const invite = (event) => {
    event.preventDefault()
    const clean = normalizeEmail(email)
    if (!EMAIL_RE.test(clean)) {
      toast.error('Format email belum benar.')
      return
    }
    if (members.rows.some((item) => item.email === clean)) {
      toast.error('Orang ini sudah menjadi anggota.')
      return
    }
    if (invites.rows.some((item) => item.email === clean)) {
      toast.error('Undangan untuk email ini masih menunggu jawaban.')
      return
    }
    run(async () => {
      await inviteMember(membership, { email: clean, role }, session)
      setEmail('')
    }, 'Undangan dibuat. Penerima melihatnya di lonceng notifikasi saat masuk dengan email itu.')
  }

  return (
    <div className="team-detail">
      {showRoomLink ? (
        <div className="support-actions">
          <Link to={`/app/team/${membership.teamId}`} className="btn btn-primary btn-sm">
            Buka ruang tim
          </Link>
        </div>
      ) : null}

      <ul className="team-members">
        {members.rows.map((item) => {
          const isMe = item.uid === session.uid
          const canEdit = !isMe && item.role !== 'owner' && (isOwner || (canManage && item.role === 'member'))
          return (
            <li key={item.id} className="team-member">
              <div className="team-member-body">
                <p className="team-member-name">
                  {item.name}
                  {isMe ? ' (kamu)' : ''}
                </p>
                <p className="team-member-mail">{item.email}</p>
              </div>
              <span className="plan-tag">{TEAM_ROLES[item.role] ?? item.role}</span>
              {canEdit ? (
                <div className="team-member-actions">
                  {isOwner ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => setMemberRole(item, item.role === 'admin' ? 'member' : 'admin'),
                          'Peran anggota diubah.',
                        )
                      }
                    >
                      {item.role === 'admin' ? 'Jadikan anggota' : 'Jadikan admin'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy}
                    onClick={() => run(() => removeMember(item), 'Anggota dikeluarkan.')}
                  >
                    Keluarkan
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      {canManage ? (
        <>
          <form className="support-form" onSubmit={invite}>
            <label className="field">
              <span className="field-label">Undang lewat email</span>
              <input
                className="field-input"
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@contoh.id"
              />
            </label>
            {isOwner ? (
              <div className="chip-row" role="group" aria-label="Peran undangan">
                {['member', 'admin'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    aria-pressed={role === item}
                    onClick={() => setRole(item)}
                  >
                    {TEAM_ROLES[item]}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="support-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !email.trim()}>
                Undang
              </button>
            </div>
          </form>

          {invites.rows.length ? (
            <div>
              <h4 className="support-sub">Undangan menunggu</h4>
              <ul className="team-members">
                {invites.rows.map((item) => (
                  <li key={item.id} className="team-member">
                    <div className="team-member-body">
                      <p className="team-member-name">{item.email}</p>
                      <p className="team-member-mail">Sebagai {TEAM_ROLES[item.role] ?? item.role}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busy}
                      onClick={() => run(() => cancelInvitation(item), 'Undangan dibatalkan.')}
                    >
                      Batalkan
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="support-actions">
        {confirm ? (
          <>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    confirm === 'delete'
                      ? deleteTeam(membership, members.rows, invites.rows)
                      : removeMember(membership),
                  confirm === 'delete' ? 'Tim dihapus.' : 'Kamu keluar dari tim.',
                )
              }
            >
              {confirm === 'delete' ? 'Ya, hapus tim' : 'Ya, keluar'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(null)}>
              Batal
            </button>
          </>
        ) : isOwner ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm('delete')}>
            Hapus tim
          </button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm('leave')}>
            Keluar dari tim
          </button>
        )}
      </div>
    </div>
  )
}

/** Bagian "Tim" di Pengaturan: buat tim, undang, dan kelola anggota. */
export function TeamSection() {
  const { session } = useAuth()
  const toast = useToast()
  const mine = useMyTeams()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [openId, setOpenId] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const team = await createTeam(name, session)
      setName('')
      setOpenId(`${team.id}_${session.uid}`)
      toast.success('Tim dibuat. Sekarang undang anggotanya.')
    } catch (error) {
      toast.error(error?.message || 'Gagal membuat tim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="surface plan-section" aria-labelledby="team-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="team-title">
            Tim
          </h2>
          <p className="card-sub">Bentuk tim, undang rekan lewat email, dan atur peran mereka.</p>
        </div>
      </div>

      {DEMO_MODE ? (
        <p className="section-note">Fitur tim tersedia saat aplikasi terhubung ke Firebase.</p>
      ) : (
        <>
          {mine.rows.length === 0 ? (
            <p className="section-note">Kamu belum tergabung di tim mana pun.</p>
          ) : (
            <ul className="my-tickets">
              {mine.rows.map((item) => {
                const open = openId === item.id
                return (
                  <li key={item.id} className="my-ticket">
                    <button
                      type="button"
                      className="my-ticket-head"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : item.id)}
                    >
                      <span className="my-ticket-title">{item.teamName}</span>
                      <span className="plan-tag">{TEAM_ROLES[item.role] ?? item.role}</span>
                    </button>
                    {open ? <TeamDetail membership={item} showRoomLink /> : null}
                  </li>
                )
              })}
            </ul>
          )}

          <form className="support-actions" onSubmit={submit}>
            <input
              className="field-input"
              style={{ maxWidth: 260 }}
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama tim baru"
              aria-label="Nama tim baru"
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
              Buat tim
            </button>
          </form>
        </>
      )}
    </section>
  )
}
