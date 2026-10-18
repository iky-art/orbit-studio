import { SITE } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'

export default function Contact() {
  const [ref, inView] = useReveal({ threshold: 0.1 })

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-10 py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${inView ? 'in' : ''}`}>
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="label text-accent">
            <span className="text-fg">06</span>
            <span className="mx-2 text-faint">/</span>
            Contact
          </p>
          <p className="label-sm hidden text-faint sm:block">Open for 2026</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 id="contact-title" className="type-mega uppercase">
              <span className="mask">
                <span>Have an</span>
              </span>{' '}
              <span className="block">
                <span className="mask">
                  <span style={{ animationDelay: '0.08s' }}>idea?</span>
                </span>
              </span>
            </h2>

            <p className="reveal mt-8 max-w-[42ch] text-lg leading-relaxed text-muted">
              Tell us what you are trying to make. We will tell you honestly
              whether we are the right people for it.
            </p>
          </div>

          <div className="reveal flex flex-col justify-end gap-6 lg:col-span-4">
            <a
              href={`mailto:${SITE.email}`}
              className="group flex items-center justify-between gap-6 border-b border-line-strong pb-4 transition-colors duration-200 hover:border-accent"
            >
              <span className="type-md font-display uppercase">Start a conversation</span>
              <svg
                className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1.5"
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

            <div>
              <p className="label text-faint">Email</p>
              <p className="mt-2 break-all font-mono text-sm text-muted">{SITE.email}</p>
            </div>

            <div>
              <p className="label text-faint">Founders</p>
              <p className="type-md mt-2 font-display uppercase">
                {SITE.founders.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
