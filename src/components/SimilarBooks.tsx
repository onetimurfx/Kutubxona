import { similarBooks, popularBooks } from '../lib/catalog'
import { useCatalog } from '../lib/catalogStore'
import { BookCard } from './BookCard'

/** "SHUNGA O'XSHASH KITOBLAR" — recommendations based on one or more seed books. */
export function SimilarBooks({
  seeds,
  exclude = [],
  fallbackToPopular = false,
}: {
  seeds: string[]
  exclude?: string[]
  fallbackToPopular?: boolean
}) {
  useCatalog() // re-render when the admin changes the catalog
  let books = similarBooks(seeds, exclude)
  if (!books.length && fallbackToPopular) books = popularBooks([...seeds, ...exclude])
  if (!books.length) return null
  return (
    <section className="mt-10" aria-label="Shunga o'xshash kitoblar">
      <h2 className="mb-3 px-4 text-[20px] font-bold tracking-wide">SHUNGA O'XSHASH KITOBLAR</h2>
      <div className="rail">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  )
}
