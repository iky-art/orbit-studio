import { useEffect, useState } from 'react'
import { SITE } from '../data/site.js'
import { usePointerDrift } from '../hooks/usePointerDrift.js'

const BOOT_LINES = ['Independent digital studio', 'Est. 2026 · Indonesia']

export default function Hero() {
  const [boot, setBoot] = useState(false)
  const drift = usePointerDrift(1)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setBoot(true)
      return
    }
    const id = window.setTimeout(() => setBoot(true), 80)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className={`relative z-10 min-h-[100svh] pt-14 ${boot ? 'in' : ''}`}
    >
      <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[1440px] flex-col px-5 pb-6 sm:px-8 lg:px-12">
        {/* Baris atas */}
        <div className="flex items-start justify-between gap-4 pt-6 sm:pt-8">
          <div className="reveal" style={{ animationDelay: '0.35s' }}>
            <p className="label text-fg">Orbit Studio</p>
            <p className="label-sm mt-2 text-faint">Independent · 01</p>
          </div>
          <div
            className="reveal hidden text-right sm:block"
            style={{ animationDelay: '0.45s' }}
          >
            <p className="label text-faint">Precision in Motion</p>
            <p className="label-sm mt-2 text-faint">Scroll to enter ↓</p>
          </div>
        </div>

        {/* Judul utama */}
        <div className="flex flex-1 items-center py-10 sm:py-14">
          <div className="w-full">
            <h1 id="hero-title" className="type-mega uppercase">
              <span className="mask">
                <span style={{ animationDelay: '0.12s' }}>Precision</span>
              </span>{' '}
              <span className="block">
                <span className="mask">
                  <span style={{ animationDelay: '0.22s' }}>
                    in <span className="serif-accent normal-case">motion</span>
                  </span>
                </span>
              </span>
            </h1>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-14 lg:grid-cols-12">
              <div
                className="reveal lg:col-span-5"
                style={{ animationDelay: '0.7s' }}
              >
                <div className="rule mb-5 h-px w-full bg-line-strong" />
                <p className="max-w-[34ch] text-base leading-relaxed text-muted sm:text-lg">
                  We build digital products, experiences and ideas that move —
                  made in small batches by three people.
                </p>
              </div>

              <div
                className="reveal lg:col-span-4 lg:col-start-9 lg:text-right"
                style={{ animationDelay: '0.85s' }}
              >
                <ul className="space-y-2">
                  {BOOT_LINES.map((line) => (
                    <li key={line} className="label-sm text-faint">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Baris bawah */}
        <div className="flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="reveal" style={{ animationDelay: '0.95s' }}>
            <p className="label text-faint">Founders</p>
            <p className="type-md mt-2 font-display uppercase">
              {SITE.founders.join(' · ')}
            </p>
          </div>

          <div
            className="reveal flex items-end gap-6"
            style={{ animationDelay: '1.05s' }}
          >
            <a
              href="#work"
              className="group inline-flex items-center gap-3 text-sm font-medium text-fg"
            >
              <span className="link-underline">Explore the work</span>
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 2v12M8 14l4.5-4.5M8 14L3.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-fg"
            >
              <span className="link-underline">Start a conversation</span>
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8h12M14 8l-4.5-4.5M14 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Penanda orbit — bergeser sangat halus mengikuti pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <svg
          width="132"
          height="132"
          viewBox="0 0 132 132"
          fill="none"
          className="text-line-strong"
          style={{
            transform: `translate3d(${drift.x * 7}px, ${drift.y * 7}px, 0)`,
            transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <circle cx="66" cy="66" r="52" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="66" cy="14" r="2.4" fill="var(--o-accent)" />
          <path d="M66 4v8M66 120v8M4 66h8M120 66h8" stroke="currentColor" strokeWidth="0.6" />
          <text
            x="66"
            y="70"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7px',
              letterSpacing: '0.18em',
            }}
          >
            2026
          </text>
        </svg>
      </div>

      {/* Garis masuk ke section berikutnya */}
      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-1/2 hidden h-16 w-px -translate-x-1/2 bg-line-strong transition-opacity duration-1000 sm:block ${
          boot ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </section>
  )
}
