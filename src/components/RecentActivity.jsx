import { ActivityList } from './ActivityList'
import { Icon } from './Icon'

export function RecentActivity({ items, onViewAll }) {
  return (
    <section className="surface activity-card" aria-labelledby="recent-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="recent-title">
            Aktivitas terbaru
          </h2>
          <p className="card-sub">Pembaruan dari ruang kerja kamu</p>
        </div>
        <button type="button" className="text-link" onClick={onViewAll}>
          Lihat semua
          <Icon name="arrowRight" size={15} strokeWidth={1.9} />
        </button>
      </div>
      <ActivityList
        items={items}
        emptyLabel="Belum ada aktivitas hari ini."
      />
    </section>
  )
}
