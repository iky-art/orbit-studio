import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatDateTime, formatRelative } from '../../lib/format'
import { Badge } from '../components/Badge'
import { ConfirmDialog, Drawer } from '../components/Overlays'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const AUDIENCES = ['Semua pengguna', 'Admin', 'Plan Studio']

export function AnnouncementsPanel() {
  const { status, rows, patch, destroy, insert } = useCollection('announcements')
  const toast = useToast()
  const [filter, setFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '', audience: AUDIENCES[0] })
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(
    () => (filter ? rows.filter((row) => row.status === filter) : rows),
    [rows, filter],
  )

  const stats = useMemo(
    () => [
      { label: 'Total pengumuman', value: rows.length },
      { label: 'Terbit', value: rows.filter((r) => r.status === 'terbit').length },
      { label: 'Terjadwal', value: rows.filter((r) => r.status === 'terjadwal').length },
      { label: 'Draf', value: rows.filter((r) => r.status === 'draf').length },
    ],
    [rows],
  )

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error('Judul pengumuman wajib diisi.')
      return
    }
    setBusy(true)
    try {
      await insert({
        ...draft,
        status: 'draf',
        author: 'Kamu',
        publishAt: new Date().toISOString(),
      })
      toast.success('Pengumuman disimpan sebagai draf.')
      setCreating(false)
      setDraft({ title: '', body: '', audience: AUDIENCES[0] })
    } finally {
      setBusy(false)
    }
  }

  const runAction = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'delete') {
        await destroy(pending.row.id)
        toast.success('Pengumuman dihapus.')
      } else {
        await patch(
          pending.row.id,
          pending.status === 'terbit'
            ? { status: 'terbit', publishAt: new Date().toISOString() }
            : { status: pending.status },
        )
        toast.success(pending.message)
      }
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  return (
    <>
      <PanelHeader
        eyebrow="Dukungan"
        title="Pengumuman"
        blurb="Kabar dalam aplikasi yang tampil pada lonceng notifikasi pengguna."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={17} strokeWidth={2.1} />
            Pengumuman baru
          </button>
        }
      />

      <StatStrip items={stats} />

      <div className="filter-row">
        <div className="chip-row" role="group" aria-label="Saring pengumuman">
          <button type="button" className="chip" aria-pressed={!filter} onClick={() => setFilter('')}>
            Semua
          </button>
          {['terbit', 'terjadwal', 'draf'].map((item) => (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' ? (
        <LoadingRows rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="megaphone" title="Belum ada pengumuman" message="Buat pengumuman pertama untuk pengguna." />
      ) : (
        <div className="announce-list">
          {filtered.map((item) => (
            <article className="surface announce-card" key={item.id}>
              <header className="announce-head">
                <h3 className="announce-title">{item.title}</h3>
                <Badge>{item.status}</Badge>
              </header>
              <p className="announce-body">{item.body}</p>
              <footer className="announce-foot">
                <span className="announce-meta">
                  {item.author} · {item.audience} · {formatRelative(item.publishAt)}
                </span>
                <div className="announce-actions">
                  {item.status !== 'terbit' ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        setPending({ row: item, status: 'terbit', message: 'Pengumuman diterbitkan.' })
                      }
                    >
                      <Icon name="send" size={15} />
                      Terbitkan
                    </button>
                  ) : (
                    <span className="announce-live" title={formatDateTime(item.publishAt)}>
                      <Icon name="check" size={14} /> Terbit
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPending({ row: item, kind: 'delete', title: 'Hapus pengumuman?' })}
                  >
                    <Icon name="trash" size={15} />
                    Hapus
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="Pengumuman baru"
        subtitle="Disimpan sebagai draf terlebih dahulu."
        footer={
          <div className="drawer-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreating(false)}>
              Batal
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Icon name="check" size={16} strokeWidth={2.1} />}
              Simpan draf
            </button>
          </div>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span className="field-label">
              Judul <span className="field-required">*</span>
            </span>
            <input
              className="field-input"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Pemeliharaan terjadwal"
            />
          </label>
          <label className="field">
            <span className="field-label">Audiens</span>
            <span className="select-wrap select-block">
              <select
                value={draft.audience}
                onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value }))}
              >
                {AUDIENCES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={15} />
            </span>
          </label>
          <label className="field">
            <span className="field-label">Isi pengumuman</span>
            <textarea
              className="field-input"
              rows={5}
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="Tuliskan detail singkat dan tautan terkait."
            />
          </label>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.kind === 'delete' ? 'danger' : 'default'}
        title={pending?.title ?? (pending ? 'Terbitkan pengumuman?' : '')}
        message={
          pending?.kind === 'delete'
            ? `Pengumuman "${pending.row.title}" akan dihapus permanen.`
            : `Pengumuman akan dikirim ke ${pending?.row?.audience ?? 'semua pengguna'}.`
        }
        confirmLabel={pending?.kind === 'delete' ? 'Hapus' : 'Terbitkan'}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
