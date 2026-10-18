import { PROJECTS } from '../data/site.js'
import { useReveal } from '../hooks/useReveal.js'
import ProjectPoster from './ProjectPoster.jsx'
import SectionHead from './SectionHead.jsx'

function ProjectEntry({ project }) {
  const [ref, inView] = useReveal({ threshold: 0.08 })
  const flip = project.align === 'right'

  return (
    <article
      ref={ref}
      className={`${inView ? 'in' : ''} grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line py-10 first:border-t-0 first:pt-0 sm:py-14 lg:grid-cols-12 lg:gap-y-8`}
    >
      {/* Metadata */}
      <div
        className={`reveal flex flex-col justify-between gap-6 lg:col-span-3 ${
          flip ? 'lg:order-2 lg:col-start-10' : 'lg:order-1'
        }`}
      >
        <div>
          <p className="label text-faint">{project.index}</p>
          <h3 className="type-lg mt-3 uppercase">
            <span className="mask">
              <span>{project.name}</span>
            </span>
          </h3>
          <p className="label-sm mt-3 text-accent">{project.category}</p>
        </div>

        <dl className="space-y-1">
          <div className="flex gap-2">
            <dt className="label-sm text-faint">Year</dt>
            <dd className="label-sm text-muted">{project.year}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="label-sm text-faint">Type</dt>
            <dd className="label-sm text-muted">{project.notes.join(' · ')}</dd>
          </div>
        </dl>
      </div>

      {/* Poster */}
      <div
        className={`reveal lg:col-span-9 ${
          flip ? 'lg:order-1 lg:col-start-1' : 'lg:order-2'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="poster-frame relative overflow-hidden border border-line bg-surface">
          <div className="aspect-[16/10] w-full sm:aspect-[16/9]">
            <div className="poster-far h-full w-full scale-[1.03]">
              <ProjectPoster kind={project.poster} title={`${project.name} — ${project.figure}`} />
            </div>
          </div>

          {/* Label sudut — bagian dari komposisi, bukan dekorasi.
              Disembunyikan dari screen reader karena informasi yang sama
              sudah tersedia di kolom metadata dan pada aria-label poster. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <span className="label-sm bg-base/80 px-2 py-1 text-muted backdrop-blur-sm">
                {project.figure}
              </span>
              <span className="label-sm text-faint">{project.index}/04</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <span className="poster-name type-md font-display uppercase">
                {project.name}
              </span>
              <span className="label-sm text-faint">
                Orbit Studio · {project.year}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted">
          {project.description}
        </p>
      </div>
    </article>
  )
}

export default function Work() {
  const [ref, inView] = useReveal({ threshold: 0.05 })

  return (
    <section id="work" aria-labelledby="work-title" className="relative z-10 py-20 sm:py-28">
      <div ref={ref} className={`mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 ${inView ? 'in' : ''}`}>
        <SectionHead
          id="work-title"
          index="02"
          label="Selected Work"
          title="Things we made"
          aside={`${PROJECTS.length} projects · 2023—2024`}
        />

        <div className="mt-10 sm:mt-14">
          {PROJECTS.map((project) => (
            <ProjectEntry key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
