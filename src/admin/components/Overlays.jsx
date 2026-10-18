import { useEffect, useRef } from 'react'
import { Icon } from '../../components/Icon'

function useDismiss(open, onClose, ref) {
  // Simpan handler terbaru di ref agar efek di bawah tidak dijalankan ulang
  // setiap render (onClose biasanya fungsi inline yang berubah tiap ketikan).
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const node = ref.current
    // Fokus awal: kolom isian pertama bila ada, kalau tidak elemen interaktif pertama.
    const focusable =
      node?.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])') ??
      node?.querySelector('button, [href], [tabindex]:not([tabindex="-1"])')
    focusable?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current?.()
      }
      if (event.key === 'Tab' && node) {
        const items = Array.from(
          node.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null)
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('has-overlay')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('has-overlay')
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, ref])
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 520 }) {
  const ref = useRef(null)
  useDismiss(open, onClose, ref)
  if (!open) return null

  return (
    <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        style={{ '--drawer-w': `${width}px` }}
      >
        <header className="drawer-head">
          <div className="drawer-heading">
            <h2 className="drawer-title">{title}</h2>
            {subtitle ? <p className="drawer-sub">{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-btn icon-btn-sm" onClick={onClose} aria-label="Tutup panel">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-foot">{footer}</footer> : null}
      </aside>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Lanjutkan',
  tone = 'default',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)
  useDismiss(open, onCancel, ref)
  if (!open) return null

  return (
    <div className="overlay overlay-center" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-label={title} ref={ref}>
        <span className={`dialog-icon dialog-${tone}`} aria-hidden="true">
          <Icon name={tone === 'danger' ? 'alert' : 'info'} size={22} />
        </span>
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Batal
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
