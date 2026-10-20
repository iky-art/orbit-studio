import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { useMyTeams } from '../hooks/useTeams'
import { PENDING_INVITE_KEY } from '../lib/invite'
import { LegalHeader } from '../legal/LegalPage'
import { Link, useRouter } from '../lib/router'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { DEMO_MODE } from '../services/db'
import { removeKey, writeJSON } from '../services/storage'
import { getInviteLink, joinViaLink, linkState } from '../services/teams'

/** Halaman tujuan tautan undangan: /<token>/invite/<slug-tim>. */
export function InvitePage({ token, slug }) {
  const { session, booting } = useAuth()
  const { navigate } = useRouter()
  const toast = useToast()
  const mine = useMyTeams()
  const [state, setState] = useState({ status: DEMO_MODE ? 'demo' : 'loading', link: null })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Undangan tim — Orbit Studio'
  }, [])

  useEffect(() => {
    if (DEMO_MODE) return undefined
    let alive = true
    getInviteLink(token)
      .then((link) => alive && setState({ status: 'ready', link }))
      .catch(() => alive && setState({ status: 'error', link: null }))
    return () => {
      alive = false
    }
  }, [token])

  const { link } = state
  const valid = Boolean(link) && linkState(link) === 'aktif'
  const alreadyMember = Boolean(link) && mine.rows.some((item) => item.teamId === link.teamId)

  // Tautan yang tidak berlaku tidak perlu diingat untuk setelah masuk.
  useEffect(() => {
    if (state.status !== 'loading' && !valid) removeKey(PENDING_INVITE_KEY)
  }, [state.status, valid])

  const goSignIn = () => {
    writeJSON(PENDING_INVITE_KEY, { token, slug })
    navigate('/app')
  }

  const join = async () => {
    setBusy(true)
    try {
      await joinViaLink(link, session)
      removeKey(PENDING_INVITE_KEY)
      toast.success(`Kamu bergabung ke tim ${link.teamName}.`)
      navigate(`/app/team/${link.teamId}`, { replace: true })
    } catch (error) {
      toast.error(
        error?.code === 'permission-denied'
          ? 'Tidak bisa bergabung: tautan sudah tidak berlaku atau akunmu dibatasi.'
          : error?.message || 'Gagal bergabung ke tim.',
      )
    } finally {
      setBusy(false)
    }
  }

  const leaveLater = () => {
    removeKey(PENDING_INVITE_KEY)
    navigate(session ? '/app' : '/')
  }

  return (
    <div className="legal-shell">
      <LegalHeader sub="Undangan" />
      <main id="main" className="legal-main">
        <section className="surface invite-card">
          {state.status === 'loading' || booting ? (
            <p className="section-note">Memeriksa undangan…</p>
          ) : state.status === 'demo' ? (
            <>
              <h1 className="legal-title">Undangan tim</h1>
              <p className="legal-lead">Undangan tim butuh aplikasi yang terhubung ke Firebase.</p>
            </>
          ) : state.status === 'error' || !valid ? (
            <>
              <span className="invite-icon" aria-hidden="true">
                <Icon name="alert" size={26} />
              </span>
              <h1 className="legal-title">Tautan tidak berlaku</h1>
              <p className="legal-lead">
                {link && linkState(link) === 'kedaluwarsa'
                  ? 'Tautan undangan ini sudah kedaluwarsa.'
                  : link && linkState(link) === 'dicabut'
                    ? 'Tautan undangan ini sudah dicabut oleh admin tim.'
                    : 'Tautan salah atau tidak ditemukan.'}{' '}
                Minta admin tim membuat tautan baru.
              </p>
              <Link to={session ? '/app' : '/'} className="btn btn-ghost">
                {session ? 'Buka aplikasi' : 'Ke halaman utama'}
              </Link>
            </>
          ) : (
            <>
              <span className="invite-icon" aria-hidden="true">
                <Icon name="users" size={26} />
              </span>
              <p className="legal-eyebrow">Undangan tim</p>
              <h1 className="legal-title">{link.teamName}</h1>
              <p className="legal-lead">
                {link.createdByName} mengundangmu bergabung ke tim <b>{link.teamName}</b> di Orbit
                Studio sebagai anggota.
              </p>

              {!session ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={goSignIn}>
                    Masuk atau daftar untuk bergabung
                  </button>
                  <p className="section-note">
                    Setelah masuk, kamu otomatis kembali ke sini untuk menyelesaikan undangan.
                  </p>
                </>
              ) : alreadyMember ? (
                <>
                  <p className="section-note">Kamu sudah menjadi anggota tim ini.</p>
                  <Link to={`/app/team/${link.teamId}`} className="btn btn-primary">
                    Buka ruang tim
                  </Link>
                </>
              ) : (
                <>
                  <p className="section-note">
                    Masuk sebagai <b>{session.name}</b> ({session.email}).
                  </p>
                  <div className="support-actions">
                    <button type="button" className="btn btn-primary" onClick={join} disabled={busy}>
                      {busy ? 'Bergabung…' : 'Gabung ke tim'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={leaveLater}>
                      Nanti saja
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
