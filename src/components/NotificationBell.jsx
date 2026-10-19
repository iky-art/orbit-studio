import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useMyInvitations } from '../hooks/useTeams'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { acceptInvitation, declineInvitation } from '../services/teams'
import { formatRelative } from '../lib/format'

/** Lonceng notifikasi: pengumuman yang diterbitkan admin. */
export function NotificationBell() {
  const { items, unread, read, markAllRead } = useAnnouncements()
  const invites = useMyInvitations()
  const { session } = useAuth()
  const toast = useToast()
  const [working, setWorking] = useState(null)
  const total = unread + invites.rows.length

  const answer = async (invitation, accept) => {
    setWorking(invitation.id)
    try {
      if (accept) {
        await acceptInvitation(invitation, session)
        toast.success(`Kamu bergabung ke tim ${invitation.teamName}.`)
      } else {
        await declineInvitation(invitation)
        toast.info('Undangan ditolak.')
      }
    } catch (error) {
      toast.error(error?.message || 'Gagal menjawab undangan.')
    } finally {
      setWorking(null)
    }
  }
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={total ? `Notifikasi, ${total} belum dibaca` : 'Notifikasi'}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="bell" size={20} />
        {total ? <span className="bell-badge">{total > 9 ? '9+' : total}</span> : null}
      </button>

      {open ? (
        <div className="bell-pop" role="dialog" aria-label="Notifikasi">
          <div className="bell-head">
            <b>Notifikasi</b>
            {unread ? (
              <button type="button" className="bell-link" onClick={markAllRead}>
                Tandai dibaca
              </button>
            ) : null}
          </div>
          {invites.rows.length ? (
            <ul className="bell-list" aria-label="Undangan tim">
              {invites.rows.map((invitation) => (
                <li key={invitation.id} className="is-unread">
                  <p className="bell-title">Undangan tim {invitation.teamName}</p>
                  <p className="bell-body">
                    {invitation.invitedBy} mengundangmu sebagai{' '}
                    {invitation.role === 'admin' ? 'admin' : 'anggota'}.
                  </p>
                  <div className="support-actions" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={working === invitation.id}
                      onClick={() => answer(invitation, true)}
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={working === invitation.id}
                      onClick={() => answer(invitation, false)}
                    >
                      Tolak
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {items.length === 0 ? (
            invites.rows.length ? null : <p className="bell-empty">Belum ada pengumuman.</p>
          ) : (
            <ul className="bell-list">
              {items.map((item) => (
                <li key={item.id} className={read.includes(item.id) ? '' : 'is-unread'}>
                  <p className="bell-title">{item.title}</p>
                  {item.body ? <p className="bell-body">{item.body}</p> : null}
                  <p className="bell-time">{formatRelative(item.publishAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
