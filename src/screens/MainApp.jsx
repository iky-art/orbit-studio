import { useEffect } from 'react'
import { BottomDock, NAV_ITEMS } from '../components/BottomDock'
import { BroadcastBanner } from '../components/BroadcastBanner'
import { SystemBanner } from '../components/SystemBanner'
import { VerifyEmailBanner } from '../components/VerifyEmailBanner'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { InstallBanner } from '../components/InstallBanner'
import { matchPath, useRouter } from '../lib/router'
import { ActivityView } from '../views/ActivityView'
import { HomeView } from '../views/HomeView'
import { InsightsView } from '../views/InsightsView'
import { SettingsView } from '../views/SettingsView'
import { TeamRoomView } from '../views/TeamRoomView'

const VIEW_IDS = NAV_ITEMS.map((item) => item.id)

export function MainApp() {
  const { path, navigate } = useRouter()

  const match = matchPath('/app/:section?', path)
  const teamId = matchPath('/app/team/:teamId', path)?.teamId ?? null
  const requested = match?.section ?? 'home'
  // Ruang tim dibuka dari Pengaturan, jadi tab Pengaturan tetap menyala.
  const view = teamId ? 'settings' : VIEW_IDS.includes(requested) ? requested : 'home'

  useEffect(() => {
    if (match?.section && !VIEW_IDS.includes(match.section)) {
      navigate('/app', { replace: true, scroll: false })
    }
  }, [match, navigate])

  const renderView = () => {
    switch (view) {
      case 'activity':
        return <ActivityView />
      case 'insights':
        return <InsightsView />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView onNavigate={(next) => navigate(`/app/${next}`)} />
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <div className="app-shell">
        <Header />

        <InstallBanner />

        <VerifyEmailBanner />

        <SystemBanner />

        <BroadcastBanner />

        <main id="main">
          {teamId ? (
            <div className="view" key={`team-${teamId}`}>
              <TeamRoomView teamId={teamId} />
            </div>
          ) : null}
          {(teamId ? [] : NAV_ITEMS).map((item) => {
            const active = view === item.id
            return (
              <section
                key={item.id}
                id={`panel-${item.id}`}
                role="tabpanel"
                aria-labelledby={`dock-${item.id}`}
                hidden={!active}
                tabIndex={0}
              >
                {active ? (
                  <div className="view" key={item.id}>
                    {renderView()}
                  </div>
                ) : null}
              </section>
            )
          })}
        </main>

        <Footer />
      </div>

      <BottomDock view={view} onSelect={(id) => navigate(id === 'home' ? '/app' : `/app/${id}`)} />
    </>
  )
}
