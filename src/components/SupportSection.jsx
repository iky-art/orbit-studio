import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'
import { formatRelative } from '../lib/format'
import { create, DEMO_MODE, subscribeWhere, update } from '../services/db'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'

const CATEGORIES = ['Fitur', 'Bug', 'Performa', 'Desain', 'Lainnya']
const SENTIMENTS = [
  { id: 'positif', label: 'Suka' },
  { id: 'netral', label: 'Biasa' },
  { id: 'negatif', label: 'Kurang' },
]
const PRIORITIES = [
  { id: 'rendah', label: 'Rendah' },
  { id: 'sedang', label: 'Sedang' },
  { id: 'tinggi', label: 'Tinggi' },
]

function Chips({ value, options, onChange, label }) {
  return (
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
  )
}

function FeedbackForm({ onDone }) {
  const { session } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ category: 'Fitur', sentiment: 'netral', message: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (busy || !form.message.trim()) return
    setBusy(true)
    try {
      await create('feedback', {
        uid: session.uid,
        user: session.name,
        category: form.category,
        sentiment: form.sentiment,
        message: form.message.trim(),
        votes: 0,
        status: 'baru',
        createdAt: new Date().toISOString(),
      })
      toast.success('Terima kasih! Masukanmu sudah dikirim ke tim.')
      onDone()
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim masukan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="support-form" onSubmit={submit}>
      <div className="field">
        <span className="field-label">Kategori</span>
        <span className="select-wrap select-block">
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          >
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="field">
        <span className="field-label">Kesanmu</span>
        <Chips
          label="Kesan"
          value={form.sentiment}
          options={SENTIMENTS}
          onChange={(sentiment) => setForm({ ...form, sentiment })}
        />
      </div>
      <label className="field">
        <span className="field-label">
          Masukan <span className="field-required">*</span>
        </span>
        <textarea
          className="field-input"
          rows={4}
          maxLength={500}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder="Ceritakan apa yang bisa kami perbaiki."
          required
        />
      </label>
      <div className="support-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Mengirim…' : 'Kirim masukan'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Batal
        </button>
      </div>
    </form>
  )
}

function TicketForm({ onDone }) {
  const { session } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ subject: '', body: '', priority: 'sedang' })
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (busy || !form.subject.trim() || !form.body.trim()) return
    setBusy(true)
    try {
      const now = new Date().toISOString()
      await create('tickets', {
        uid: session.uid,
        subject: form.subject.trim(),
        requester: session.name,
        priority: form.priority,
        status: 'terbuka',
        assignee: 'Belum ditugaskan',
        channel: 'Dalam aplikasi',
        thread: [{ from: 'user', text: form.body.trim(), at: now }],
        messages: 1,
        createdAt: now,
        updatedAt: now,
      })
      toast.success('Tiket dibuat. Tim akan membalas di sini.')
      onDone()
    } catch (error) {
      toast.error(error.message || 'Gagal membuat tiket.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="support-form" onSubmit={submit}>
      <label className="field">
        <span className="field-label">
          Subjek <span className="field-required">*</span>
        </span>
        <input
          className="field-input"
          value={form.subject}
          maxLength={100}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          placeholder="Mis. Data tidak tersinkron"
          required
        />
      </label>
      <label className="field">
        <span className="field-label">
          Ceritakan kendalamu <span className="field-required">*</span>
        </span>
        <textarea
          className="field-input"
          rows={4}
          maxLength={600}
          value={form.body}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
          required
        />
      </label>
      <div className="field">
        <span className="field-label">Prioritas</span>
        <Chips
          label="Prioritas"
          value={form.priority}
          options={PRIORITIES}
          onChange={(priority) => setForm({ ...form, priority })}
        />
      </div>
      <div className="support-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Membuat…' : 'Buat tiket'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Batal
        </button>
      </div>
    </form>
  )
}

function MyTickets() {
  const { session } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [openId, setOpenId] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    if (DEMO_MODE || !session?.uid) return undefined
    return subscribeWhere('tickets', 'uid', session.uid, setRows, () => {})
  }, [session?.uid])

  const tickets = useMemo(
    () => rows.slice().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
    [rows],
  )

  if (DEMO_MODE) return null
  if (tickets.length === 0) return <p className="section-note">Kamu belum punya tiket.</p>

  const sendReply = async (ticket) => {
    if (!reply.trim()) return
    const thread = [
      ...(ticket.thread ?? []),
      { from: 'user', text: reply.trim(), at: new Date().toISOString() },
    ]
    try {
      await update('tickets', ticket.id, {
        thread,
        messages: thread.length,
        status: 'terbuka',
        updatedAt: new Date().toISOString(),
      })
      setReply('')
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim balasan.')
    }
  }

  const closeTicket = async (ticket) => {
    try {
      await update('tickets', ticket.id, { status: 'ditutup', updatedAt: new Date().toISOString() })
      toast.success('Tiket ditutup.')
    } catch (error) {
      toast.error(error.message || 'Gagal menutup tiket.')
    }
  }

  return (
    <ul className="my-tickets">
      {tickets.map((ticket) => {
        const open = openId === ticket.id
        return (
          <li key={ticket.id} className="my-ticket">
            <button
              type="button"
              className="my-ticket-head"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : ticket.id)}
            >
              <span className="my-ticket-title">{ticket.subject}</span>
              <span className="plan-tag">{ticket.status}</span>
            </button>
            <p className="my-ticket-meta">Diperbarui {formatRelative(ticket.updatedAt)}</p>
            {open ? (
              <div className="my-ticket-body">
                {(ticket.thread ?? []).map((message, index) => (
                  <div className={`thread-msg thread-${message.from}`} key={index}>
                    <span className="thread-from">
                      {message.from === 'user' ? 'Kamu' : 'Tim dukungan'}
                    </span>
                    <p className="thread-text">{message.text}</p>
                  </div>
                ))}
                {ticket.status === 'ditutup' ? (
                  <p className="section-note">Tiket ini sudah ditutup.</p>
                ) : (
                  <div className="support-form">
                    <textarea
                      className="field-input"
                      rows={2}
                      value={reply}
                      maxLength={600}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Tulis balasan…"
                    />
                    <div className="support-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={!reply.trim()}
                        onClick={() => sendReply(ticket)}
                      >
                        <Icon name="send" size={15} />
                        Balas
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => closeTicket(ticket)}
                      >
                        Tutup tiket
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/** Bagian "Bantuan & masukan" di Pengaturan. */
export function SupportSection() {
  const [mode, setMode] = useState(null) // 'feedback' | 'ticket' | null

  return (
    <section className="surface plan-section" aria-labelledby="support-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="support-title">
            Bantuan & masukan
          </h2>
          <p className="card-sub">Kirim masukan untuk produk, atau minta bantuan lewat tiket.</p>
        </div>
      </div>

      {mode === 'feedback' ? <FeedbackForm onDone={() => setMode(null)} /> : null}
      {mode === 'ticket' ? <TicketForm onDone={() => setMode(null)} /> : null}

      {mode === null ? (
        <div className="support-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setMode('feedback')}>
            Kirim masukan
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setMode('ticket')}>
            Buat tiket bantuan
          </button>
        </div>
      ) : null}

      <h3 className="support-sub">Tiket saya</h3>
      <MyTickets />
    </section>
  )
}
