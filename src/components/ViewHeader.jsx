export function ViewHeader({ eyebrow, title, sub }) {
  return (
    <header className="welcome">
      <p className="welcome-eyebrow">{eyebrow}</p>
      <h1 className="welcome-title">{title}</h1>
      {sub && <p className="welcome-sub">{sub}</p>}
    </header>
  )
}
