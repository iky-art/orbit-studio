const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

/** Progres target fokus harian (dari sesi fokus yang tercatat hari ini). */
export function DailyTarget({ target, hours }) {
  if (!target) return null
  const pct = Math.min(100, Math.round((hours / target) * 100))
  return (
    <section className="surface target-card" aria-label="Target fokus harian">
      <div className="progress-head">
        <span>Target fokus hari ini</span>
        <span>
          {nf.format(hours)} / {nf.format(target)} jam
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="section-note">
        {pct >= 100
          ? 'Target tercapai. Kerja bagus!'
          : `Sisa ${nf.format(Math.max(target - hours, 0))} jam lagi hari ini.`}
      </p>
    </section>
  )
}
