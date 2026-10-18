import { useMemo, useState } from 'react'
import { ViewHeader } from '../components/ViewHeader'
import { ActivityList } from '../components/ActivityList'
import { ActivityComposer } from '../components/ActivityComposer'
import { DataNotice } from '../components/DataNotice'
import { activityFilters } from '../data/dashboard'
import { useDashboard } from '../hooks/useDashboard'

export function ActivityView() {
  const { demo, status, error, items: activity, add } = useDashboard()
  const [filter, setFilter] = useState('all')

  const items = useMemo(
    () =>
      filter === 'all'
        ? activity
        : activity.filter((item) => item.type === filter),
    [filter, activity],
  )

  return (
    <>
      <ViewHeader
        eyebrow="Riwayat"
        title="Aktivitas"
        sub="Semua pembaruan dari ruang kerja, terbaru lebih dulu."
      />

      <DataNotice status={status} error={error} />
      {demo ? null : (
        <div className="section">
          <ActivityComposer onAdd={add} />
        </div>
      )}

      <div className="chip-row" role="group" aria-label="Saring aktivitas">
        {activityFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="surface activity-card" aria-label="Daftar aktivitas">
        <p className="section-note" style={{ padding: '0 4px 8px' }}>
          {items.length} pembaruan
        </p>
        <ActivityList
          items={items}
          emptyLabel="Tidak ada aktivitas untuk saringan ini."
        />
      </section>
    </>
  )
}
