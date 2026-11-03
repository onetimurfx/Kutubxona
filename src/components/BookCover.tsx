import type { CoverStyle } from '../data/types'

function Motif({ motif, color }: { motif: CoverStyle['motif']; color: string }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinejoin: 'round' as const }
  switch (motif) {
    case 'star':
      return (
        <g {...common}>
          {[0, 22.5, 45, 67.5].map((r) => (
            <rect key={r} x="-18" y="-18" width="36" height="36" transform={`rotate(${r})`} />
          ))}
          <circle r="8" />
        </g>
      )
    case 'ikat':
      return (
        <g {...common}>
          {[-30, -15, 0, 15, 30].map((y, i) => (
            <path key={y} d={`M${-26 + i * 2} ${y} l12 -8 l12 8 l12 -8 l12 8 l-12 8 l-12 -8 l-12 8 z`} transform="translate(-2 0)" />
          ))}
        </g>
      )
    case 'arches':
      return (
        <g {...common}>
          {[-24, 0, 24].map((x) => (
            <path key={x} d={`M${x - 11} 26 V0 a11 14 0 0 1 22 0 V26`} />
          ))}
          <path d="M-36 26 H36" />
        </g>
      )
    case 'rings':
      return (
        <g {...common}>
          {[8, 15, 22, 29].map((r) => (
            <circle key={r} r={r} />
          ))}
        </g>
      )
    case 'waves':
      return (
        <g {...common}>
          {[-24, -12, 0, 12, 24].map((y) => (
            <path key={y} d={`M-36 ${y} q9 -10 18 0 t18 0 t18 0 t18 0`} />
          ))}
        </g>
      )
    case 'tiles':
      return (
        <g {...common}>
          {[-24, -8, 8, 24].flatMap((x) =>
            [-24, -8, 8, 24].map((y) => (
              <rect key={`${x}${y}`} x={x - 6} y={y - 6} width="12" height="12" transform={`rotate(45 ${x} ${y})`} />
            )),
          )}
        </g>
      )
  }
}

interface Props {
  title: string
  author: string
  cover: CoverStyle
  className?: string
}

/** A typeset book cover. Scales with its container (title size uses container units). */
export function BookCover({ title, author, cover, className = '' }: Props) {
  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-[6px_10px_10px_6px] shadow-[0_10px_24px_-10px_rgba(22,34,79,0.55)] ${className}`}
      style={{ background: cover.bg, color: cover.fg, containerType: 'inline-size' }}
      role="img"
      aria-label={`${title}, ${author}`}
    >
      {/* spine shading */}
      <div
        className="absolute inset-y-0 left-0 w-[9%]"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.28), rgba(255,255,255,.12) 60%, transparent)' }}
      />
      <svg viewBox="-50 -50 100 100" className="absolute left-[14%] top-[4%] w-[76%] opacity-90" aria-hidden>
        <Motif motif={cover.motif} color={cover.accent} />
      </svg>
      <div className="absolute inset-x-[14%] bottom-[7%] top-[56%] flex flex-col justify-end">
        <div
          className="font-display font-bold leading-[1.02]"
          style={{ fontSize: '12.5cqw', letterSpacing: '-0.02em', textWrap: 'balance' }}
        >
          {title}
        </div>
        <div className="mt-[4cqw] font-medium opacity-80" style={{ fontSize: '6.2cqw' }}>
          {author}
        </div>
      </div>
      <div className="absolute bottom-0 left-[14%] h-[2.2%] w-[22%]" style={{ background: cover.accent }} />
    </div>
  )
}
