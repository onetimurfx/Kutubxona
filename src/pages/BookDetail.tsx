import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookX, Check, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { effectiveStock, isLowStock, isSellable, useCatalog } from '../lib/catalogStore'
import { BookCover } from '../components/BookCover'
import { EmptyState } from '../components/EmptyState'
import { SimilarBooks } from '../components/SimilarBooks'
import { useStore } from '../lib/store'
import { discountPercent, formatPrice } from '../lib/format'

export function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books } = useCatalog()
  const book = books.find((b) => b.id === id)
  const { isFavorite, toggleFavorite, addToCart, qtyInCart, setQty } = useStore()

  // React Router stores its position in history.state.idx; 0 means this page was opened directly.
  const back = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/search'))

  if (!book) {
    return (
      <div className="pb-36 pt-16">
        <EmptyState icon={BookX} title="Kitob topilmadi" text="Bu manzilda kitob yo‘q. Katalogdan boshqa kitoblarni ko‘ring.">
          <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
            Katalogga o‘tish
          </Link>
          <Link to="/" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm">
            Bosh sahifa
          </Link>
        </EmptyState>
      </div>
    )
  }

  const fav = isFavorite(book.id)
  const sold = !isSellable(book)
  const stock = effectiveStock(book)
  const inCart = qtyInCart('book', book.id)
  const off = discountPercent(book.price, book.oldPrice)
  const low = isLowStock(book)

  return (
    <div className="mx-auto max-w-4xl pb-36 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="px-4">
        <button onClick={back} className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-ink-soft">
          <ArrowLeft className="size-4" /> Orqaga
        </button>

        <div className="mt-2 sm:flex sm:gap-10">
          <div className="relative mx-auto w-56 shrink-0 sm:mx-0 sm:w-64">
            <BookCover title={book.title} author={book.author} cover={book.cover} />
            {off > 0 && <span className="absolute left-0 top-4 rounded-r-full bg-anor px-3 py-1 text-sm font-bold text-white">−{off}%</span>}
          </div>

          <div className="mt-6 min-w-0 sm:mt-0">
            <Link to={`/search?category=${encodeURIComponent(book.category)}`} className="text-sm font-semibold text-teal hover:underline">
              {book.category}
            </Link>
            <h1 className="mt-1 text-4xl font-extrabold">{book.title}</h1>
            <Link to={`/search?q=${encodeURIComponent(book.author)}`} className="mt-1 inline-block text-lg text-ink-soft hover:underline">
              {book.author}
            </Link>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
              <Star className="size-4 fill-saffron text-saffron" /> {book.rating.toFixed(1)}
            </p>

            <p className="mt-4 max-w-[60ch] leading-relaxed">{book.description}</p>

            <dl className="mt-4 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt className="text-ink-soft">Janr</dt>
              <dd className="font-medium">{book.genre}</dd>
              <dt className="text-ink-soft">Sahifalar</dt>
              <dd className="font-medium">{book.pages} bet</dd>
              <dt className="text-ink-soft">Nashr yili</dt>
              <dd className="font-medium">{book.year}</dd>
            </dl>

            <div className="mt-3 flex flex-wrap gap-2">
              {book.subjects.map((s) => (
                <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                  {s}
                </Link>
              ))}
            </div>

            <p className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${sold ? 'text-anor' : 'text-teal'}`}>
              {!sold && <Check className="size-4" />}
              {sold ? 'Hozircha sotuvda yo‘q' : low ? `Sotuvda bor — atigi ${stock} dona qoldi` : `Sotuvda bor (${stock} dona)`}
            </p>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold">{formatPrice(book.price)}</span>
              {book.oldPrice && <span className="text-ink-soft line-through">{formatPrice(book.oldPrice)}</span>}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {inCart > 0 ? (
                <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-white">
                  <button onClick={() => setQty('book', book.id, inCart - 1)} aria-label="Kamaytirish" className="grid size-12 place-items-center rounded-full hover:bg-white/10">
                    <Minus className="size-5" />
                  </button>
                  <span className="min-w-8 text-center text-lg font-bold" aria-live="polite">
                    {inCart}
                  </span>
                  <button
                    onClick={() => setQty('book', book.id, inCart + 1)}
                    disabled={inCart >= stock}
                    aria-label="Ko‘paytirish"
                    className="grid size-12 place-items-center rounded-full hover:bg-white/10 disabled:opacity-40"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              ) : (
                <button
                  disabled={sold}
                  onClick={() => addToCart('book', book.id)}
                  className="flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-bold text-white transition-transform active:scale-[0.98] disabled:bg-mist disabled:text-ink-soft"
                >
                  <ShoppingBag className="size-5" /> Savatga qo‘shish
                </button>
              )}
              <button
                onClick={() => toggleFavorite(book.id)}
                aria-pressed={fav}
                aria-label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
                className="grid size-14 place-items-center rounded-full bg-white shadow-sm"
              >
                <Heart className={`size-6 ${fav ? 'fill-anor text-anor' : ''}`} />
              </button>
            </div>
            {inCart > 0 && (
              <Link to="/cart" className="mt-3 inline-block text-sm font-semibold text-teal underline-offset-4 hover:underline">
                Savatda {inCart} dona — savatga o‘tish
              </Link>
            )}
          </div>
        </div>
      </div>

      <SimilarBooks seeds={[book.id]} fallbackToPopular />
    </div>
  )
}
