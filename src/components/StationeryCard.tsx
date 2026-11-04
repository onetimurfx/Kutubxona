import { Backpack, FileText, Folder, NotebookPen, Paperclip, Pencil, PenLine, Plus, Ruler } from 'lucide-react'
import { motion } from 'framer-motion'
import type { StationeryItem } from '../data/types'
import { useStore } from '../lib/store'
import { formatPrice } from '../lib/format'

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

export function StationeryCard({ item, width = 148 }: { item: StationeryItem; width?: number }) {
  const { addToCart } = useStore()
  const Icon = ICONS[item.glyph]
  return (
    <article style={{ width }}>
      <div className="grid aspect-square place-items-center rounded-2xl" style={{ background: item.color }}>
        <Icon className="size-1/3 text-white/95" strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-normal">{item.name}</h3>
      <p className="text-[13px] text-ink-soft">{item.category}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-[15px] font-bold">{formatPrice(item.price)}</div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => addToCart('stationery', item.id)}
          aria-label={`${item.name} — savatga qo'shish`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white"
        >
          <Plus className="size-5" />
        </motion.button>
      </div>
    </article>
  )
}
