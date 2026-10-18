import { Icon } from './Icon'

const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

function toPoints(values, width = 100, height = 32, pad = 3) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0
  return values
    .map((value, index) => {
      const x = pad + index * step
      const y = pad + (1 - (value - min) / span) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export function MetricCard({ metric }) {
  const points = toPoints(metric.spark)
  const line = metric.trend === 'up' ? 'var(--accent)' : 'var(--negative)'
  const area = `${points} 100,32 0,32`

  return (
    <article className="surface metric-card">
      <div className="metric-top">
        <span className="metric-icon" aria-hidden="true">
          <Icon name={metric.icon} size={17} strokeWidth={1.8} />
        </span>
        <span className="metric-label">{metric.label}</span>
      </div>

      <p className="metric-value">
        {number.format(metric.value)}
        <span className="metric-unit">{metric.unit}</span>
      </p>

      <svg
        className="spark"
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={`spark-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={line} stopOpacity="0.28" />
            <stop offset="100%" stopColor={line} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#spark-${metric.id})`} />
        <polyline
          points={points}
          fill="none"
          stroke={line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="metric-foot">
        <span className={`delta ${metric.trend}`}>
          <Icon
            name={metric.trend === 'up' ? 'trendUp' : 'trendDown'}
            size={13}
            strokeWidth={2.1}
          />
          {number.format(Math.abs(metric.delta))}%
        </span>
        <span className="metric-note">vs minggu lalu</span>
      </div>
    </article>
  )
}
