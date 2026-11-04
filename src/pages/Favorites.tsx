import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { useCatalog } from '../lib/catalogStore'
import { BookCard } from '../components/BookCard'
import { EmptyState } from '../components/EmptyState'
import { SimilarBooks } from '../components/SimilarBooks'
import { useStore } from '../lib/store'

export function Favorites() {
  const { favorites, addBooks } = useStore()
  const { books: BOOKS } = useCatalog()
  const books = favorites.map((id) => BOOKS.find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => Boolean(b))

  if (!books.length) {
    return (
      <div className="mx-auto max-w-4xl pb-36 pt-12">
        <EmptyState icon={Heart} title="Sevimlilar hozircha bo‘sh" text="Kitob ustidagi yurakcha tugmasini bosing — kitob shu yerda saqlanadi.">
          <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
            Kitoblarni ko‘rish
          </Link>
        </EmptyState>
        <SimilarBooks seeds={['kichkina-shahzoda', 'alkimyogar']} fallbackToPopular />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="px-4">
        <Link to="/" className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-ink-soft">
          <ArrowLeft className="size-4" /> Bosh sahifa
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">
            Sevimlilar <span className="text-ink-soft">({books.length})</span>
          </h1>
          <button
            onClick={() => addBooks(books.map((b) => b.id))}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white transition-transform active:scale-[0.98]"
          >
            <ShoppingBag className="size-4" /> Hammasini savatga
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((b) => (
            <BookCard key={b.id} book={b} width="100%" />
          ))}
        </div>
      </div>
      <SimilarBooks seeds={books.map((b) => b.id)} exclude={books.map((b) => b.id)} fallbackToPopular />
    </div>
  )
}
