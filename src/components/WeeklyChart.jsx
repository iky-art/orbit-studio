const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

export function WeeklyChart({ week }) {
  const max = Math.max(...week.map((item) => item.value), 0.1)
  const total = week.reduce((sum, item) => sum + item.value, 0)
  const average = total / week.length
  const best = week.reduce((a, b) => (b.value > a.value ? b : a))
  const summary = week
    .map((item) => `${item.day} ${number.format(item.value)} jam`)
    .join(', ')

  return (
    <section className="surface chart-card" aria-labelledby="chart-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="chart-title">
            Grafik mingguan
          </h2>
          <p className="card-sub">Jam fokus per hari, 7 hari terakhir</p>
        </div>
        <div className="chart-total">
          <b>{number.format(total)}</b>
          <small>jam total</small>
        </div>
      </div>

      <div
        className="chart-bars"
        role="img"
        aria-label={`Grafik batang jam fokus mingguan. ${summary}. Total ${number.format(
          total,
        )} jam.`}
      >
        {week.map((item) => (
          <div
            className="bar-col"
            key={item.day}
            data-today={item.today ? 'true' : undefined}
            aria-hidden="true"
          >
            <div className="bar-track">
              <span className="bar-tip">{number.format(item.value)} jam</span>
              <div
                className="bar-fill"
                style={{ height: `${Math.max((item.value / max) * 100, 6)}%` }}
              />
            </div>
            <span className="bar-day">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-foot">
        <div className="mini-stat">
          <b>{number.format(average)} jam</b>
          <small>Rata-rata harian</small>
        </div>
        <div className="mini-stat">
          <b>
            {best.day} <em>{number.format(best.value)} jam</em>
          </b>
          <small>Hari terbaik</small>
        </div>
        <div className="mini-stat">
          <b>{week.filter((item) => item.value >= 4).length} hari</b>
          <small>Di atas 4 jam</small>
        </div>
      </div>
    </section>
  )
}
