import { SYSTEM_LINES } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'

function SystemLine({ line, index }) {
  const [ref, inView] = useReveal({ threshold: 0.4 })

  return (
    <div ref={ref} className={`${inView ? 'in' : ''} border-t border-line`}>
      <div className="flex items-baseline gap-4 py-5 sm:gap-8 sm:py-7">
        <span className="label shrink-0 text-faint">{line.index}</span>
        <p className="type-xl uppercase">
          <span className="mask">
            <span style={{ animationDelay: `${index * 0.06}s` }}>{line.text}</span>
          </span>
        </p>
        <span
          aria-hidden="true"
          className="rule ml-auto hidden h-px flex-1 bg-line-strong sm:block"
          style={{ animationDelay: `${0.15 + index * 0.06}s` }}
        />
      </div>
    </div>
  )
}

export default function System() {
  const [ref, inView] = useReveal({ threshold: 0.05 })

  return (
    <section id="system" aria-labelledby="system-title" className="relative z-10 py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${inView ? 'in' : ''}`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <p className="label text-accent">
                <span className="text-fg">05</span>
                <span className="mx-2 text-faint">/</span>
                Orbit System
              </p>
            </div>

            <h2 id="system-title" className="sr-only">
              Orbit System
            </h2>

            <p className="reveal mt-8 max-w-[38ch] text-base leading-relaxed text-muted">
              A loop, not a process diagram. Four moves we repeat on everything
              that leaves the studio.
            </p>

            <p className="reveal mt-5 max-w-[38ch] text-base leading-relaxed text-muted">
              It is slower than shipping whatever is easiest. It is the reason
              the work holds up.
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {SYSTEM_LINES.map((line, i) => (
              <SystemLine key={line.index} line={line} index={i} />
            ))}
            <div className="border-t border-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
