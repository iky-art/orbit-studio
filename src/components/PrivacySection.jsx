import { useState } from 'react'
import { MODE } from '../firebase/config'
import { downloadJson } from '../lib/download'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'

const CONFIRM_WORD = 'HAPUS'

/** Hak atas data: unduh semua data dan hapus akun secara mandiri. */
export function PrivacySection() {
  const { session, isAdmin, exportMyData, deleteAccount } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [word, setWord] = useState('')
  const [password, setPassword] = useState('')

  const needsPassword = MODE === 'firebase' && session?.provider !== 'google.com'

  const exportData = async () => {
    setBusy(true)
    try {
      const data = await exportMyData()
      downloadJson(`orbit-data-${new Date().toISOString().slice(0, 10)}.json`, data)
      toast.success('Data akunmu diunduh sebagai JSON.')
    } catch (error) {
      toast.error(error.message || 'Gagal mengekspor data.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (word.trim().toUpperCase() !== CONFIRM_WORD) return
    setBusy(true)
    try {
      await deleteAccount({ password })
      toast.success('Akunmu sudah dihapus.')
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus akun.')
      setBusy(false)
    }
  }

  return (
    <section className="surface plan-section" aria-labelledby="privacy-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="privacy-title">
            Data & privasi
          </h2>
          <p className="card-sub">
            Unduh semua datamu atau hapus akunmu kapan saja, tanpa perlu menghubungi siapa pun.
          </p>
        </div>
      </div>

      <div className="support-actions">
        <button type="button" className="btn btn-ghost" onClick={exportData} disabled={busy}>
          Unduh data saya
        </button>
        {isAdmin ? null : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming((value) => !value)}
            disabled={busy}
          >
            Hapus akun
          </button>
        )}
      </div>

      {isAdmin ? (
        <p className="section-note">
          Akun owner/admin tidak bisa dihapus dari sini. Turunkan perannya lebih dulu lewat konsol
          admin.
        </p>
      ) : null}

      {confirming && !isAdmin ? (
        <div className="support-form danger-zone">
          <p className="section-note">
            Tindakan ini permanen: profil, catatan aktivitas, tiket, masukan, dan keanggotaan timmu
            ikut terhapus. Unduh datamu dulu bila perlu.
          </p>
          {needsPassword ? (
            <label className="field">
              <span className="field-label">Kata sandi (untuk konfirmasi)</span>
              <input
                className="field-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          ) : null}
          <label className="field">
            <span className="field-label">
              Ketik <b>{CONFIRM_WORD}</b> untuk melanjutkan
            </span>
            <input
              className="field-input"
              value={word}
              onChange={(event) => setWord(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="support-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={remove}
              disabled={busy || word.trim().toUpperCase() !== CONFIRM_WORD || (needsPassword && !password)}
            >
              {busy ? 'Menghapus…' : 'Hapus akun saya'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Batal
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
