import { useAppStatus } from '../hooks/useAppStatus'
import { MaintenanceScreen } from './MaintenanceScreen'
import { Icon } from '../components/Icon'
import { Link, useRouter } from '../lib/router'
import { AdminApp } from '../admin/AdminApp'
import { useAuth } from '../providers/AuthProvider'
import { AuthScreen } from './AuthScreen'
import { MainApp } from './MainApp'
import { OnboardingScreen } from './OnboardingScreen'
import { SplashScreen } from './SplashScreen'

/** Layar untuk peran yang bukan owner/admin. */
function AdminDenied() {
  return (
    <main className="denied" id="main">
      <div className="denied-card">
        <span className="denied-icon" aria-hidden="true">
          <Icon name="lock" size={24} />
        </span>
        <h1 className="denied-title">Konsol admin dibatasi</h1>
        <p className="denied-text">
          Halaman ini hanya untuk peran <b>owner</b> dan <b>admin</b>. Akunmu saat
          ini tidak memiliki izin membuka panel pengelolaan.
        </p>
        <Link to="/app" className="btn btn-primary">
          <Icon name="arrowLeft" size={16} />
          Kembali ke aplikasi
        </Link>
      </div>
    </main>
  )
}

/**
 * Gerbang alur aplikasi:
 * splash → masuk/daftar → onboarding → ruang kerja (atau konsol admin).
 */
export function OrbitApp() {
  const { path } = useRouter()
  const { booting, session, isAdmin } = useAuth()
  const { maintenance, maintenanceNote } = useAppStatus()

  if (booting) return <SplashScreen />
  if (!session) return <AuthScreen />
  if (maintenance && !isAdmin) return <MaintenanceScreen note={maintenanceNote} />
  if (!session.onboarded) return <OnboardingScreen />

  if (path.startsWith('/app/admin')) {
    if (!isAdmin) return <AdminDenied />
    return <AdminApp />
  }

  return <MainApp />
}
