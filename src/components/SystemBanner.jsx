import { BroadcastItem } from './BroadcastBanner'
import { useAppStatus } from '../hooks/useAppStatus'
import { useAuth } from '../providers/AuthProvider'

/** Peringatan status layanan dan mode pemeliharaan di ruang kerja. */
export function SystemBanner() {
  const { maintenance, issues } = useAppStatus()
  const { isAdmin } = useAuth()
  const outage = issues.some((item) => item.status === 'gangguan')

  if (!(maintenance && isAdmin) && issues.length === 0) return null

  return (
    <section className="broadcast-stack" aria-label="Status layanan">
      {maintenance && isAdmin ? (
        <BroadcastItem
          tone="warning"
          title="Mode pemeliharaan aktif"
          body="Pengguna biasa melihat halaman pemeliharaan. Hanya admin yang bisa masuk."
        />
      ) : null}
      {issues.length ? (
        <BroadcastItem
          tone={outage ? 'danger' : 'warning'}
          title={outage ? 'Ada gangguan layanan' : 'Sebagian layanan melambat'}
          body={issues.map((item) => `${item.name}: ${item.status}`).join(' · ')}
        />
      ) : null}
    </section>
  )
}
