import { Icon } from './Icon'

export function ActivityList({ items, emptyLabel }) {
  if (!items.length) {
    return <p className="activity-empty">{emptyLabel}</p>
  }

  return (
    <ul className="activity-list">
      {items.map((item) => (
        <li className="activity-item" key={item.id}>
          <span
            className={`activity-icon tone-${item.tone}`}
            aria-hidden="true"
          >
            <Icon name={item.icon} size={18} strokeWidth={1.8} />
          </span>
          <span className="activity-body">
            <span className="activity-title">{item.title}</span>
            <span className="activity-meta">{item.meta}</span>
          </span>
          <time className="activity-time">{item.time}</time>
        </li>
      ))}
    </ul>
  )
}
