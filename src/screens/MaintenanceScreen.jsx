import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../providers/AuthProvider'

/** Halaman untuk pengguna biasa saat mode pemeliharaan aktif. */
export function MaintenanceScreen({ note }) {
  const { signOut } = useAuth()
  return (
    <main className="auth" id="main">
      <div className="auth-panel">
        <header className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <BrandMark size={36} />
          </span>
          <h1 className="auth-title">Sedang pemeliharaan</h1>
          <p className="auth-sub">
            {note || 'Kami sedang merapikan beberapa hal. Ruang kerjamu akan segera kembali.'}
          </p>
        </header>
        <button type="button" className="btn btn-ghost btn-block" onClick={signOut}>
          Keluar
        </button>
      </div>
    </main>
  )
}
