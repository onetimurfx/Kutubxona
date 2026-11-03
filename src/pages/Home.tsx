import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Church, FlaskConical, Heart, Printer, Search, Shapes, TrendingUp } from 'lucide-react'
import { BOOKS } from '../data/books'
import { STATIONERY } from '../data/stationery'
import type { Book, Category } from '../data/types'
import { BookCard } from '../components/BookCard'
import { BookCover } from '../components/BookCover'
import { StationeryCard } from '../components/StationeryCard'
import { Section } from '../components/Section'
import { useStore } from '../lib/store'

const byFlag = (f: Book['flags'][number]) => BOOKS.filter((b) => b.flags.includes(f))
const discounted = BOOKS.filter((b) => b.oldPrice)

const CATEGORIES: { name: Category; icon: typeof BookOpen; color: string; dark?: boolean }[] = [
  { name: 'Badiiy adabiyot', icon: BookOpen, color: '#C23B4E' },
  { name: 'Ilm-fan', icon: FlaskConical, color: '#0B7A80' },
  { name: 'Biznes va iqtisod', icon: TrendingUp, color: '#16224F' },
  { name: 'Bolalar kitoblari', icon: Shapes, color: '#F0B429', dark: true },
  { name: 'Diniy kitoblar', icon: Church, color: '#0E5A4B' },
]

function Rail({ books }: { books: Book[] }) {
  return (
    <div className="rail">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  )
}

function CategoryRail({ category, to }: { category: Category; to: string }) {
  const books = BOOKS.filter((b) => b.category === category)
  return (
    <Section title={category} to={to}>
      <Rail books={books} />
    </Section>
  )
}

export function Home() {
  const { favorites } = useStore()
  const hero = [BOOKS[0], BOOKS[3], BOOKS[8]]
  const cat = (c: Category) => `/search?category=${encodeURIComponent(c)}`

  return (
    <div className="mx-auto max-w-5xl pb-36">
      <header className="flex items-center justify-between px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-xl font-extrabold tracking-[0.1em]">KUTUBXONA</span>
          <span className="rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold text-ink">DEMO</span>
        </div>
        <Link
          to="/account"
          aria-label="Sevimlilar"
          className="relative grid size-10 place-items-center rounded-full bg-white shadow-sm"
        >
          <Heart className="size-5" />
          {favorites.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-anor px-1 text-[11px] font-bold leading-[18px] text-white">
              {favorites.length}
            </span>
          )}
        </Link>
      </header>

      {/* Hero */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 pb-7 pt-8 text-white sm:px-10 sm:py-12">
          <svg className="absolute -right-10 -top-10 w-72 opacity-[0.12] sm:w-96" viewBox="-50 -50 100 100" fill="none" stroke="#F0B429" strokeWidth="0.8" aria-hidden>
            {[0, 15, 30, 45, 60, 75].map((r) => (
              <rect key={r} x="-30" y="-30" width="60" height="60" transform={`rotate(${r})`} />
            ))}
            <circle r="12" />
          </svg>
          <div className="relative sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div className="sm:max-w-sm">
              <h1 className="text-[40px] font-extrabold sm:text-5xl">Bugun nima o‘qiymiz?</h1>
              <p className="mt-3 max-w-[30ch] text-[15px] text-white/75">
                Klassika, ilm-fan va bolalar kitoblari. Buyurtma bering — do‘konda olib keting.
              </p>
              <Link
                to="/search"
                className="mt-6 flex items-center gap-3 rounded-[28px] bg-white px-5 py-3.5 text-[14px] leading-snug text-ink-soft shadow-lg transition-transform active:scale-[0.98]"
              >
                <Search className="size-5 shrink-0 text-ink" />
                <span>Kitob nomi, muallif yoki mavzu bo‘yicha qidiring...</span>
              </Link>
            </div>
            <div className="relative mx-auto mt-8 h-44 w-64 sm:mt-0 sm:h-56 sm:w-80" aria-hidden>
              {hero.map((b, i) => (
                <div
                  key={b.id}
                  className="absolute bottom-0 w-[34%]"
                  style={{
                    left: `${i * 33}%`,
                    transform: `rotate(${(i - 1) * 9}deg) translateY(${i === 1 ? -14 : 0}px)`,
                    zIndex: i === 1 ? 2 : 1,
                  }}
                >
                  <BookCover title={b.title} author={b.author} cover={b.cover} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <div className="rail">
          {CATEGORIES.map(({ name, icon: Icon, color, dark }) => (
            <Link
              key={name}
              to={cat(name)}
              className={`flex w-[132px] flex-col justify-between rounded-2xl p-3.5 transition-transform active:scale-[0.97] ${dark ? 'text-ink' : 'text-white'}`}
              style={{ background: color, height: 104 }}
            >
              <Icon className="size-6" strokeWidth={1.8} />
              <span className="text-[14px] font-semibold leading-tight">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Yangi kelganlar" to="/search?flag=new">
        <Rail books={byFlag('new')} />
      </Section>
      <Section title="Mashhur kitoblar" to="/search?flag=popular">
        <Rail books={byFlag('popular')} />
      </Section>
      <Section title="Bestsellerlar" to="/search?flag=bestseller">
        <Rail books={byFlag('bestseller')} />
      </Section>
      <Section title="Chegirmadagi kitoblar" to="/search?flag=sale">
        <Rail books={discounted} />
      </Section>
      <Section title="Siz uchun tavsiyalar" to="/search?flag=recommended">
        <Rail books={byFlag('recommended')} />
      </Section>

      {CATEGORIES.map((c) => (
        <CategoryRail key={c.name} category={c.name} to={cat(c.name)} />
      ))}

      <Section title="Kanselyariya" to="/stationery">
        <div className="rail">
          {STATIONERY.slice(0, 8).map((s) => (
            <StationeryCard key={s.id} item={s} />
          ))}
        </div>
      </Section>

      {/* Printing */}
      <section className="mt-9 px-4">
        <div className="overflow-hidden rounded-[28px] bg-teal p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-10">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <Printer className="size-6" />
            </div>
            <h2 className="mt-4 text-[28px] font-bold">Chop etish xizmatlari</h2>
            <p className="mt-2 max-w-[38ch] text-[15px] text-white/85">
              Kitob chop etish, nusxa ko‘chirish, hujjat chiqarish va muqovalash — barchasi bir joyda.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
              {['Kitob chop etish', "Nusxa ko'chirish", 'Hujjat chiqarish', 'Muqovalash'].map((s) => (
                <li key={s} className="rounded-full bg-white/15 px-3 py-1">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/print"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3.5 font-bold text-ink transition-transform active:scale-[0.97] sm:mt-0"
          >
            So‘rov yuborish
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      <p className="mx-auto mt-10 max-w-md px-6 text-center text-xs text-ink-soft">
        Bu KUTUBXONA demo versiyasi. Buyurtmalar va so‘rovlar haqiqiy do‘konga yuborilmaydi.
      </p>
    </div>
  )
}
