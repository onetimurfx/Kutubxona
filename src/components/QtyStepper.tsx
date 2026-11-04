import { Minus, Plus } from 'lucide-react'

export function QtyStepper({
  qty,
  max,
  onChange,
  tone = 'light',
  label = '',
}: {
  qty: number
  max: number
  onChange: (n: number) => void
  tone?: 'light' | 'dark'
  label?: string
}) {
  const bg = tone === 'dark' ? 'bg-ink text-white' : 'bg-paper'
  const hover = tone === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white'
  return (
    <div className={`inline-flex items-center rounded-full p-0.5 ${bg}`}>
      <button onClick={() => onChange(qty - 1)} aria-label={`${label} Kamaytirish`.trim()} className={`grid size-9 place-items-center rounded-full ${hover}`}>
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center font-bold" aria-label={`Miqdor: ${qty}`}>
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        aria-label={`${label} Ko‘paytirish`.trim()}
        className={`grid size-9 place-items-center rounded-full disabled:opacity-35 ${hover}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
