import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatRelative } from '../../lib/format'
import { Badge, SeverityMark, badgeTone } from '../components/Badge'
import { ConfirmDialog } from '../components/Overlays'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const TABS = [
  { id: 'menunggu', label: 'Menunggu' },
  { id: 'ditinjau', label: 'Ditinjau' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'semua', label: 'Semua' },
]

export function ModerationPanel() {
  const { status, rows, patch } = useCollection('moderation')
  const toast = useToast()
  const [tab, setTab] = useState('menunggu')
  const [severity, setSeverity] = useState('')
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    let result = rows
    if (tab !== 'semua') result = result.filter((row) => row.status === tab)
    if (severity) result = result.filter((row) => row.severity === severity)
    return result
  }, [rows, tab, severity])

  const stats = useMemo(
    () => [
      { label: 'Menunggu tinjauan', value: rows.filter((r) => r.status === 'menunggu').length, note: 'Perlu tindakan' },
      { label: 'Prioritas tinggi', value: rows.filter((r) => r.severity === 'tinggi').length },
      { label: 'Ditangani', value: rows.filter((r) => r.status === 'selesai').length },
    ],
    [rows],
  )

  const resolve = async () => {
    if (!pending) return
    setBusy(true)
    try {
      await patch(pending.row.id, pending.patch)
      toast.success(pending.success)
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  return (
    <>
      <PanelHeader
        eyebrow="Konten"
        title="Moderasi"
        blurb="Tinjau laporan konten dan tentukan tindakan. Setiap keputusan dicatat."
      />

      <StatStrip items={stats} />

      <div className="filter-row">
        <div className="chip-row" role="group" aria-label="Status moderasi">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tab === item.id}
              className="chip"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="select-wrap">
          <span className="sr-only">Tingkat keparahan</span>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="">Keparahan: semua</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>
          <Icon name="chevronDown" size={15} />
        </label>
      </div>

      {status === 'loading' ? (
        <LoadingRows rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="shieldCheck"
          title="Antrean bersih"
          message="Tidak ada laporan pada saringan ini. Kerja bagus."
        />
      ) : (
        <div className="queue">
          {filtered.map((item) => (
            <article className="surface queue-card" key={item.id}>
              <div className="queue-top">
                <span className={`queue-sev queue-sev-${badgeTone(item.severity)}`}>
                  <Icon name="flag" size={15} />
                  {item.target}
                </span>
                <SeverityMark value={item.severity} />
                <Badge>{item.status}</Badge>
                <span className="queue-time">{formatRelative(item.createdAt)}</span>
              </div>
              <p className="queue-preview">{item.preview}</p>
              <footer className="queue-foot">
                <span className="queue-meta">Dilaporkan oleh {item.reporter}</span>
                <div className="queue-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setPending({ row: item, patch: { status: 'ditinjau' }, success: 'Ditandai sedang ditinjau.', label: 'Tandai ditinjau', title: 'Tandai sedang ditinjau?' })
                    }
                  >
                    <Icon name="eye" size={15} />
                    Tinjau
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setPending({ row: item, patch: { status: 'ditolak' }, success: 'Laporan ditolak.', label: 'Tolak laporan', title: 'Tolak laporan ini?', tone: 'danger' })
                    }
                  >
                    <Icon name="close" size={15} />
                    Tolak
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      setPending({ row: item, patch: { status: 'selesai' }, success: 'Laporan diselesaikan.', label: 'Selesaikan', title: 'Selesaikan laporan ini?' })
                    }
                  >
                    <Icon name="check" size={15} strokeWidth={2.1} />
                    Selesaikan
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.title ?? ''}
        message={`Tindakan "${pending?.label}" akan tercatat di jejak audit.`}
        confirmLabel={pending?.label ?? 'Lanjutkan'}
        tone={pending?.tone === 'danger' ? 'danger' : 'default'}
        onConfirm={resolve}
        onCancel={() => setPending(null)}
      />
      {busy ? <span className="sr-only">Memproses</span> : null}
    </>
  )
}
