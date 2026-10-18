import { useReveal } from '../hooks/useReveal.js'

/**
 * Kepala section: nomor, label, judul besar.
 * Dipakai berulang supaya sistem penomoran terasa konsisten.
 */
export default function SectionHead({ id, index, label, title, aside, className = '' }) {
  const [ref, inView] = useReveal()

  return (
    <div ref={ref} className={`${inView ? 'in' : ''} ${className}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <p className="label text-accent">
          <span className="text-fg">{index}</span>
          <span className="mx-2 text-faint">/</span>
          {label}
        </p>
        {aside ? <p className="label-sm hidden text-faint sm:block">{aside}</p> : null}
      </div>

      {title ? (
        <h2 id={id} className="type-xl mt-8 uppercase">
          <span className="mask">
            <span>{title}</span>
          </span>
        </h2>
      ) : null}
    </div>
  )
}
