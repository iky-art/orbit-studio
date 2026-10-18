import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { formatRelative } from '../lib/format'

/** Lonceng notifikasi: pengumuman yang diterbitkan admin. */
export function NotificationBell() {
  const { items, unread, read, markAllRead } = useAnnouncements()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="bell" size={20} />
        {unread ? <span className="bell-badge">{unread > 9 ? '9+' : unread}</span> : null}
      </button>

      {open ? (
        <div className="bell-pop" role="dialog" aria-label="Notifikasi">
          <div className="bell-head">
            <b>Notifikasi</b>
            {unread ? (
              <button type="button" className="bell-link" onClick={markAllRead}>
                Tandai dibaca
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="bell-empty">Belum ada pengumuman.</p>
          ) : (
            <ul className="bell-list">
              {items.map((item) => (
                <li key={item.id} className={read.includes(item.id) ? '' : 'is-unread'}>
                  <p className="bell-title">{item.title}</p>
                  {item.body ? <p className="bell-body">{item.body}</p> : null}
                  <p className="bell-time">{formatRelative(item.publishAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
