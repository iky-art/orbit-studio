import { useState } from 'react'
import { Icon } from './Icon'
import { useTeamLinks, useTeamMembers } from '../hooks/useTeams'
import { inviteUrl } from '../lib/invite'
import { formatRelative } from '../lib/format'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { LINK_DURATIONS, createInviteLink, linkState, revokeInviteLink } from '../services/teams'

const STATE_LABEL = { aktif: 'Aktif', kedaluwarsa: 'Kedaluwarsa', dicabut: 'Dicabut' }

/** Tautan undangan `/<token>/invite/<tim>`: buat, salin, bagikan, cabut. */
export function TeamLinks({ membership }) {
  const { session } = useAuth()
  const toast = useToast()
  const canManage = membership.role === 'owner' || membership.role === 'admin'
  const links = useTeamLinks(membership.teamId, canManage)
  const members = useTeamMembers(membership.teamId)
  const [days, setDays] = useState(7)
  const [busy, setBusy] = useState(false)

  if (!canManage) {
    return (
      <p className="section-note">
        Hanya pemilik dan admin tim yang bisa membuat tautan undangan. Minta salah satunya
        membagikan tautan kepadamu.
      </p>
    )
  }

  const create = async () => {
    setBusy(true)
    try {
      await createInviteLink(membership, days, session)
      toast.success('Tautan undangan dibuat.')
    } catch (error) {
      toast.error(error?.message || 'Gagal membuat tautan.')
    } finally {
      setBusy(false)
    }
  }

  const copy = async (link) => {
    const url = inviteUrl(link.id, link.teamSlug)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Tautan disalin.')
    } catch {
      window.prompt('Salin tautan ini:', url)
    }
  }

  const share = async (link) => {
    const url = inviteUrl(link.id, link.teamSlug)
    try {
      await navigator.share({
        title: `Gabung tim ${link.teamName}`,
        text: `${session.name} mengundangmu ke tim ${link.teamName} di Orbit Studio.`,
        url,
      })
    } catch {
      /* dibatalkan */
    }
  }

  const revoke = async (link) => {
    try {
      await revokeInviteLink(link)
      toast.success('Tautan dicabut.')
    } catch (error) {
      toast.error(error?.message || 'Gagal mencabut tautan.')
    }
  }

  return (
    <div className="team-detail">
      <p className="section-note">
        Siapa pun yang membuka tautan lalu masuk atau mendaftar bisa bergabung sebagai
        <b> anggota</b>. Bagikan hanya ke orang yang kamu percaya, dan cabut tautan bila sudah tidak
        dipakai.
      </p>

      <div className="support-form">
        <div className="field">
          <span className="field-label">Berlaku selama</span>
          <div className="chip-row" role="group" aria-label="Masa berlaku">
            {LINK_DURATIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={days === item.id}
                onClick={() => setDays(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="support-actions">
          <button type="button" className="btn btn-primary" onClick={create} disabled={busy}>
            <Icon name="send" size={16} />
            Buat tautan undangan
          </button>
        </div>
      </div>

      {links.rows.length === 0 ? (
        <p className="section-note">Belum ada tautan undangan.</p>
      ) : (
        <ul className="invite-links">
          {links.rows.map((link) => {
            const state = linkState(link)
            const joined = members.rows.filter((item) => item.linkId === link.id).length
            const url = inviteUrl(link.id, link.teamSlug)
            return (
              <li key={link.id} className="invite-link" data-state={state}>
                <p className="invite-link-url">{url}</p>
                <p className="invite-link-meta">
                  <span className="plan-tag">{STATE_LABEL[state]}</span>
                  {joined} bergabung · dibuat {formatRelative(link.createdAt)}
                  {state === 'aktif'
                    ? ` · berakhir ${formatRelative(new Date(link.expiresAtMs).toISOString())}`
                    : ''}
                </p>
                {state === 'aktif' ? (
                  <div className="support-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => copy(link)}>
                      Salin
                    </button>
                    {typeof navigator.share === 'function' ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => share(link)}>
                        Bagikan
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => revoke(link)}>
                      Cabut
                    </button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
