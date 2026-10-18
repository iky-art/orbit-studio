/**
 * Grid kolom + lintasan orbit tipis.
 * Murni dekoratif — tidak pernah menutupi konten (pointer-events-none).
 */
export default function Field() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Grid kolom */}
      <div className="absolute inset-0 mx-auto flex max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="h-full flex-1 border-l border-line" />
        <div className="h-full flex-1 border-l border-line" />
        <div className="hidden h-full flex-1 border-l border-line md:block" />
        <div className="hidden h-full flex-1 border-l border-line lg:block" />
        <div className="h-full w-px bg-line" />
      </div>

      {/* Grid horizontal tipis */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, var(--o-grid) 1px, transparent 1px)',
          backgroundSize: '100% 120px',
        }}
      />

      {/* Lintasan orbit */}
      <svg
        className="absolute -right-[38vw] -top-[26vh] h-[95vw] w-[95vw] max-h-[1100px] max-w-[1100px] text-line-strong opacity-[0.5]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <g className="spin-slow">
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.6" />
          <circle
            cx="200"
            cy="200"
            r="112"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 6"
          />
          <circle cx="350" cy="200" r="2.5" fill="var(--o-accent)" />
        </g>
        <g className="spin-reverse">
          <circle cx="200" cy="200" r="76" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="124" cy="200" r="1.8" fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}
