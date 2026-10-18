import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { formatDateTime, formatRelative } from '../../lib/format'
import { Badge, SeverityMark } from '../components/Badge'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const PAGE = 12

export function AuditPanel() {
  const { status, rows } = useCollection('auditLog')
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [result, setResult] = useState('')
  const [visible, setVisible] = useState(PAGE)

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (severity && row.severity !== severity) return false
      if (result && row.result !== result) return false
      if (!needle) return true
      return [row.actor, row.action, row.target, row.ip]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [rows, search, severity, result])

  const stats = useMemo(
    () => [
      { label: 'Total peristiwa', value: rows.length },
      { label: 'Ditolak', value: rows.filter((r) => r.result === 'ditolak').length, note: 'Perlu penelusuran' },
      { label: 'Kritis', value: rows.filter((r) => r.severity === 'kritis').length },
      { label: 'Aktor unik', value: new Set(rows.map((r) => r.actor)).size },
    ],
    [rows],
  )

  return (
    <>
      <PanelHeader
        eyebrow="Keamanan"
        title="Jejak audit"
        blurb="Catatan perubahan penting pada ruang kerja. Tidak dapat diubah atau dihapus."
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const csv = ['waktu,aktor,aksi,target,hasil,keparahan']
                .concat(
                  filtered.map((row) =>
                    [row.at, row.actor, row.action, row.target, row.result, row.severity]
                      .map((value) => `"${value}"`)
                      .join(','),
                  ),
                )
                .join('\n')
              const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
              const link = document.createElement('a')
              link.href = url
              link.download = 'jejak-audit.csv'
              link.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Icon name="download" size={16} />
            Ekspor jejak
          </button>
        }
      />

      <StatStrip items={stats} />

      <div className="filter-row">
        <label className="search-box">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setVisible(PAGE)
            }}
            placeholder="Cari aktor, aksi, atau target…"
            aria-label="Cari jejak audit"
          />
        </label>
        <label className="select-wrap">
          <span className="sr-only">Keparahan</span>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="">Keparahan: semua</option>
            <option value="kritis">Kritis</option>
            <option value="peringatan">Peringatan</option>
            <option value="info">Info</option>
          </select>
          <Icon name="chevronDown" size={15} />
        </label>
        <label className="select-wrap">
          <span className="sr-only">Hasil</span>
          <select value={result} onChange={(event) => setResult(event.target.value)}>
            <option value="">Hasil: semua</option>
            <option value="berhasil">Berhasil</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <Icon name="chevronDown" size={15} />
        </label>
      </div>

      {status === 'loading' ? (
        <LoadingRows rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="Tidak ada peristiwa" message="Ubah kata kunci atau saringan." />
      ) : (
        <section className="surface admin-card">
          <ul className="timeline timeline-tall">
            {filtered.slice(0, visible).map((entry) => (
              <li className="timeline-item" key={entry.id}>
                <span className={`timeline-mark timeline-${entry.result === 'ditolak' ? 'danger' : 'ok'}`} aria-hidden="true" />
                <div className="timeline-body">
                  <p className="timeline-title">
                    <b>{entry.actor}</b> · {entry.action}
                  </p>
                  <p className="timeline-meta">
                    <code className="mono">{entry.target}</code>
                    <span className="dot-sep" aria-hidden="true">·</span>
                    {entry.ip}
                    <span className="dot-sep" aria-hidden="true">·</span>
                    <SeverityMark value={entry.severity} />
                    <span className="dot-sep" aria-hidden="true">·</span>
                    <span title={formatDateTime(entry.at)}>{formatRelative(entry.at)}</span>
                  </p>
                </div>
                <Badge>{entry.result}</Badge>
              </li>
            ))}
          </ul>
          {visible < filtered.length ? (
            <div className="pager">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVisible((v) => v + PAGE)}>
                Muat {Math.min(PAGE, filtered.length - visible)} lagi
                <Icon name="chevronDown" size={15} />
              </button>
            </div>
          ) : null}
        </section>
      )}
    </>
  )
}
