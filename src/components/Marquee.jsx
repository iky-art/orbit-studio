import { MARQUEE_ITEMS } from '../data/site.js'

// Tiga salinan identik supaya lintasan tidak pernah menyisakan celah
// saat digeser satu lebar salinan (-33.333%) di layar lebar.
const COPIES = 3

export default function Marquee() {
  const items = Array.from({ length: COPIES }).flatMap((_, copy) =>
    MARQUEE_ITEMS.map((item) => ({ item, copy })),
  )

  return (
    <div
      aria-hidden="true"
      className="relative z-10 overflow-hidden border-y border-line py-3.5"
    >
      <div className="marquee-track">
        {items.map(({ item, copy }) => (
          <span key={`${copy}-${item}`} className="flex shrink-0 items-center">
            <span className="label px-6 text-muted">{item}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  )
}
