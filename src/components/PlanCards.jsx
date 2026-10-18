import { Icon } from './Icon'

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** Kartu paket & harga. `renderAction(plan, isCurrent)` opsional untuk tombol. */
export function PlanCards({ plans, currentName, renderAction }) {
  return (
    <div className="plan-grid">
      {plans.map((plan) => {
        const current =
          currentName && plan.name.toLowerCase() === String(currentName).toLowerCase()
        const saving =
          plan.kind === 'paid' && plan.priceYearly > 0
            ? Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)
            : 0
        const features = plan.seats > 0
          ? [`${plan.seats} anggota`, ...plan.features]
          : plan.features
        const action = renderAction?.(plan, Boolean(current))

        return (
          <article
            key={plan.id}
            className={`surface plan-card${plan.popular ? ' is-popular' : ''}${current ? ' is-current' : ''}`}
            aria-label={`Paket ${plan.name}`}
          >
            <header className="plan-head">
              <h3 className="plan-name">{plan.name}</h3>
              {current ? (
                <span className="plan-tag">Paket kamu</span>
              ) : plan.popular ? (
                <span className="plan-tag">Populer</span>
              ) : null}
            </header>

            <p className="plan-price">
              {plan.kind === 'free' ? (
                'Gratis'
              ) : plan.kind === 'contact' ? (
                'Hubungi kami'
              ) : (
                <>
                  {idr.format(plan.priceMonthly)}
                  <small>/bulan</small>
                </>
              )}
            </p>
            <p className="plan-sub">
              {plan.kind === 'paid' && plan.priceYearly > 0
                ? `atau ${idr.format(plan.priceYearly)}/tahun${saving > 0 ? ` · hemat ${saving}%` : ''}`
                : '\u00a0'}
            </p>

            <ul className="plan-features">
              {features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={15} strokeWidth={2.2} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {action}
          </article>
        )
      })}
    </div>
  )
}
