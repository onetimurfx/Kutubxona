import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { StationeryItem } from '../data/types'
import { useStore } from '../lib/store'
import { effectiveStock } from '../lib/catalogStore'
import { formatPrice } from '../lib/format'
import { QtyStepper } from './QtyStepper'
import { StationeryThumb } from './StationeryThumb'

export { ICONS } from './StationeryThumb'

export function StationeryCard({ item, width = 148 }: { item: StationeryItem; width?: number | string }) {
  const { addToCart, qtyInCart, setQty } = useStore()
  const inCart = qtyInCart('stationery', item.id)
  const stock = effectiveStock(item)
  const sold = stock === 0
  return (
    <article style={{ width }}>
      <Link to={`/stationery/${item.id}`} aria-label={`${item.name} — batafsil`} className="block">
        <StationeryThumb color={item.color} glyph={item.glyph} image={item.image} className={`aspect-square rounded-2xl ${sold ? 'opacity-50' : ''}`} />
        <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug tracking-normal">{item.name}</h3>
        <p className="text-[13px] text-ink-soft">{item.category}</p>
      </Link>
      <div className="mt-2 flex min-h-9 items-center justify-between gap-2">
        <div className="text-[15px] font-bold">{formatPrice(item.price)}</div>
        {inCart > 0 ? (
          <QtyStepper qty={inCart} max={stock} onChange={(n) => setQty('stationery', item.id, n)} label={item.name} />
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
