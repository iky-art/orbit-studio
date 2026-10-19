import { useState } from 'react'
import { Icon } from './Icon'
import { MODE } from '../firebase/config'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'

/** Ajakan memverifikasi email untuk akun email/kata sandi di mode Firebase. */
export function VerifyEmailBanner() {
  const { session, sendVerification, refreshVerification } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  if (MODE !== 'firebase' || !session || session.emailVerified !== false) return null

  const resend = async () => {
    setBusy(true)
    try {
      await sendVerification()
      toast.success(`Email verifikasi dikirim ke ${session.email}.`)
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim email verifikasi.')
    } finally {
      setBusy(false)
    }
  }

  const check = async () => {
    setBusy(true)
    try {
      const ok = await refreshVerification()
      if (ok) toast.success('Email terverifikasi. Terima kasih!')
      else toast.info('Belum terverifikasi. Buka tautan di emailmu lalu coba lagi.')
    } catch (error) {
      toast.error(error.message || 'Gagal memeriksa status.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="broadcast-stack" aria-label="Verifikasi email">
      <aside className="broadcast broadcast-warning" role="status">
        <span className="broadcast-icon" aria-hidden="true">
          <Icon name="mail" size={18} strokeWidth={1.9} />
        </span>
        <div className="broadcast-body">
          <p className="broadcast-title">Verifikasi emailmu</p>
          <p className="broadcast-text">
            Kami mengirim tautan ke {session.email}. Cek kotak masuk atau folder spam.
          </p>
          <div className="support-actions" style={{ marginTop: 10 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={check} disabled={busy}>
              Sudah verifikasi
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resend} disabled={busy}>
              Kirim ulang
            </button>
          </div>
        </div>
      </aside>
    </section>
  )
}
