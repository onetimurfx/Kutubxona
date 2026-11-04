import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search as SearchIcon, SearchX, SlidersHorizontal, X } from 'lucide-react'
import type { Book } from '../data/types'
import { CATEGORY_LIST, TOPICS, getAuthors, searchBooks, suggest } from '../lib/catalog'
import { isSellable, useCatalog } from '../lib/catalogStore'
import { discountPercent } from '../lib/format'
import { BookCard } from '../components/BookCard'
import { EmptyState } from '../components/EmptyState'
import { SimilarBooks } from '../components/SimilarBooks'

const FLAGS: Record<string, { title: string; test: (b: Book) => boolean }> = {
  new: { title: 'Yangi kelganlar', test: (b) => b.flags.includes('new') },
  popular: { title: 'Mashhur kitoblar', test: (b) => b.flags.includes('popular') },
  bestseller: { title: 'Bestsellerlar', test: (b) => b.flags.includes('bestseller') },
  recommended: { title: 'Siz uchun tavsiyalar', test: (b) => b.flags.includes('recommended') },
  sale: { title: 'Chegirmadagi kitoblar', test: (b) => discountPercent(b.price, b.oldPrice) > 0 },
}

const SORTS = [
  { v: 'relevance', label: 'Mosligi bo‘yicha' },
  { v: 'price-asc', label: 'Narx: arzondan qimmatga' },
  { v: 'price-desc', label: 'Narx: qimmatdan arzonga' },
  { v: 'rating', label: 'Reyting bo‘yicha' },
  { v: 'new', label: 'Yangi nashrlar' },
  { v: 'title', label: 'Nomi bo‘yicha (A–Z)' },
]

const PRICES = [
  { v: '', label: 'Har qanday narx' },
  { v: '0-50000', label: '50 000 so‘mgacha' },
  { v: '50000-80000', label: '50 000 – 80 000 so‘m' },
  { v: '80000-', label: '80 000 so‘mdan yuqori' },
]

const chip = (on: boolean) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-ink text-white' : 'bg-white text-ink shadow-sm'}`

