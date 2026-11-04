import { Link } from 'react-router-dom'
import { Backpack, FileText, Folder, NotebookPen, Paperclip, Pencil, PenLine, Plus, Ruler } from 'lucide-react'
import { motion } from 'framer-motion'
import type { StationeryItem } from '../data/types'
import { useStore } from '../lib/store'
import { formatPrice } from '../lib/format'
import { QtyStepper } from './QtyStepper'

export const ICONS = {
  notebook: NotebookPen,
  pen: PenLine,
  pencil: Pencil,
  paper: FileText,
  backpack: Backpack,
  stapler: Paperclip,
  ruler: Ruler,
  folder: Folder,
}

export function StationeryCard({ item, width = 148 }: { item: StationeryItem; width?: number | string }) {
  const { addToCart, qtyInCart, setQty } = useStore()
  const Icon = ICONS[item.glyph]
  const inCart = qtyInCart('stationery', item.id)
  const sold = item.stock === 0
  return (
    <article style={{ width }}>
      <Link to={`/stationery/${item.id}`} aria-label={`${item.name} — batafsil`} className="block">
        <div className={`grid aspect-square place-items-center rounded-2xl ${sold ? 'opacity-50' : ''}`} style={{ background: item.color }}>
          <Icon className="size-1/3 text-white/95" strokeWidth={1.5} />
        </div>
        <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-normal">{item.name}</h3>
        <p className="text-[13px] text-ink-soft">{item.category}</p>
      </Link>
      <div className="mt-2 flex min-h-9 items-center justify-between gap-2">
        <div className="text-[15px] font-bold">{formatPrice(item.price)}</div>
        {inCart > 0 ? (
          <QtyStepper qty={inCart} max={item.stock} onChange={(n) => setQty('stationery', item.id, n)} label={item.name} />
        ) : (
          <motion.button
            whileTap={{ scale: 0.88 }}
            disabled={sold}
            onClick={() => addToCart('stationery', item.id)}
            aria-label={sold ? `${item.name} — sotuvda yo‘q` : `${item.name} — savatga qo'shish`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white disabled:bg-mist disabled:text-ink-soft"
          >
            <Plus className="size-5" />
          </motion.button>
        )}
      </div>
      {sold && <p className="mt-1 text-xs font-medium text-anor">Hozircha sotuvda yo‘q</p>}
    </article>
  )
}
