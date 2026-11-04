import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Status } from '../data/types'

export const adminField =
  'mt-1.5 block w-full rounded-xl bg-paper px-3.5 py-3 text-[15px] outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold shadow-sm ring-1 ring-mist transition-transform active:scale-[0.98]'
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-full bg-anor px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98]'

export function PageHeader({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 max-w-[60ch] text-sm text-ink-soft">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors before:absolute before:-inset-2 before:content-[''] ${checked ? 'bg-teal' : 'bg-mist'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute top-1 size-5 rounded-full bg-white shadow ${checked ? 'right-1' : 'left-1'}`}
      />
    </button>
  )
}

export function StockBadge({ stock, available }: { stock: number; available?: boolean }) {
  if (available === false) return <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-bold text-ink-soft">Sotuvda emas</span>
  if (stock <= 0) return <span className="rounded-full bg-anor/15 px-2.5 py-0.5 text-xs font-bold text-anor">Tugagan</span>
  if (stock <= 10) return <span className="rounded-full bg-saffron/40 px-2.5 py-0.5 text-xs font-bold">Kam qolgan</span>
  return <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-xs font-bold text-teal-deep">Yetarli</span>
}

/** Accessible modal: Esc / backdrop closes, focus moves inside, page scroll is locked meanwhile. */
export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('input:not([type=file]),select,textarea')?.focus(), 60)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [onClose])

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-md'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-mist px-5 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Yopish" className="grid size-9 place-items-center rounded-full hover:bg-paper">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  text: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <Modal title={title} onClose={onCancel}>
          <p className="text-ink-soft">{text}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button onClick={onCancel} className={btnGhost}>
              Bekor qilish
            </button>
            <button onClick={onConfirm} className={btnDanger}>
              {confirmLabel}
            </button>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>
}

export function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'hozirgina'
  if (m < 60) return `${m} daqiqa oldin`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} soat oldin`
  const d = Math.round(h / 24)
  return d < 8 ? `${d} kun oldin` : new Date(ts).toLocaleDateString('ru-RU')
}

export const STATUS_FILTERS: { v: Status | 'all'; label: string }[] = [
  { v: 'all', label: 'Hammasi' },
  { v: 'received', label: 'Qabul qilindi' },
  { v: 'preparing', label: 'Tayyorlanmoqda' },
  { v: 'ready', label: 'Olib ketishga tayyor' },
  { v: 'completed', label: 'Yakunlandi' },
]

export const chip = (on: boolean) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-ink text-white' : 'bg-white shadow-sm ring-1 ring-mist'}`
