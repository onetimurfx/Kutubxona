import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const W = 150
const H = 210
const paper = 'linear-gradient(135deg,#fbfcfe,#e6ecf4)'

function Leaf({ i, total }: { i: number; total: number }) {
  // flipped leaves stack upward on the left; unflipped ones sit above the right page
  const start = 4 + (total - i)
  const end = 2 + i
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: W, height: H, transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
      initial={{ rotateY: 0, z: start }}
      animate={{ rotateY: -180, z: end }}
      transition={{ delay: 0.95 + i * 0.2, duration: 0.5, ease: [0.45, 0, 0.2, 1] }}
    >
      <div className="absolute inset-0 rounded-r-md" style={{ background: paper, backfaceVisibility: 'hidden' }}>
        <Lines />
      </div>
      <div className="absolute inset-0 rounded-l-md" style={{ background: paper, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <Lines />
      </div>
    </motion.div>
  )
}

function Lines() {
  return (
    <div className="space-y-2.5 p-5 pt-8 opacity-40">
      {[90, 100, 70, 95, 60, 85].map((w, i) => (
        <div key={i} className="h-[3px] rounded bg-ink" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

export function Intro({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 500 : 2300)
    return () => window.clearTimeout(t)
  }, [onDone, reduce])

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onDone}
      role="presentation"
    >
      <button
        onClick={onDone}
        className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
      >
        O‘tkazib yuborish
      </button>

      <div className="flex flex-col items-center">
        {!reduce && (
          <div style={{ perspective: 900, height: H + 40 }} className="grid place-items-center">
            <motion.div
              className="relative"
              style={{ width: 0, height: H, transformStyle: 'preserve-3d' }}
              initial={{ x: -W / 2, rotateX: 14, rotateY: -22, scale: 0.6, opacity: 0 }}
              animate={{ x: [-W / 2, -W / 2, 0], rotateX: [14, 8, 0], rotateY: [-22, -12, 0], scale: [0.6, 1, 1], opacity: 1 }}
              transition={{ duration: 1.1, times: [0, 0.45, 1], ease: 'easeOut' }}
            >
              {/* right base page */}
              <div className="absolute left-0 top-0 rounded-r-md shadow-2xl" style={{ width: W, height: H, background: paper }}>
                <Lines />
              </div>
              {[2, 1, 0].map((i) => (
                <Leaf key={i} i={2 - i} total={3} />
              ))}
              {/* cover */}
              <motion.div
                className="absolute left-0 top-0"
                style={{ width: W, height: H, transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
                initial={{ rotateY: 0, z: 8 }}
                animate={{ rotateY: -180, z: 1 }}
                transition={{ delay: 0.55, duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
              >
                <div
                  className="absolute inset-0 grid place-items-center rounded-r-lg"
                  style={{ background: 'linear-gradient(135deg,#0b7a80,#075a5f)', backfaceVisibility: 'hidden', boxShadow: 'inset 6px 0 10px rgba(0,0,0,.25)' }}
                >
                  <svg viewBox="-30 -30 60 60" className="w-20" fill="none" stroke="#f0b429" strokeWidth="1.2" aria-hidden>
                    {[0, 22.5, 45, 67.5].map((r) => (
                      <rect key={r} x="-18" y="-18" width="36" height="36" transform={`rotate(${r})`} />
                    ))}
                    <circle r="6" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-l-lg" style={{ background: paper, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} />
              </motion.div>
            </motion.div>
          </div>
        )}

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 1.65, duration: 0.45 }}
        >
          <div className="font-display text-4xl font-extrabold tracking-[0.12em] text-white">KUTUBXONA</div>
          <div className="mx-auto mt-3 h-[3px] w-16 rounded bg-saffron" />
        </motion.div>
      </div>
    </motion.div>
  )
}
