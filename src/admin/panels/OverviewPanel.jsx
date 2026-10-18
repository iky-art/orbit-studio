import { useMemo } from 'react'
import { Icon } from '../../components/Icon'
import { MODE } from '../../firebase/config'
import { useCollection } from '../../hooks/useCollection'
import { useSeriesData } from '../../hooks/useSeriesData'
import { Link } from '../../lib/router'
import { formatCompact, formatCurrency, formatRelative } from '../../lib/format'
import { Badge, SeverityMark } from '../components/Badge'
import { BarSeries, LoadingRows, PanelHeader, Sparkline, StatStrip } from '../components/PanelChrome'

const QUICK = [
  { to: '/app/admin/users', label: 'Kelola pengguna', icon: 'users' },
  { to: '/app/admin/subscriptions', label: 'Tinjau langganan', icon: 'refresh' },
  { to: '/app/admin/tickets', label: 'Antrean dukungan', icon: 'ticket' },
  { to: '/app/admin/audit-log', label: 'Jejak audit', icon: 'list' },
]

export function OverviewPanel() {
  const users = useCollection('users')
  const subs = useCollection('subscriptions')
  const tickets = useCollection('tickets')
  const audit = useCollection('auditLog')
  const series = useSeriesData()
  const services = useCollection('systemServices')

  const loading = users.status === 'loading' || subs.status === 'loading'

  const stats = useMemo(() => {
    const activeSubs = subs.rows.filter((r) => r.status === 'aktif')
    const mrr = activeSubs.reduce((sum, r) => sum + r.mrr, 0)
    return [
      { label: 'Pengguna aktif', value: formatCompact(users.rows.filter((r) => r.status === 'aktif').length), note: `dari ${users.rows.length} akun` },
      { label: 'MRR', value: formatCurrency(mrr), note: `${activeSubs.length} langganan aktif` },
      { label: 'Tiket terbuka', value: tickets.rows.filter((r) => r.status === 'terbuka').length, note: 'Menunggu balasan' },
      { label: 'Peristiwa audit', value: formatCompact(audit.rows.length), note: '30 hari terakhir' },
    ]
  }, [users.rows, subs.rows, tickets.rows, audit.rows])

  const chartData = useMemo(
    () =>
      series.rows.slice(-14).map((row) => ({
        label: new Date(row.date).getDate().toString(),
        value: row.aktif,
        baru: row.baru,
      })),
    [series.rows],
  )

  if (loading) {
    return (
      <>
        <PanelHeader eyebrow="Ikhtisar" title="Ringkasan operasional" blurb="Memuat data ruang kerja…" />
        <LoadingRows rows={8} />
      </>
    )
  }

  return (
    <>
      <PanelHeader
        eyebrow="Ikhtisar"
        title="Ringkasan operasional"
        blurb={MODE === 'firebase' ? 'Kondisi ruang kerja hari ini, dihitung dari data nyata di Firestore.' : 'Kondisi ruang kerja hari ini. Semua angka berasal dari data demo.'}
        actions={
          <Link to="/app/admin/analytics" className="btn btn-primary">
            <Icon name="chart" size={16} />
            Buka analitik
          </Link>
        }
      />

      <StatStrip items={stats} />

      <div className="admin-grid admin-grid-2">
        <section className="surface admin-card admin-card-chart">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Pengguna aktif 14 hari</h2>
              <p className="admin-card-sub">Puncak harian berdasarkan sesi berjalan.</p>
            </div>
            <Sparkline points={chartData.map((d) => d.value)} width={110} height={30} />
          </header>
          <BarSeries data={chartData} fill />
        </section>

        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Kesehatan layanan</h2>
              <p className="admin-card-sub">Status 6 komponen inti.</p>
            </div>
            <Link to="/app/admin/system" className="text-link">
              Detail
              <Icon name="arrowRight" size={15} />
            </Link>
          </header>
          <ul className="service-list">
            {services.rows.map((service) => (
              <li className="service-row" key={service.id}>
                <span className={`service-dot service-${service.status}`} aria-hidden="true" />
                <span className="service-name">{service.name}</span>
                <span className="service-meta">{service.latency} ms</span>
                <Badge>{service.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="admin-grid admin-grid-2">
        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Jejak audit terbaru</h2>
              <p className="admin-card-sub">Perubahan yang tercatat sistem.</p>
            </div>
          </header>
          <ul className="timeline">
            {audit.rows.slice(0, 6).map((entry) => (
              <li className="timeline-item" key={entry.id}>
                <span className="timeline-mark" aria-hidden="true" />
                <div className="timeline-body">
                  <p className="timeline-title">
                    <b>{entry.actor}</b> · {entry.action}
                  </p>
                  <p className="timeline-meta">
                    {entry.target} · <SeverityMark value={entry.severity} /> · {formatRelative(entry.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Pintasan admin</h2>
              <p className="admin-card-sub">Tugas yang paling sering dibuka.</p>
            </div>
          </header>
          <div className="quick-grid">
            {QUICK.map((item) => (
              <Link key={item.to} to={item.to} className="quick-link">
                <span className="quick-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                {item.label}
                <Icon name="arrowUpRight" size={15} className="quick-arrow" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
