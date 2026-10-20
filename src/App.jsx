import { useEffect } from 'react'
import { matchInvitePath, PENDING_INVITE_KEY } from './lib/invite'
import { useAuth } from './providers/AuthProvider'
import { readJSON } from './services/storage'
import { InvitePage } from './team/InvitePage'
import { Icon } from './components/Icon'
import { Link, useRouter } from './lib/router'
import { LandingPage } from './landing/LandingPage'
import { HelpPage } from './help/HelpPage'
import { LegalPage } from './legal/LegalPage'
import { getLegalTitle } from './legal/documents'
import { OrbitApp } from './screens/OrbitApp'

function NotFoundScreen({ path }) {
  return (
    <main className="denied" id="main">
      <div className="denied-card">
        <span className="denied-icon" aria-hidden="true">
          <Icon name="search" size={24} />
        </span>
        <h1 className="denied-title">Halaman tidak ditemukan</h1>
        <p className="denied-text">
          Tidak ada rute untuk <code>{path}</code>. Mungkin tautannya salah ketik,
          atau halaman sudah dipindahkan.
        </p>
        <div className="denied-links">
          <Link to="/" className="btn btn-ghost">
            <Icon name="arrowLeft" size={16} />
            Halaman utama
          </Link>
          <Link to="/app" className="btn btn-primary">
            Buka aplikasi
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function App() {
  const { path, navigate } = useRouter()
  const { session } = useAuth()
  const invite = matchInvitePath(path)

  // Setelah masuk/daftar dari tautan undangan, kembali ke halaman undangan itu.
  useEffect(() => {
    if (!session?.onboarded || !path.startsWith('/app')) return
    const pending = readJSON(PENDING_INVITE_KEY, null)
    if (pending?.token) {
      navigate(`/${pending.token}/invite/${pending.slug || 'tim'}`, { replace: true })
    }
  }, [session?.onboarded, session?.uid, path, navigate])

  // Dilepas setelah React menggambar, menggantikan splash inline di index.html.
  useEffect(() => {
    const boot = document.getElementById('boot-splash')
    if (!boot) return
    boot.classList.add('boot-splash-out')
    const timer = setTimeout(() => boot.remove(), 420)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (invite) return // judul diatur InvitePage
    if (path === '/help' || path.startsWith('/help/')) return // judul diatur HelpPage
    if (path === '/legal' || path.startsWith('/legal/')) {
      document.title = getLegalTitle(path)
      return
    }
    document.title = path.startsWith('/app')
      ? 'Orbit Studio Workbench'
      : 'Orbit Studio — ruang kerja fokus dengan konsol admin'
  }, [path])

  if (path === '/') return <LandingPage />
  if (path === '/app' || path.startsWith('/app/')) return <OrbitApp />
  if (path === '/help' || path.startsWith('/help/')) return <HelpPage path={path} />
  if (path === '/legal' || path.startsWith('/legal/')) return <LegalPage path={path} />
  if (invite) return <InvitePage token={invite.token} slug={invite.slug} />
  return <NotFoundScreen path={path} />
}
