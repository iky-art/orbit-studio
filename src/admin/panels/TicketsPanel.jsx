import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatRelative } from '../../lib/format'
import { Badge } from '../components/Badge'
import { Drawer } from '../components/Overlays'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const TABS = [
  { id: 'terbuka', label: 'Terbuka' },
  { id: 'menunggu', label: 'Menunggu' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'semua', label: 'Semua' },
]

const PRIORITY_TONE = { tinggi: 'danger', sedang: 'warn', rendah: 'info' }

function buildThread(ticket) {
  const base = [
    { from: 'user', text: `Halo, saya mengalami kendala: ${ticket.subject.toLowerCase()}. Mohon dibantu.` },
    { from: 'agent', text: 'Terima kasih sudah melapor. Boleh dibagikan langkah yang sudah dicoba?' },
    { from: 'user', text: 'Saya sudah mencoba keluar dan masuk ulang, tetapi masih sama.' },
    { from: 'agent', text: 'Baik, kami sedang memeriksa dari sisi sistem. Kami akan kabari begitu ada pembaruan.' },
  ]
  return base.slice(0, Math.min(base.length, Math.max(2, Math.ceil(ticket.messages / 3))))
}

/** Percakapan nyata bila tiket punya `thread`; selain itu, contoh untuk data demo. */
const threadOf = (ticket) =>
  Array.isArray(ticket.thread) && ticket.thread.length ? ticket.thread : buildThread(ticket)

export function TicketsPanel() {
  const { status, rows, patch } = useCollection('tickets')
  const users = useCollection('users')
  const toast = useToast()
  const [tab, setTab] = useState('terbuka')
  const [priority, setPriority] = useState('')
  const [reply, setReply] = useState('')
  const [active, setActive] = useState(null)

  const filtered = useMemo(() => {
    let result = rows
    if (tab !== 'semua') result = result.filter((row) => row.status === tab)
    if (priority) result = result.filter((row) => row.priority === priority)
    return [...result].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [rows, tab, priority])

  const stats = useMemo(
    () => [
      { label: 'Total tiket', value: rows.length },
      { label: 'Terbuka', value: rows.filter((r) => r.status === 'terbuka').length, note: 'Perlu balasan' },
      { label: 'Prioritas tinggi', value: rows.filter((r) => r.priority === 'tinggi').length },
      { label: 'Rata-rata pesan', value: (rows.reduce((s, r) => s + r.messages, 0) / (rows.length || 1)).toFixed(1) },
    ],
    [rows],
  )

  const assign = async (ticket, name) => {
    await patch(ticket.id, { assignee: name, status: 'menunggu', updatedAt: new Date().toISOString() })
    setActive((current) => (current ? { ...current, assignee: name, status: 'menunggu' } : current))
    toast.success(`Tiket ditugaskan ke ${name}.`)
  }

  const sendReply = async () => {
    if (!reply.trim() || !active) return
    const thread = [
      ...threadOf(active),
      { from: 'agent', text: reply.trim(), at: new Date().toISOString() },
    ]
    await patch(active.id, {
      thread,
      messages: thread.length,
      status: 'menunggu',
      updatedAt: new Date().toISOString(),
    })
    toast.success('Balasan terkirim ke pemohon.')
    setReply('')
    setActive(null)
  }

  return (
    <>
      <PanelHeader
        eyebrow="Dukungan"
        title="Tiket dukungan"
        blurb="Antrean permintaan bantuan beserta riwayat percakapannya."
      />

      <StatStrip items={stats} />

      <div className="filter-row">
        <div className="chip-row" role="tablist" aria-label="Status tiket">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-pressed={tab === item.id}
              className="chip"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="select-wrap">
          <span className="sr-only">Prioritas</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="">Prioritas: semua</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>
          <Icon name="chevronDown" size={15} />
        </label>
      </div>

      {status === 'loading' ? (
        <LoadingRows rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="ticket" title="Antrean kosong" message="Tidak ada tiket pada saringan ini." />
      ) : (
        <section className="surface admin-card">
          <ul className="ticket-list">
            {filtered.map((ticket) => (
              <li className="ticket-row" key={ticket.id}>
                <button type="button" className="ticket-main" onClick={() => setActive(ticket)}>
                  <span className={`priority priority-${PRIORITY_TONE[ticket.priority]}`} aria-hidden="true" />
                  <span className="ticket-body">
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span className="ticket-meta">
                      {ticket.requester} · {ticket.channel} · {ticket.messages} pesan · {formatRelative(ticket.updatedAt)}
                    </span>
                  </span>
                  <Badge tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge>{ticket.status}</Badge>
                </button>
                <span className="ticket-assignee">{ticket.assignee}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.subject ?? ''}
        subtitle={active ? `Dibuat oleh ${active.requester} · ${active.channel}` : ''}
        width={560}
        footer={
          active ? (
            <div className="reply-box">
              <textarea
                className="field-input"
                rows={2}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Tulis balasan untuk pemohon…"
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={sendReply} disabled={!reply.trim()}>
                <Icon name="send" size={15} />
                Kirim balasan
              </button>
            </div>
          ) : null
        }
      >
        {active ? (
          <>
            <div className="ticket-facts">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value"><Badge>{active.status}</Badge></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Prioritas</span>
                <span className="detail-value"><Badge tone={PRIORITY_TONE[active.priority]}>{active.priority}</Badge></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ditugaskan</span>
                <span className="detail-value">{active.assignee}</span>
              </div>
            </div>

            <div className="assign-row">
              <span className="detail-label">Tugaskan ke</span>
              <div className="assign-chips">
                {users.rows.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="chip chip-sm"
                    aria-pressed={active.assignee === user.name}
                    onClick={() => assign(active, user.name)}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="thread">
              {threadOf(active).map((message, index) => (
                <div className={`thread-msg thread-${message.from}`} key={index}>
                  <span className="thread-from">
                    {message.from === 'user' ? active.requester : message.from === 'agent' ? active.assignee : 'Sistem'}
                  </span>
                  <p className="thread-text">{message.text}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Drawer>
    </>
  )
}
