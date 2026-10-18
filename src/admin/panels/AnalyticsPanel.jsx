import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { MODE } from '../../firebase/config'
import { useCollection } from '../../hooks/useCollection'
import { useSeriesData } from '../../hooks/useSeriesData'
import { formatCompact, formatCurrency, formatNumber } from '../../lib/format'
import { BarSeries, LoadingRows, PanelHeader, ProgressBar, StatStrip } from '../components/PanelChrome'

const RANGES = [
  { id: 7, label: '7 hari' },
  { id: 14, label: '14 hari' },
  { id: 30, label: '30 hari' },
]

const FUNNEL = [
  { label: 'Mengunjungi halaman', value: 100 },
  { label: 'Memasang aplikasi', value: 46 },
  { label: 'Membuat akun', value: 31 },
  { label: 'Menyelesaikan onboarding', value: 24 },
  { label: 'Aktif setelah 7 hari', value: 17 },
]

export function AnalyticsPanel() {
  const series = useSeriesData()
  const content = useCollection('content')
  const campaigns = useCollection('campaigns')
  const [range, setRange] = useState(14)

  const rows = useMemo(() => series.rows.slice(-range), [series.rows, range])

  const stats = useMemo(() => {
    const latest = rows[rows.length - 1]
    const first = rows[0]
    const growth = first && latest ? ((latest.aktif - first.aktif) / first.aktif) * 100 : 0
    return [
      { label: 'Pengguna aktif', value: formatCompact(latest?.aktif ?? 0), note: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs awal periode` },
      { label: 'Pengguna baru', value: formatCompact(rows.reduce((s, r) => s + r.baru, 0)) },
      { label: 'Total sesi', value: formatCompact(rows.reduce((s, r) => s + r.sesi, 0)) },
      { label: 'Pendapatan', value: formatCurrency(rows.reduce((s, r) => s + r.pendapatan, 0)) },
    ]
  }, [rows])

  const chartData = rows.map((row) => ({
    label: new Date(row.date).getDate().toString(),
    value: row.aktif,
  }))

  const topContent = [...content.rows].sort((a, b) => b.views - a.views).slice(0, 6)
  const channelData = useMemo(() => {
    const map = new Map()
    campaigns.rows.forEach((row) => {
      const current = map.get(row.channel) ?? { sent: 0, opened: 0 }
      current.sent += row.sent
      current.opened += row.opened
      map.set(row.channel, current)
    })
    return Array.from(map.entries()).map(([label, value]) => ({ label, value: value.sent }))
  }, [campaigns.rows])

  if (series.status === 'loading') {
    return (
      <>
        <PanelHeader eyebrow="Ikhtisar" title="Analitik" blurb="Menyiapkan metrik…" />
        <LoadingRows rows={8} />
      </>
    )
  }

  return (
    <>
      <PanelHeader
        eyebrow="Ikhtisar"
        title="Analitik"
        blurb="Pertumbuhan, keterlibatan, dan corong konversi pemasangan aplikasi."
        actions={
          <div className="seg" role="group" aria-label="Rentang waktu">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="seg-btn"
                aria-pressed={range === item.id}
                onClick={() => setRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      <StatStrip items={stats} />

      <section className="surface admin-card">
        <header className="admin-card-head">
          <div>
            <h2 className="admin-card-title">Pengguna aktif harian</h2>
            <p className="admin-card-sub">{range} hari terakhir · {MODE === 'firebase' ? 'data nyata' : 'data demo'}</p>
          </div>
        </header>
        <BarSeries data={chartData} height={200} />
      </section>

      <div className="admin-grid admin-grid-2">
        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Corong pemasangan → aktif</h2>
              <p className="admin-card-sub">Persentase relatif terhadap kunjungan.</p>
            </div>
          </header>
          {FUNNEL.map((step) => (
            <ProgressBar key={step.label} label={step.label} value={step.value} />
          ))}
        </section>

        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Konten paling dibaca</h2>
              <p className="admin-card-sub">Berdasarkan jumlah tampilan.</p>
            </div>
          </header>
          <ol className="rank-list">
            {topContent.map((item, index) => (
              <li className="rank-row" key={item.id}>
                <span className="rank-index">{index + 1}</span>
                <span className="rank-body">
                  <span className="rank-title">{item.title}</span>
                  <span className="rank-meta">{item.type} · {item.author}</span>
                </span>
                <span className="rank-value">{formatNumber(item.views)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="surface admin-card">
        <header className="admin-card-head">
          <div>
            <h2 className="admin-card-title">Jangkauan per kanal</h2>
            <p className="admin-card-sub">Total pengiriman kampanye menurut kanal.</p>
          </div>
          <span className="admin-card-note">
            <Icon name="info" size={15} />
            {MODE === 'firebase' ? 'Data nyata' : 'Data demo'}
          </span>
        </header>
        {channelData.map((channel) => (
          <ProgressBar
            key={channel.label}
            label={channel.label}
            value={Math.round((channel.value / Math.max(...channelData.map((c) => c.value), 1)) * 100)}
            note={`${formatCompact(channel.value)} terkirim`}
          />
        ))}
      </section>
    </>
  )
}
