import { useState } from 'react'
import { SERVICES } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'
import SectionHead from './SectionHead.jsx'

function ServiceRow({ service }) {
  const [active, setActive] = useState(false)

  return (
    <li
      className="border-t border-line last:border-b"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div className="group relative flex flex-wrap items-baseline gap-x-6 gap-y-3 py-6 sm:gap-x-10 sm:py-7">
        <span className="label w-7 shrink-0 text-faint">{service.index}</span>

        <h3
          className="type-service origin-left transition-transform duration-500 ease-out"
          style={{ transform: active ? 'translateX(0.4rem)' : 'translateX(0)' }}
        >
          <span className="mask">
            <span>{service.name}</span>
          </span>
        </h3>

        <p className="w-full pl-7 text-sm leading-relaxed text-muted sm:pl-0 lg:ml-auto lg:w-auto lg:max-w-[34ch] lg:text-right">
          {service.description}
        </p>

        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px bg-accent transition-[width] duration-500 ease-out"
          style={{ width: active ? '100%' : '0%' }}
        />
      </div>
    </li>
  )
}

export default function Make() {
  const [ref, inView] = useReveal({ threshold: 0.05 })

  return (
    <section id="make" aria-labelledby="make-title" className="relative z-10 py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${inView ? 'in' : ''}`}>
        <SectionHead
          id="make-title"
          index="04"
          label="What We Make"
          title="What we do"
          aside="Five disciplines"
        />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-3">
            <p className="text-base leading-relaxed text-muted">
              We work across the whole arc of a product — from the first rough
              idea to the last detail before it ships.
            </p>
          </div>

          <ul className="lg:col-span-8 lg:col-start-5">
            {SERVICES.map((service) => (
              <ServiceRow key={service.name} service={service} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
