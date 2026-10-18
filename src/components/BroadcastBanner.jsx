import { Icon } from './Icon'
import { useBroadcasts } from '../hooks/useBroadcasts'
import { BROADCAST_TONES } from '../lib/broadcast'
import { formatRelative } from '../lib/format'

/** Satu kartu pesan; dipakai banner pengguna dan pratinjau di panel admin. */
export function BroadcastItem({ tone = 'info', title, body, time, onDismiss }) {
  const info = BROADCAST_TONES.find((item) => item.id === tone) ?? BROADCAST_TONES[0]
  const urgent = info.id === 'warning' || info.id === 'danger'
  return (
    <aside className={`broadcast broadcast-${info.id}`} role={urgent ? 'alert' : 'status'}>
      <span className="broadcast-icon" aria-hidden="true">
        <Icon name={info.icon} size={18} strokeWidth={1.9} />
      </span>
      <div className="broadcast-body">
        <p className="broadcast-title">{title || 'Judul pesan'}</p>
        {body ? <p className="broadcast-text">{body}</p> : null}
        {time ? <p className="broadcast-time">{time}</p> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="icon-btn"
          onClick={onDismiss}
          aria-label="Tutup pesan"
        >
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </aside>
  )
}

/** Banner pesan dari admin di ruang kerja pengguna (real-time). */
export function BroadcastBanner() {
  const { items, dismiss } = useBroadcasts()
  if (!items.length) return null
  return (
    <section className="broadcast-stack" aria-label="Pesan dari admin">
      {items.map((item) => (
        <BroadcastItem
          key={item.id}
          tone={item.tone}
          title={item.title}
          body={item.body}
          time={formatRelative(item.createdAt)}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
    </section>
  )
}
