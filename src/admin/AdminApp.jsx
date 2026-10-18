import { useEffect } from 'react'
import { Icon } from '../components/Icon'
import { matchPath, useRouter } from '../lib/router'
import { AdminLayout } from './AdminLayout'
import { DEFAULT_PANEL, getPanel } from './panels'
import { EmptyState } from './components/PanelChrome'

export function AdminApp() {
  const { path, navigate } = useRouter()
  const match = matchPath('/app/admin/:panel?', path)
  const panelId = match?.panel ?? DEFAULT_PANEL
  const panel = getPanel(panelId)

  useEffect(() => {
    if (!match?.panel) navigate(`/app/admin/${DEFAULT_PANEL}`, { replace: true, scroll: false })
  }, [match, navigate])

  return (
    <AdminLayout panel={panel}>
      {panel ? (
        <panel.Panel />
      ) : (
        <EmptyState
          icon="search"
          title="Panel tidak ditemukan"
          message={`Tidak ada panel dengan nama "${panelId}".`}
          action={
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/app/admin/${DEFAULT_PANEL}`)}>
              <Icon name="arrowLeft" size={16} />
              Kembali ke ringkasan
            </button>
          }
        />
      )}
    </AdminLayout>
  )
}
