import { PlanCards } from './PlanCards'
import { usePlans } from '../hooks/usePlans'
import { useAuth } from '../providers/AuthProvider'
import { LEGAL } from '../legal/config'

/** Bagian "Paket kamu" di Pengaturan. */
export function PlanSection() {
  const { user } = useAuth()
  const { status, plans } = usePlans()
  const current = user?.plan ?? 'Free'

  return (
    <section className="surface plan-section" aria-labelledby="plan-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="plan-title">
            Paket kamu
          </h2>
          <p className="card-sub">
            Saat ini kamu memakai paket <b>{current}</b>.
          </p>
        </div>
      </div>

      {status === 'ready' && plans.length ? (
        <PlanCards plans={plans} currentName={current} />
      ) : (
        <p className="section-note">
          {status === 'loading' ? 'Memuat paket…' : 'Daftar paket belum diterbitkan.'}
        </p>
      )}

      <p className="section-note">
        Pembayaran online belum tersedia. Untuk pindah paket, hubungi admin
        {LEGAL.email ? ` di ${LEGAL.email}` : ''}.
      </p>
    </section>
  )
}
