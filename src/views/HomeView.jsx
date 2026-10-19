import { useCallback } from 'react'
import { Welcome } from '../components/Welcome'
import { MetricCard } from '../components/MetricCard'
import { WeeklyChart } from '../components/WeeklyChart'
import { RecentActivity } from '../components/RecentActivity'
import { FocusBanner } from '../components/FocusBanner'
import { ActivityComposer } from '../components/ActivityComposer'
import { DailyTarget } from '../components/DailyTarget'
import { DataNotice } from '../components/DataNotice'
import { useDashboard } from '../hooks/useDashboard'

export function HomeView({ onNavigate }) {
  const { user, demo, status, error, metrics, week, items, summary, add } = useDashboard()

  const onFocusDone = useCallback(
    (minutes) => {
      if (demo) return
      add({ type: 'focus', title: 'Sesi fokus selesai', project: '', minutes }).catch(() => {})
    },
    [demo, add],
  )

  return (
    <>
      <Welcome name={user?.name} sub={summary} />
      <DataNotice status={status} error={error} />

      <div className="section">
        <DailyTarget
          target={Number(user?.dailyTarget) || 0}
          hours={week.find((day) => day.today)?.value ?? 0}
        />
      </div>

      {demo ? null : (
        <div className="section">
          <ActivityComposer onAdd={add} />
        </div>
      )}

      <section className="section" aria-label="Ringkasan metrik">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <div className="section">
        <WeeklyChart week={week} />
      </div>

      <div className="section">
        <RecentActivity items={items.slice(0, 4)} onViewAll={() => onNavigate('activity')} />
      </div>

      <div className="section">
        <FocusBanner onComplete={onFocusDone} />
      </div>
    </>
  )
}
