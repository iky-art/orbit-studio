import { Icon } from '../../components/Icon'

export function PanelHeader({ eyebrow, title, blurb, actions }) {
  return (
    <header className="panel-head">
      <div className="panel-heading">
        {eyebrow ? <p className="panel-eyebrow">{eyebrow}</p> : null}
        <h1 className="panel-title">{title}</h1>
        {blurb ? <p className="panel-blurb">{blurb}</p> : null}
      </div>
      {actions ? <div className="panel-actions">{actions}</div> : null}
    </header>
  )
}

export function StatStrip({ items }) {
  if (!items?.length) return null
  return (
    <div className="stat-strip">
      {items.map((item) => (
        <article className="stat" key={item.label}>
          <span className="stat-label">{item.label}</span>
          <span className="stat-value">
            {item.value}
            {item.unit ? <em>{item.unit}</em> : null}
          </span>
          {item.note ? <span className="stat-note">{item.note}</span> : null}
        </article>
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'box', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="empty-title">{title}</h3>
      {message ? <p className="empty-message">{message}</p> : null}
      {action}
    </div>
  )
}

export function LoadingRows({ rows = 6 }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <span className="skeleton-row" key={index} />
      ))}
    </div>
  )
}

export function BarSeries({
  data,
  height = 150,
  valueKey = 'value',
  labelKey = 'label',
  format,
  fill = false,
}) {
  const max = Math.max(...data.map((item) => item[valueKey]), 1)
  return (
    <div
      className={fill ? 'bar-series bar-series-grow' : 'bar-series'}
      style={fill ? undefined : { height }}
    >
      {data.map((item, index) => (
        <div className="bar-series-col" key={item[labelKey] ?? index}>
          <span className="bar-series-tip">
            {format ? format(item[valueKey]) : item[valueKey]}
          </span>
          <span
            className="bar-series-fill"
            style={{ height: `${Math.max(4, (item[valueKey] / max) * 100)}%` }}
          />
          <span className="bar-series-label">{item[labelKey]}</span>
        </div>
      ))}
    </div>
  )
}

export function Sparkline({ points, width = 120, height = 34 }) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = width / (points.length - 1 || 1)
  const path = points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point - min) / span) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProgressBar({ value, label, note }) {
  return (
    <div className="progress-row">
      <div className="progress-head">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      {note ? <p className="progress-note">{note}</p> : null}
    </div>
  )
}
