import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatRelative } from '../../lib/format'
import { Badge, SeverityMark } from '../components/Badge'
import { LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const POSTURE = [
  { id: '2fa', label: 'Verifikasi dua langkah aktif', done: false, note: 'Wajib untuk semua admin.' },
  { id: 'keys', label: 'Kunci API dirotasi 90 hari', done: true, note: 'Terakhir 21 hari lalu.' },
  { id: 'sessions', label: 'Sesi mencurigakan ditinjau', done: true, note: '2 perangkat ditandai.' },
  { id: 'backup', label: 'Cadangan harian berjalan', done: true, note: 'Retensi 30 hari.' },
  { id: 'alerts', label: 'Peringatan masuk aktif', done: false, note: 'Belum semua admin mengaktifkan.' },
  { id: 'audit', label: 'Jejak audit 12 bulan', done: true, note: 'Sesuai kebijakan.' },
]

export function SecurityPanel() {
  const { status, rows, patch } = useCollection('security')
  const sessions = useCollection('sessions')
  const toast = useToast()
  const [severity, setSeverity] = useState('')

  const filtered = useMemo(
    () => (severity ? rows.filter((row) => row.severity === severity) : rows),
    [rows, severity],
  )

  const stats = useMemo(
    () => [
      { label: 'Peristiwa 24 jam', value: rows.filter((r) => Date.now() - new Date(r.at) < 86400000).length },
      { label: 'Belum ditangani', value: rows.filter((r) => !r.resolved).length, note: 'Perlu tindakan' },
      { label: 'Prioritas tinggi', value: rows.filter((r) => ['tinggi', 'kritis'].includes(r.severity)).length },
      { label: 'Sesi perangkat', value: sessions.rows.length },
    ],
    [rows, sessions.rows],
  )

  const done = POSTURE.filter((item) => item.done).length

  return (
    <>
      <PanelHeader
        eyebrow="Keamanan"
        title="Keamanan"
        blurb="Pantau peristiwa mencurigakan dan nilai kesiapan keamanan ruang kerja."
      />

      <StatStrip items={stats} />

      <div className="admin-grid admin-grid-2">
        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Kesiapan keamanan</h2>
              <p className="admin-card-sub">
                {done} dari {POSTURE.length} rekomendasi terpenuhi.
              </p>
            </div>
            <span className="posture-score">{Math.round((done / POSTURE.length) * 100)}%</span>
          </header>
          <ul className="posture-list">
            {POSTURE.map((item) => (
              <li className="posture-row" key={item.id} data-done={item.done || undefined}>
                <span className="posture-mark" aria-hidden="true">
                  <Icon name={item.done ? 'check' : 'close'} size={13} strokeWidth={2.4} />
                </span>
                <span className="posture-body">
                  <span className="posture-label">{item.label}</span>
                  <span className="posture-note">{item.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Rekomendasi cepat</h2>
              <p className="admin-card-sub">Tindakan yang menaikkan skor keamanan.</p>
            </div>
          </header>
          <div className="quick-grid">
            <button type="button" className="quick-link" onClick={() => toast.info('Wajibkan 2FA untuk semua admin.')}>
              <span className="quick-icon"><Icon name="lock" size={18} /></span>
              Wajibkan 2FA
            </button>
            <button type="button" className="quick-link" onClick={() => toast.info('Batasi akses berdasarkan IP.')}>
              <span className="quick-icon"><Icon name="shield" size={18} /></span>
              Batasi IP kantor
            </button>
            <button type="button" className="quick-link" onClick={() => toast.success('Notifikasi masuk diaktifkan untuk semua admin.')}>
              <span className="quick-icon"><Icon name="bell" size={18} /></span>
              Aktifkan peringatan
            </button>
            <button type="button" className="quick-link" onClick={() => toast.info('Rotasi kunci API dijadwalkan.')}>
              <span className="quick-icon"><Icon name="key" size={18} /></span>
              Jadwalkan rotasi kunci
            </button>
          </div>
        </section>
      </div>

      <section className="surface admin-card">
        <header className="admin-card-head">
          <div>
            <h2 className="admin-card-title">Peristiwa keamanan</h2>
            <p className="admin-card-sub">Tandai selesai setelah ditelusuri.</p>
          </div>
          <label className="select-wrap">
            <span className="sr-only">Keparahan</span>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="">Keparahan: semua</option>
              <option value="kritis">Kritis</option>
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>
            <Icon name="chevronDown" size={15} />
          </label>
        </header>

        {status === 'loading' ? (
          <LoadingRows rows={6} />
        ) : (
          <ul className="event-list">
            {filtered.map((event) => (
              <li className="event-row" key={event.id}>
                <span className="event-icon" aria-hidden="true">
                  <Icon name="shield" size={17} />
                </span>
                <div className="event-body">
                  <p className="event-title">{event.event}</p>
                  <p className="event-meta">
                    {event.user} · {event.location} · {event.ip} · {formatRelative(event.at)}
                  </p>
                </div>
                <SeverityMark value={event.severity} />
                {event.resolved ? (
                  <Badge>selesai</Badge>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      patch(event.id, { resolved: true })
                      toast.success('Peristiwa ditandai selesai.')
                    }}
                  >
                    Tandai selesai
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