export function Search() {
  const catalog = useCatalog()
  const [params, setParams] = useSearchParams()
  const urlQ = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const flag = params.get('flag') ?? ''
  const sort = params.get('sort') ?? 'relevance'
  const price = params.get('price') ?? ''
  const inStock = params.get('stock') === '1'
  const onSale = params.get('sale') === '1'
  const [focused, setFocused] = useState(false)
  const [panel, setPanel] = useState(false)

  // The text box keeps its own state so fast typing never loses characters while the URL catches up.
  const [q, setText] = useState(urlQ)
  const echoes = useRef(new Set<string>())
  const lastWritten = useRef(urlQ)
  useEffect(() => {
    if (urlQ === lastWritten.current) {
      echoes.current.clear()
      return
    }
    if (echoes.current.has(urlQ)) return
    lastWritten.current = urlQ // changed from outside (back button, link) — follow it
    setText(urlQ)
  }, [urlQ])

  const set = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
        return next
      },
      { replace: true },
    )

  const setQuery = (v: string) => {
    setText(v)
    lastWritten.current = v
    echoes.current.add(v)
    set({ q: v || null })
  }

  const results = useMemo(() => {
    let list = searchBooks(q)
    if (category) list = list.filter((b) => b.category === category)
    if (flag && FLAGS[flag]) list = list.filter(FLAGS[flag].test)
    if (inStock) list = list.filter(isSellable)
    if (onSale) list = list.filter(FLAGS.sale.test)
    if (price) {
      const [lo, hi] = price.split('-').map((x) => (x ? Number(x) : null))
      list = list.filter((b) => (lo === null || b.price >= lo) && (hi === null || b.price < hi))
    }
    const sorted = [...list]
    const by: Record<string, (a: Book, b: Book) => number> = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      new: (a, b) => b.year - a.year,
      title: (a, b) => a.title.localeCompare(b.title, 'uz'),
    }
    if (by[sort]) sorted.sort(by[sort])
    return sorted
  }, [q, category, flag, sort, price, inStock, onSale, catalog])

  const suggestions = useMemo(() => (focused ? suggest(q) : []), [q, focused, catalog])
  const activeFilters = [price, inStock ? '1' : '', onSale ? '1' : '', flag].filter(Boolean).length
  const anyFilter = Boolean(q || category || activeFilters)
  const clearAll = () => {
    setText('')
    lastWritten.current = ''
    setParams({}, { replace: true })
  }
  const heading = flag && FLAGS[flag] ? FLAGS[flag].title : category || (q ? 'Qidiruv natijalari' : 'Barcha kitoblar')

  return (
    <div className="mx-auto max-w-5xl pb-36 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="sticky top-0 z-30 bg-paper/95 px-4 pb-3 pt-2 backdrop-blur">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={q}
            autoFocus={!anyFilter}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Kitob nomi, muallif yoki mavzu bo'yicha qidiring..."
            aria-label="Qidiruv"
            enterKeyHint="search"
            className="w-full rounded-full bg-white py-3.5 pl-12 pr-12 text-[15px] shadow-sm outline-none placeholder:text-ink-soft/70 focus-visible:ring-4 focus-visible:ring-saffron/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setQuery('')}
              aria-label="Qidiruvni tozalash"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-mist"
            >
              <X className="size-4" />
            </button>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl" role="listbox">
              {suggestions.map((s) => (
                <li key={s.kind + s.text}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(s.text)
                      ;(document.activeElement as HTMLElement | null)?.blur()
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] hover:bg-paper"
                  >
                    <span className="truncate">{s.text}</span>
                    <span className="shrink-0 text-xs font-medium text-ink-soft">{s.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button onClick={() => set({ category: null })} className={chip(!category)}>
            Barchasi
          </button>
          {CATEGORY_LIST.map((c) => (
            <button key={c} onClick={() => set({ category: category === c ? null : c })} className={chip(category === c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setPanel((p) => !p)}
            aria-expanded={panel}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            <SlidersHorizontal className="size-4" />
            Filtrlar
            {activeFilters > 0 && <span className="grid size-5 place-items-center rounded-full bg-anor text-xs text-white">{activeFilters}</span>}
          </button>
          <label className="ml-auto flex min-w-0 max-w-[210px] flex-1 items-center">
            <span className="sr-only">Saralash</span>
            <select
              value={sort}
              aria-label="Saralash"
              onChange={(e) => set({ sort: e.target.value === 'relevance' ? null : e.target.value })}
              className="w-full min-w-0 truncate rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <AnimatePresence initial={false}>
          {panel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-3">
                <label className="text-sm font-semibold">
                  Narx
                  <select value={price} aria-label="Narx" onChange={(e) => set({ price: e.target.value || null })} className="mt-1 block w-full rounded-xl bg-paper px-3 py-2.5 font-normal">
                    {PRICES.map((p) => (
                      <option key={p.v} value={p.v}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input type="checkbox" checked={inStock} onChange={(e) => set({ stock: e.target.checked ? '1' : null })} className="size-5 accent-teal" />
                  Faqat sotuvda borlari
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input type="checkbox" checked={onSale} onChange={(e) => set({ sale: e.target.checked ? '1' : null })} className="size-5 accent-teal" />
                  Faqat chegirmadagilar
                </label>
                {flag && FLAGS[flag] && (
                  <button onClick={() => set({ flag: null })} className="flex items-center gap-2 text-left text-sm font-semibold text-anor sm:col-span-3">
                    <X className="size-4" /> “{FLAGS[flag].title}” tanlovini bekor qilish
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4">
        {!q && !anyFilter && (
          <div className="mb-5 mt-2">
            <p className="mb-2 text-sm font-semibold text-ink-soft">Mashhur mavzular</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button key={t} onClick={() => setQuery(t)} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm">
                  {t}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-4 text-sm font-semibold text-ink-soft">Mualliflar</p>
            <div className="flex flex-wrap gap-2">
              {getAuthors().map((a) => (
                <button key={a} onClick={() => setQuery(a)} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm">
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 mt-3 flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-extrabold">{heading}</h1>
          <p className="shrink-0 text-sm text-ink-soft" aria-live="polite">
            {results.length} ta kitob
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((b) => (
              <BookCard key={b.id} book={b} width="100%" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="Hech narsa topilmadi"
            text={q ? `“${q}” bo‘yicha kitob yo‘q. Yozilishini tekshiring yoki muallif yoki mavzu nomini yozib ko‘ring.` : 'Tanlangan filtrlarga mos kitob yo‘q. Filtrlarni o‘zgartiring.'}
          >
            <button onClick={clearAll} className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
              Filtrlarni tozalash
            </button>
          </EmptyState>
        )}
      </div>

      {results.length > 0 && anyFilter ? (
        <SimilarBooks seeds={results.slice(0, 3).map((b) => b.id)} exclude={results.map((b) => b.id)} />
      ) : results.length === 0 ? (
        <SimilarBooks seeds={catalog.books.filter((b) => b.flags.includes('bestseller')).map((b) => b.id)} fallbackToPopular />
      ) : null}
    </div>
  )
}
