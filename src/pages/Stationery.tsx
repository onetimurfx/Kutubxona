import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX, X } from 'lucide-react'
import { STATIONERY } from '../data/stationery'
import type { StationeryCategory } from '../data/types'
import { EmptyState } from '../components/EmptyState'
import { StationeryCard } from '../components/StationeryCard'
import { norm } from '../lib/catalog'

const CATEGORIES: StationeryCategory[] = ['Daftarlar', 'Ruchkalar', 'Qalamlar', "Qog'oz", 'Maktab buyumlari', 'Ofis buyumlari']
const SORTS = [
  { v: 'default', label: 'Odatiy tartib' },
  { v: 'price-asc', label: 'Narx: arzondan qimmatga' },
  { v: 'price-desc', label: 'Narx: qimmatdan arzonga' },
  { v: 'name', label: 'Nomi bo‘yicha (A–Z)' },
]

const chip = (on: boolean) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-ink text-white' : 'bg-white text-ink shadow-sm'}`

export function Stationery() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'default'
  const inStock = params.get('stock') === '1'
  const [q, setQ] = useState(params.get('q') ?? '')

  const set = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k)
        return next
      },
      { replace: true },
    )

  // keep the URL in step with the text box so a refresh keeps the search
  useEffect(() => {
    if ((params.get('q') ?? '') !== q) set({ q: q || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const items = useMemo(() => {
    const tokens = norm(q).split(' ').filter(Boolean)
    let list = STATIONERY.filter((s) => {
      if (category && s.category !== category) return false
      if (inStock && s.stock === 0) return false
      const hay = norm(`${s.name} ${s.category} ${s.description}`)
      return tokens.every((t) => hay.includes(t))
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'uz'))
    return list
  }, [q, category, sort, inStock])

  const clear = () => {
    setQ('')
    setParams({}, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl pb-36 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="sticky top-0 z-30 bg-paper/95 px-4 pb-3 pt-2 backdrop-blur">
        <h1 className="mb-3 text-3xl font-extrabold">Kanselyariya</h1>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Daftar, ruchka, qog‘oz..."
            aria-label="Kanselyariyadan qidirish"
            className="w-full rounded-full bg-white py-3.5 pl-12 pr-12 text-[15px] shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-saffron/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Qidiruvni tozalash" className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-mist">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button onClick={() => set({ category: null })} className={chip(!category)} aria-pressed={!category}>
            Barchasi
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => set({ category: category === c ? null : c })} className={chip(category === c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={inStock} onChange={(e) => set({ stock: e.target.checked ? '1' : null })} className="size-5 accent-teal" />
            Faqat sotuvda borlari
          </label>
          <select
            value={sort}
            aria-label="Saralash"
            onChange={(e) => set({ sort: e.target.value === 'default' ? null : e.target.value })}
            className="ml-auto max-w-[190px] truncate rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4">
        <p className="mb-4 mt-3 text-sm text-ink-soft" aria-live="polite">
          {items.length} ta mahsulot
        </p>
        {items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((s) => (
              <StationeryCard key={s.id} item={s} width="100%" />
            ))}
          </div>
        ) : (
          <EmptyState icon={SearchX} title="Mahsulot topilmadi" text="So‘rov yoki filtrlarga mos mahsulot yo‘q. Boshqa so‘z yozib ko‘ring.">
            <button onClick={clear} className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
              Filtrlarni tozalash
            </button>
          </EmptyState>
        )}
      </div>
    </div>
  )
}
