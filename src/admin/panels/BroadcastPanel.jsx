import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { BroadcastItem } from '../../components/BroadcastBanner'
import { useCollection } from '../../hooks/useCollection'
import { useAuth } from '../../providers/AuthProvider'
import { useToast } from '../../providers/ToastProvider'
import {
  BROADCAST_AUDIENCES,
  BROADCAST_DURATIONS,
  BROADCAST_TONES,
  broadcastState,
} from '../../lib/broadcast'
import { formatDateTime, formatRelative } from '../../lib/format'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/Overlays'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const EMPTY = { title: '', body: '', tone: 'info', audience: 'all', duration: '24h' }
const STATE_TONE = { aktif: 'ok', berakhir: 'neutral', dihentikan: 'warn' }

function Chips({ label, value, options, onChange }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="chip-row" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="chip"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function BroadcastPanel() {
  const { status, rows, patch, destroy, insert } = useCollection('broadcasts')
  const { user } = useAuth()
  const toast = useToast()
  const [draft, setDraft] = useState(EMPTY)
  const [confirmSend, setConfirmSend] = useState(false)
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }))

  const history = useMemo(
    () => rows.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [rows],
  )

  const stats = useMemo(() => {
    const now = Date.now()
    const states = rows.map((row) => broadcastState(row, now))
    return [
      { label: 'Total terkirim', value: rows.length },
      { label: 'Sedang aktif', value: states.filter((s) => s === 'aktif').length },
      { label: 'Berakhir', value: states.filter((s) => s === 'berakhir').length },
      { label: 'Dihentikan', value: states.filter((s) => s === 'dihentikan').length },
    ]
  }, [rows])

  const audienceLabel = (id) => BROADCAST_AUDIENCES.find((a) => a.id === id)?.label ?? id

  const askSend = () => {
    if (!draft.title.trim()) {
      toast.error('Judul broadcast wajib diisi.')
      return
    }
    setConfirmSend(true)
  }

  const send = async () => {
    setBusy(true)
    try {
      const duration = BROADCAST_DURATIONS.find((d) => d.id === draft.duration)
      const now = Date.now()
      await insert({
        title: draft.title.trim(),
        body: draft.body.trim(),
        tone: draft.tone,
        audience: draft.audience,
        active: true,
        createdAt: new Date(now).toISOString(),
        expiresAt: duration?.ms ? new Date(now + duration.ms).toISOString() : null,
        author: user?.name ?? 'Admin',
        authorUid: user?.uid ?? null,
      })
      toast.success(`Broadcast terkirim ke ${audienceLabel(draft.audience).toLowerCase()}.`)
      setDraft(EMPTY)
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim broadcast.')
    } finally {
      setBusy(false)
      setConfirmSend(false)
    }
  }

  const runPending = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'delete') {
        await destroy(pending.row.id)
        toast.success('Broadcast dihapus.')
      } else {
        await patch(pending.row.id, { active: false })
        toast.success('Broadcast dihentikan.')
      }
    } catch (error) {
      toast.error(error.message || 'Aksi gagal.')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  return (
    <>
      <PanelHeader
        eyebrow="Pertumbuhan"
        title="Broadcast"
        blurb="Kirim pesan langsung ke pengguna. Pesan muncul real-time di aplikasi mereka tanpa muat ulang."
      />

      <StatStrip items={stats} />

      <section className="surface bc-compose" aria-label="Buat broadcast">
        <div className="bc-form">
          <label className="field">
            <span className="field-label">
              Judul <span className="field-required">*</span>
            </span>
            <input
              className="field-input"
              value={draft.title}
              maxLength={80}
              onChange={(event) => set('title')(event.target.value)}
              placeholder="Mis. Pemeliharaan malam ini"
            />
          </label>
          <label className="field">
            <span className="field-label">
              Pesan <span className="field-optional">(opsional)</span>
            </span>
            <textarea
              className="field-input"
              rows={4}
              maxLength={400}
              value={draft.body}
              onChange={(event) => set('body')(event.target.value)}
              placeholder="Detail singkat untuk pengguna."
            />
          </label>
          <Chips label="Nada" value={draft.tone} options={BROADCAST_TONES} onChange={set('tone')} />
          <Chips
            label="Penerima"
            value={draft.audience}
            options={BROADCAST_AUDIENCES}
            onChange={set('audience')}
          />
          <Chips
            label="Tampil selama"
            value={draft.duration}
            options={BROADCAST_DURATIONS}
            onChange={set('duration')}
          />
        </div>

        <div className="bc-preview">
          <span className="field-label">Pratinjau</span>
          <BroadcastItem tone={draft.tone} title={draft.title} body={draft.body} time="baru saja" />
          <button type="button" className="btn btn-primary" onClick={askSend} disabled={busy}>
            <Icon name="send" size={16} strokeWidth={1.9} />
            Kirim sekarang
          </button>
        </div>
      </section>

      <h2 className="bc-history-title">Riwayat broadcast</h2>

      {status === 'loading' ? (
        <LoadingRows rows={4} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="volume"
          title="Belum ada broadcast"
          message="Kirim broadcast pertama lewat formulir di atas."
        />
      ) : (
        <div className="announce-list">
          {history.map((item) => {
            const state = broadcastState(item)
            return (
              <article className="surface announce-card" key={item.id}>
                <header className="announce-head">
                  <h3 className="announce-title">{item.title}</h3>
                  <Badge tone={STATE_TONE[state]}>{state}</Badge>
                </header>
                {item.body ? <p className="announce-body">{item.body}</p> : null}
                <footer className="announce-foot">
                  <span className="announce-meta">
                    {item.author} · {audienceLabel(item.audience)} · {formatRelative(item.createdAt)}
                    {item.expiresAt ? ` · sampai ${formatDateTime(item.expiresAt)}` : ''}
                  </span>
                  <div className="announce-actions">
                    {state === 'aktif' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPending({ row: item, kind: 'stop' })}
                      >
                        <Icon name="pause" size={15} />
                        Hentikan
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPending({ row: item, kind: 'delete' })}
                    >
                      <Icon name="trash" size={15} />
                      Hapus
                    </button>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmSend}
        title="Kirim broadcast sekarang?"
        message={`Pesan "${draft.title.trim()}" akan langsung tampil di aplikasi ${audienceLabel(
          draft.audience,
        ).toLowerCase()}.`}
        confirmLabel="Kirim"
        onConfirm={send}
        onCancel={() => setConfirmSend(false)}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.kind === 'delete' ? 'danger' : 'default'}
        title={pending?.kind === 'delete' ? 'Hapus broadcast?' : 'Hentikan broadcast?'}
        message={
          pending?.kind === 'delete'
            ? `"${pending?.row?.title}" akan dihapus permanen dan hilang dari riwayat.`
            : `"${pending?.row?.title}" akan segera hilang dari layar pengguna.`
        }
        confirmLabel={pending?.kind === 'delete' ? 'Hapus' : 'Hentikan'}
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
