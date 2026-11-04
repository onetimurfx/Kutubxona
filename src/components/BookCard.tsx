import { Link } from 'react-router-dom'
import { Heart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Book } from '../data/types'
import { BookCover } from './BookCover'
import { useStore } from '../lib/store'
import { discountPercent, formatPrice } from '../lib/format'

export function BookCard({ book, width = 148 }: { book: Book; width?: number | string }) {
  const { isFavorite, toggleFavorite, addToCart } = useStore()
  const fav = isFavorite(book.id)
  const off = discountPercent(book.price, book.oldPrice)
  const sold = book.stock === 0

  return (
    <article style={{ width }} className="group">
      <div className="relative">
        <Link to={`/book/${book.id}`} aria-label={`${book.title} — batafsil`} className="block transition-transform duration-200 group-hover:-translate-y-1">
          <BookCover title={book.title} author={book.author} cover={book.cover} />
        </Link>
        {off > 0 && (
          <span className="absolute left-0 top-3 rounded-r-full bg-anor px-2.5 py-0.5 text-xs font-bold text-white">
            −{off}%
          </span>
        )}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleFavorite(book.id)}
          aria-pressed={fav}
          aria-label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur"
        >
          <Heart className={`size-[18px] ${fav ? 'fill-anor text-anor' : 'text-ink'}`} />
        </motion.button>
      </div>
      <Link to={`/book/${book.id}`} className="mt-3 block">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-normal">{book.title}</h3>
        <p className="mt-0.5 truncate text-[13px] text-ink-soft">{book.author}</p>
      </Link>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="leading-tight">
          <div className="text-[15px] font-bold">{formatPrice(book.price)}</div>
          {book.oldPrice && <div className="text-xs text-ink-soft line-through">{formatPrice(book.oldPrice)}</div>}
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          disabled={sold}
          onClick={() => addToCart('book', book.id)}
          aria-label={sold ? 'Sotuvda yo‘q' : `${book.title} — savatga qo'shish`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white disabled:bg-mist disabled:text-ink-soft"
        >
          <Plus className="size-5" />
        </motion.button>
      </div>
      {sold && <p className="mt-1 text-xs font-medium text-anor">Hozircha sotuvda yo‘q</p>}
    </article>
  )
}
