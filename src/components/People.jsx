import { FOUNDERS, SITE } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'
import SectionHead from './SectionHead.jsx'

function Glyph({ kind }) {
  const stroke = 'var(--o-line-strong)'
  const accent = 'var(--o-accent)'

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-full w-full">
      {kind === 'square' && (
        <>
          <rect x="12" y="12" width="40" height="40" stroke={stroke} strokeWidth="1" />
          <rect x="12" y="12" width="20" height="20" fill={accent} />
          <path d="M32 32h20v20" stroke={accent} strokeWidth="1" />
        </>
      )}
      {kind === 'arcs' && (
        <>
          <path d="M8 56a24 24 0 0148 0" stroke={stroke} strokeWidth="1" />
          <path d="M18 56a14 14 0 0128 0" stroke={accent} strokeWidth="1.5" />
          <circle cx="32" cy="56" r="3" fill={accent} />
          <path d="M8 56h48" stroke={stroke} strokeWidth="1" />
        </>
      )}
      {kind === 'triangle' && (
        <>
          <path d="M32 10L56 52H8L32 10z" stroke={stroke} strokeWidth="1" />
          <path d="M32 10v42" stroke={stroke} strokeWidth="1" />
          <circle cx="32" cy="30" r="4" fill={accent} />
        </>
      )}
    </svg>
  )
}

export default function People() {
  const [ref, inView] = useReveal({ threshold: 0.05 })

  return (
    <section id="people" aria-labelledby="people-title" className="relative z-10 py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${inView ? 'in' : ''}`}>
        <SectionHead
          id="people-title"
          index="03"
          label="The People"
          title="Three people. One orbit."
          aside="Founders"
        />

        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:mt-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-4">
            <p className="text-base leading-relaxed text-muted">
              Orbit Studio is a digital studio founded by {SITE.founders[0]},{' '}
              {SITE.founders[1]} and {SITE.founders[2]}. We came together around a
              simple idea: make things properly, and keep the team small enough
              that everyone touches the work.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted">
              No account managers, no handoffs between departments. If something
              has our name on it, one of us built it.
            </p>
          </div>

          <ul className="lg:col-span-7 lg:col-start-6">
            {FOUNDERS.map((founder, i) => (
              <li
                key={founder.name}
                className="reveal border-t border-line py-7 first:border-t-0 first:pt-0 last:pb-0"
                style={{ animationDelay: `${0.08 * i}s` }}
              >
                <div className="flex items-start gap-5 sm:gap-8">
                  <div className="h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                    <Glyph kind={founder.glyph} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="type-xl uppercase">
                        <span className="mask">
                          <span>{founder.name}</span>
                        </span>
                      </h3>
                      <p className="label-sm text-faint">{founder.index}</p>
                    </div>

                    <p className="label mt-3 text-accent">{founder.role}</p>
                    <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted">
                      {founder.note}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
