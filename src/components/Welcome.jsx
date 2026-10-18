function greetingFor(hour) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}

const formatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function Welcome({ name, sub }) {
  const now = new Date()
  const firstName = (name || 'kamu').split(' ')[0]

  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <p className="welcome-eyebrow">{formatter.format(now)}</p>
      <h1 className="welcome-title" id="welcome-title">
        {greetingFor(now.getHours())}, <em>{firstName}</em>.
      </h1>
      <p className="welcome-sub">{sub}</p>
    </section>
  )
}
