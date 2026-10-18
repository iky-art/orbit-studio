import { ViewHeader } from '../components/ViewHeader'
import { WeeklyChart } from '../components/WeeklyChart'
import { DataNotice } from '../components/DataNotice'
import { useDashboard } from '../hooks/useDashboard'

export function InsightsView() {
  const { status, error, week, insights } = useDashboard()

  return (
    <>
      <ViewHeader
        eyebrow="Analitik"
        title="Insights"
        sub="Pola fokus dan distribusi waktu kerjamu minggu ini."
      />
      <DataNotice status={status} error={error} />

      <div className="section">
        <WeeklyChart week={week} />
      </div>

      <div className="insight-grid section">
        {insights.tiles.map((tile) => (
          <article className="surface insight-tile" key={tile.id}>
            <span className="metric-label">{tile.label}</span>
            <b>{tile.value}</b>
            <p>{tile.note}</p>
          </article>
        ))}

        <article className="surface insight-tile insight-wide">
          <span className="metric-label">Distribusi waktu</span>
          {insights.breakdown.length === 0 ? (
            <p>Belum ada aktivitas minggu ini.</p>
          ) : (
            insights.breakdown.map((row) => (
              <div className="progress-row" key={row.id}>
                <div className="progress-head">
                  <span>{row.label}</span>
                  <span>{row.value}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))
          )}
        </article>
      </div>
    </>
  )
}
