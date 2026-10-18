import { useState } from 'react'
import { MODE } from '../../firebase/config'
import { FLAG_MAINTENANCE } from '../../hooks/useAppStatus'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatDateTime } from '../../lib/format'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/Overlays'
import { LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const MAINTENANCE = [
  { id: 'restart', label: 'Mulai ulang pekerja antrean', desc: 'Memutus tugas latar yang berjalan.', needsBackend: true },
  { id: 'cache', label: 'Bersihkan cache global', desc: 'Menghapus cache HTML pengguna.', needsBackend: true },
  { id: 'reindex', label: 'Bangun ulang indeks pencarian', desc: 'Proses berat, jalankan di luar jam sibuk.', needsBackend: true },
  { id: 'mode', label: 'Mode pemeliharaan', desc: 'Pengguna non-admin melihat halaman pemeliharaan; admin tetap bisa masuk.', tone: 'danger' },
]

const SERVICE_STATUSES = ['sehat', 'degradasi', 'gangguan']

export function SystemPanel() {
  const { status, rows, patch, insert } = useCollection('systemServices')
  const backups = useCollection('backups')
  const flags = useCollection('featureFlags')
  const toast = useToast()
  const [pending, setPending] = useState(null)
  const [newService, setNewService] = useState('')
  const maintenanceFlag = flags.rows.find((flag) => flag.key === FLAG_MAINTENANCE)
  const maintenanceOn = maintenanceFlag?.enabled === true

  const setServiceStatus = async (service, next) => {
    try {
      await patch(service.id, { status: next })
      toast.success(`${service.name}: ${next}.`)
    } catch (error) {
      toast.error(error.message || 'Gagal mengubah status.')
    }
  }

  const addService = async (event) => {
    event.preventDefault()
    if (!newService.trim()) return
    try {
      await insert({
        name: newService.trim(),
        region: 'asia-southeast2',
        status: 'sehat',
        latency: 0,
        uptime: 100,
        requests: 0,
      })
      setNewService('')
      toast.success('Layanan ditambahkan.')
    } catch (error) {
      toast.error(error.message || 'Gagal menambah layanan.')
    }
  }

  const toggleMaintenance = async () => {
    const now = new Date().toISOString()
    if (maintenanceFlag) {
      await flags.patch(maintenanceFlag.id, { enabled: !maintenanceOn, updatedAt: now })
    } else {
      await flags.insert({
        key: FLAG_MAINTENANCE,
        description: 'Sedang ada pemeliharaan terjadwal. Ruang kerjamu akan segera kembali.',
        rollout: 100,
        audience: 'Semua',
        enabled: true,
        updatedAt: now,
      })
    }
    toast.success(maintenanceOn ? 'Mode pemeliharaan dimatikan.' : 'Mode pemeliharaan diaktifkan.')
  }

  const runPending = async () => {
    const task = pending
    setPending(null)
    if (!task) return
    try {
      if (task.id === 'mode') await toggleMaintenance()
    } catch (error) {
      toast.error(error.message || 'Aksi gagal dijalankan.')
    }
  }

  const stats = [
    { label: 'Layanan sehat', value: `${rows.filter((r) => r.status === 'sehat').length}/${rows.length}` },
    {
      label: 'Uptime rata-rata',
      value: `${(rows.reduce((s, r) => s + r.uptime, 0) / (rows.length || 1)).toFixed(2)}%`,
    },
    { label: 'Latensi rata-rata', value: `${Math.round(rows.reduce((s, r) => s + r.latency, 0) / (rows.length || 1))} ms` },
    { label: 'Permintaan / jam', value: new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(rows.reduce((s, r) => s + r.requests, 0)) },
  ]

  return (
    <>
      <PanelHeader
        eyebrow="Sistem"
        title="Status sistem"
        blurb="Kesehatan layanan, tugas pemeliharaan, dan informasi rilis."
        actions={
          <button type="button" className="btn btn-ghost" onClick={() => toast.success('Status layanan disegarkan.')}>
            <Icon name="refresh" size={16} />
            Segarkan status
          </button>
        }
      />

      <StatStrip items={stats} />

      <form className="support-actions" onSubmit={addService}>
        <input
          className="field-input"
          style={{ maxWidth: 260 }}
          value={newService}
          maxLength={60}
          onChange={(event) => setNewService(event.target.value)}
          placeholder="Nama layanan baru"
          aria-label="Nama layanan baru"
        />
        <button type="submit" className="btn btn-ghost" disabled={!newService.trim()}>
          Tambah layanan
        </button>
      </form>

      {status === 'loading' ? (
        <LoadingRows rows={4} />
      ) : (
        <div className="service-grid">
          {rows.map((service) => (
            <article className="surface service-card" key={service.id}>
              <header className="service-card-head">
                <span className={`service-dot service-${service.status}`} aria-hidden="true" />
                <h3 className="service-card-title">{service.name}</h3>
                <Badge>{service.status}</Badge>
              </header>
              <dl className="service-facts">
                <div>
                  <dt>Wilayah</dt>
                  <dd>{service.region}</dd>
                </div>
                <div>
                  <dt>Latensi</dt>
                  <dd>{service.latency} ms</dd>
                </div>
                <div>
                  <dt>Uptime</dt>
                  <dd>{service.uptime}%</dd>
                </div>
                <div>
                  <dt>Permintaan</dt>
                  <dd>{new Intl.NumberFormat('id-ID').format(service.requests)}</dd>
                </div>
              </dl>
              <span className="select-wrap select-block">
                <select
                  aria-label={`Status ${service.name}`}
                  value={service.status}
                  onChange={(event) => setServiceStatus(service, event.target.value)}
                >
                  {SERVICE_STATUSES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="admin-grid admin-grid-2">
        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Pemeliharaan</h2>
              <p className="admin-card-sub">Tugas yang memengaruhi seluruh ruang kerja.</p>
            </div>
          </header>
          <ul className="task-list">
            {MAINTENANCE.map((task) => (
              <li className="task-row" key={task.id}>
                <div className="task-body">
                  <p className="task-label">{task.label}</p>
                  <p className="task-desc">{task.desc}</p>
                </div>
                {task.needsBackend ? (
                  <span className="plan-tag" title="Butuh server/Cloud Functions">
                    Butuh backend
                  </span>
                ) : (
                  <button
                    type="button"
                    className={maintenanceOn ? 'btn btn-ghost btn-sm' : 'btn btn-danger btn-sm'}
                    onClick={() => setPending(task)}
                  >
                    {maintenanceOn ? 'Matikan' : 'Aktifkan'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="surface admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Informasi rilis</h2>
              <p className="admin-card-sub">Detail lingkungan berjalan.</p>
            </div>
          </header>
          <div className="detail-list">
            {[
              ['Versi aplikasi', 'Workbench 1.0.0'],
              ['Versi PWA', 'orbit-v2'],
              ['Lingkungan', MODE === 'firebase' ? 'Produksi · Firebase' : 'Demo'],
              ['Wilayah utama', 'asia-southeast2 (Jakarta)'],
              ['Basis data', MODE === 'firebase' ? 'Cloud Firestore' : 'Mode demo (lokal)'],
              ['Cadangan terakhir', backups.rows[0] ? formatDateTime(backups.rows[0].createdAt) : '—'],
            ].map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.tone === 'danger' ? 'danger' : 'default'}
        title={pending ? `${maintenanceOn ? 'Matikan' : 'Aktifkan'} ${pending.label.toLowerCase()}?` : ''}
        message={pending?.desc}
        confirmLabel={maintenanceOn ? 'Matikan' : 'Aktifkan'}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
