import type { Status } from '../data/types'
import { STATUS_ORDER } from '../lib/orders'

const TONE: Record<Status, string> = {
  received: 'bg-mist text-ink',
  preparing: 'bg-saffron/40 text-ink',
  ready: 'bg-teal text-white',
  completed: 'bg-ink text-white',
}

export function StatusChip({ status, labels }: { status: Status; labels: Record<Status, string> }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${TONE[status]}`}>{labels[status]}</span>
}

/** Four thin segments — a glanceable version of the full tracker for lists. */
export function MiniProgress({ status }: { status: Status }) {
  const idx = STATUS_ORDER.indexOf(status)
  return (
    <div className="flex gap-1" role="img" aria-label={`${idx + 1} / 4 bosqich`}>
      {STATUS_ORDER.map((s, i) => (
        <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-teal' : 'bg-mist'}`} />
      ))}
    </div>
  )
}
