import { motion } from 'framer-motion'
import { Check, ClipboardCheck, CheckCheck, Package, Store } from 'lucide-react'
import type { Status } from '../data/types'
import { STATUS_ORDER } from '../lib/orders'
import { formatDateTime } from '../lib/format'

const ICONS = { received: ClipboardCheck, preparing: Package, ready: Store, completed: CheckCheck }

function Dot({ s, i, idx }: { s: Status; i: number; idx: number }) {
  const done = i <= idx
  const Icon = ICONS[s]
  return (
    <motion.span
      key={`${s}-${done}`}
      initial={done ? { scale: 0.7 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18, delay: i * 0.08 }}
      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${done ? 'bg-teal text-white' : 'bg-mist text-ink-soft'} ${i === idx ? 'ring-4 ring-saffron/70' : ''}`}
    >
      {done && i < idx ? <Check className="size-5" /> : <Icon className="size-5" />}
    </motion.span>
  )
}

/** Vertical list on phones (labels never collide), horizontal stepper from tablet width up. */
export function StatusTracker({
  status,
  labels,
  history,
}: {
  status: Status
  labels: Record<Status, string>
  history: { status: Status; at: number }[]
}) {
  const idx = STATUS_ORDER.indexOf(status)
  const timeOf = (s: Status) => {
    const at = history.find((h) => h.status === s)?.at
    return at ? formatDateTime(at).split(', ')[1] : ''
  }

  return (
    <>
      <ol className="relative sm:hidden" aria-label="Buyurtma holati">
        <div className="absolute inset-x-0 top-[30px] bottom-[30px]" aria-hidden>
          <div className="absolute left-[18px] top-0 h-full w-1 rounded bg-mist" />
          <motion.div
            className="absolute left-[18px] top-0 w-1 rounded bg-teal"
            initial={{ height: 0 }}
            animate={{ height: `${(idx / 3) * 100}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        {STATUS_ORDER.map((s, i) => (
          <li key={s} className="relative flex items-center gap-3 py-2.5" aria-current={i === idx ? 'step' : undefined}>
            <Dot s={s} i={i} idx={idx} />
            <span className={`flex-1 text-[15px] leading-tight ${i <= idx ? 'font-bold' : 'text-ink-soft'}`}>{labels[s]}</span>
            <span className="text-xs text-ink-soft">{timeOf(s)}</span>
          </li>
        ))}
      </ol>

      <ol className="relative hidden grid-cols-4 gap-2 sm:grid" aria-label="Buyurtma holati (gorizontal)">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded bg-mist" aria-hidden />
        <motion.div
          className="absolute left-[12.5%] top-5 h-1 rounded bg-teal"
          initial={{ width: 0 }}
          animate={{ width: `${(idx / 3) * 75}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          aria-hidden
        />
        {STATUS_ORDER.map((s, i) => (
          <li key={s} className="relative flex flex-col items-center text-center" aria-current={i === idx ? 'step' : undefined}>
            <Dot s={s} i={i} idx={idx} />
            <span className={`mt-2 w-full text-xs leading-tight tracking-tight ${i <= idx ? 'font-bold' : 'text-ink-soft'}`}>{labels[s]}</span>
            {timeOf(s) && <span className="mt-0.5 text-[10.5px] text-ink-soft">{timeOf(s)}</span>}
          </li>
        ))}
      </ol>
    </>
  )
}
