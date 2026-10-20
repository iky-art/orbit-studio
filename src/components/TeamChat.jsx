import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useTeamMessages } from '../hooks/useTeams'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { deleteMessage, postMessage } from '../services/teams'

const dayLabel = (ms) =>
  new Date(ms).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
const timeLabel = (ms) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

/** Obrolan tim real-time (100 pesan terbaru). */
export function TeamChat({ membership, canModerate }) {
  const { session } = useAuth()
  const toast = useToast()
  const { rows, status } = useTeamMessages(membership.teamId)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows.length])

  const send = async (event) => {
    event.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await postMessage(membership.teamId, session, text)
      setText('')
    } catch (error) {
      toast.error(error?.message || 'Pesan gagal dikirim.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (message) => {
    try {
      await deleteMessage(membership.teamId, message.id)
    } catch (error) {
      toast.error(error?.message || 'Pesan gagal dihapus.')
    }
  }

  let lastDay = ''
  return (
    <div className="chat">
      <div className="chat-list" ref={listRef} role="log" aria-live="polite" aria-label="Obrolan tim">
        {status === 'loading' ? <p className="section-note">Memuat obrolan…</p> : null}
        {status === 'error' ? (
          <p className="field-error" role="alert">
            Obrolan tidak bisa dimuat. Pastikan Rules Firestore sudah diperbarui.
          </p>
        ) : null}
        {status === 'ready' && rows.length === 0 ? (
          <p className="section-note">Belum ada pesan. Mulai percakapan pertama timmu.</p>
        ) : null}
        {rows.map((message) => {
          const mine = message.uid === session.uid
          const day = dayLabel(message.createdAtMs)
          const separator = day !== lastDay
          lastDay = day
          return (
            <div key={message.id}>
              {separator ? <p className="chat-day">{day}</p> : null}
              <div className={`chat-msg${mine ? ' is-mine' : ''}`}>
                <div className="chat-bubble">
                  {mine ? null : <b className="chat-author">{message.name}</b>}
                  <p className="chat-text">{message.text}</p>
                  <span className="chat-meta">
                    {timeLabel(message.createdAtMs)}
                    {mine || canModerate ? (
                      <button
                        type="button"
                        className="chat-del"
                        aria-label="Hapus pesan"
                        onClick={() => remove(message)}
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form className="chat-form" onSubmit={send}>
        <input
          className="field-input"
          value={text}
          maxLength={1000}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tulis pesan untuk tim…"
          aria-label="Pesan"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>
          <Icon name="send" size={16} />
          Kirim
        </button>
      </form>
    </div>
  )
}
