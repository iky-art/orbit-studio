/**
 * Poster proyek — komposisi geometris yang dibuat dengan SVG.
 * Sengaja bukan screenshot palsu: setiap poster adalah abstraksi dari
 * gagasan proyeknya (signal, grid, gelombang tekanan, peta node).
 */
export default function ProjectPoster({ kind, title }) {
  const line = 'var(--o-line-strong)'
  const accent = 'var(--o-accent)'

  return (
    <svg
      viewBox="0 0 800 520"
      role="img"
      aria-label={title}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >

      {kind === 'signal' && (
        <>
          <circle cx="400" cy="260" r="220" fill="none" stroke={line} strokeWidth="1" />
          <circle cx="400" cy="260" r="160" fill="none" stroke={line} strokeWidth="1" />
          <circle cx="400" cy="260" r="100" fill="none" stroke={line} strokeWidth="1" />
          <path
            d="M0 260h140l40-90 60 180 70-260 70 340 60-170 50 90 60-60h150"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="400" cy="260" r="5" fill={accent} />
          <g stroke={line} strokeWidth="1">
            <path d="M400 40v40M400 440v40M180 260h-40M620 260h40" />
          </g>
        </>
      )}

      {kind === 'grid' && (
        <>
          <g stroke={line} strokeWidth="1">
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={`v${i}`} d={`M${100 + i * 75} 60v400`} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={`h${i}`} d={`M100 ${60 + i * 80}h600`} />
            ))}
          </g>
          <rect x="325" y="220" width="150" height="80" fill={accent} />
          <g stroke={accent} strokeWidth="2">
            <path d="M250 180h-60v-60" />
            <path d="M550 340h60v60" />
          </g>
          <g fill={line}>
            <rect x="175" y="180" width="6" height="6" />
            <rect x="619" y="340" width="6" height="6" />
          </g>
        </>
      )}

      {kind === 'waves' && (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${160 + i * 40} C 200 ${100 + i * 40}, 300 ${
                220 + i * 40
              }, 400 ${160 + i * 40} S 600 ${100 + i * 40}, 800 ${160 + i * 40}`}
              fill="none"
              stroke={i === 3 ? accent : line}
              strokeWidth={i === 3 ? 2 : 1}
            />
          ))}
          <g stroke={line} strokeWidth="1">
            <path d="M400 60v60M400 400v60" />
          </g>
          <circle cx="400" cy="260" r="4" fill={accent} />
        </>
      )}

      {kind === 'network' && (
        <>
          <g stroke={line} strokeWidth="1">
            <path d="M140 400L300 200M300 200l160 120M460 320l180-180M300 200l180-180M460 320L300 400M140 400h320M300 400l160-80M140 400L300 200" />
          </g>
          <g stroke={accent} strokeWidth="1.5">
            <path d="M300 200l160 120M460 320l180-180" />
          </g>
          <g fill={accent}>
            <circle cx="300" cy="200" r="7" />
            <circle cx="460" cy="320" r="5" />
          </g>
          <g fill="var(--o-fg)" opacity="0.5">
            <circle cx="140" cy="400" r="4" />
            <circle cx="640" cy="140" r="4" />
            <circle cx="300" cy="400" r="4" />
          </g>
        </>
      )}
    </svg>
  )
}
