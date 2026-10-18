import { useEffect, useState } from 'react'
import { NAV, SITE } from '../data/site.js'
import { useTheme } from '../hooks/useTheme.js'

function ThemeToggle({ theme, toggleTheme }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      className="group flex items-center gap-2 label-sm text-muted transition-colors duration-200 hover:text-fg"
    >
      <span className="relative block h-3 w-3">
        <span className="absolute inset-0 rounded-full border border-current" />
        <span
          className="absolute inset-[3px] rounded-full bg-accent transition-transform duration-300"
          style={{ transform: theme === 'light' ? 'scale(0.35)' : 'scale(1)' }}
        />
      </span>
      <span className="hidden sm:inline">{next}</span>
    </button>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const targets = NAV.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!targets.length || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled && !open
            ? 'border-b border-line bg-base/85 backdrop-blur-md'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="group flex items-baseline gap-2"
            aria-label={`${SITE.name} — back to top`}
          >
            <span className="type-md font-display font-semibold uppercase tracking-tight">
              Orbit
            </span>
            <span className="type-md font-display font-normal uppercase tracking-tight text-muted transition-colors duration-200 group-hover:text-fg">
              Studio
            </span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={`group flex items-baseline gap-1.5 text-[13px] font-medium transition-colors duration-200 ${
                      active === item.id
                        ? 'text-fg'
                        : 'text-muted hover:text-fg'
                    }`}
                  >
                    <span className="label-sm text-faint transition-colors duration-200 group-hover:text-accent">
                      {item.index}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            >
              <span className="relative block h-3.5 w-6">
                <span
                  className={`absolute left-0 block h-px w-full bg-fg transition-transform duration-300 ${
                    open ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-full bg-fg transition-transform duration-300 ${
                    open ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-base transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between px-5 pb-8 pt-20 sm:px-8">
          <nav aria-label="Mobile">
            <ul>
              {NAV.map((item) => (
                <li key={item.id} className="border-b border-line">
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="group flex items-baseline justify-between py-5"
                  >
                    <span className="type-xl font-display uppercase">
                      {item.label}
                    </span>
                    <span className="label text-faint">{item.index}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2">
            <p className="label text-faint">{SITE.tagline}</p>
            <p className="text-sm text-muted">
              {SITE.founders.join(' · ')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
