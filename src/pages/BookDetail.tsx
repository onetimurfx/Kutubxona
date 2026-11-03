import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { BOOKS } from '../data/books'
import { BookCover } from '../components/BookCover'
import { useStore } from '../lib/store'
import { formatPrice } from '../lib/format'

export function BookDetail() {
  const { id } = useParams()
  const book = BOOKS.find((b) => b.id === id)
  const { isFavorite, toggleFavorite, addToCart } = useStore()

  if (!book) {
    return (
      <div className="mx-auto max-w-md px-6 pb-36 pt-24 text-center">
        <h1 className="text-2xl font-bold">Kitob topilmadi</h1>
        <p className="mt-2 text-ink-soft">Bu manzilda kitob yo‘q. Bosh sahifadan boshqa kitoblarni ko‘ring.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-white">
          Bosh sahifaga qaytish
        </Link>
      </div>
    )
  }

  const fav = isFavorite(book.id)
  const sold = book.stock === 0

  return (
    <div className="mx-auto max-w-3xl px-4 pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <Link to="/" className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-ink-soft">
        <ArrowLeft className="size-4" /> Orqaga
      </Link>
      <div className="mt-2 sm:flex sm:gap-10">
        <div className="mx-auto w-56 shrink-0 sm:mx-0 sm:w-64">
          <BookCover title={book.title} author={book.author} cover={book.cover} />
        </div>
        <div className="mt-6 sm:mt-0">
          <p className="text-sm font-semibold text-teal">{book.category}</p>
          <h1 className="mt-1 text-4xl font-extrabold">{book.title}</h1>
          <p className="mt-1 text-lg text-ink-soft">{book.author}</p>
          <p className="mt-4 max-w-[60ch] leading-relaxed">{book.description}</p>
          <p className="mt-3 text-sm text-ink-soft">
            {book.genre} · {book.pages} bet · {book.year}-yil
          </p>
          <p className={`mt-3 text-sm font-semibold ${sold ? 'text-anor' : 'text-teal'}`}>
            {sold ? 'Hozircha sotuvda yo‘q' : `Sotuvda bor (${book.stock} dona)`}
          </p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(book.price)}</span>
            {book.oldPrice && <span className="text-ink-soft line-through">{formatPrice(book.oldPrice)}</span>}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              disabled={sold}
              onClick={() => addToCart('book', book.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-bold text-white transition-transform active:scale-[0.98] disabled:bg-mist disabled:text-ink-soft sm:flex-none"
            >
              <ShoppingBag className="size-5" /> Savatga qo‘shish
            </button>
            <button
              onClick={() => toggleFavorite(book.id)}
              aria-pressed={fav}
              aria-label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
              className="grid size-14 place-items-center rounded-full bg-white shadow-sm"
            >
              <Heart className={`size-6 ${fav ? 'fill-anor text-anor' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
