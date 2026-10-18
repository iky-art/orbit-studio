import { useRef } from 'react'
import { Icon } from './Icon'

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { id: 'insights', label: 'Insights', icon: 'insights' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export function BottomDock({ view, onSelect }) {
  const refs = useRef([])
  const index = NAV_ITEMS.findIndex((item) => item.id === view)

  const moveFocus = (target) => {
    const next = (target + NAV_ITEMS.length) % NAV_ITEMS.length
    refs.current[next]?.focus()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      moveFocus(index + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      moveFocus(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      moveFocus(NAV_ITEMS.length - 1)
    }
  }

  return (
    <nav className="dock" aria-label="Navigasi utama">
      <div
        className="dock-inner"
        role="tablist"
        aria-label="Bagian dasbor"
        onKeyDown={onKeyDown}
      >
        <span
          className="dock-indicator"
          style={{ '--i': index < 0 ? 0 : index }}
          aria-hidden="true"
        />
        {NAV_ITEMS.map((item, i) => {
          const active = item.id === view
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`dock-${item.id}`}
              className="dock-item"
              aria-selected={active}
              aria-controls={`panel-${item.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(item.id)}
            >
              <Icon name={item.icon} size={21} strokeWidth={1.8} />
              <span className="dock-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
