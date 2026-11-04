import { useMemo, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'
import { effectiveStock, isLowStock, LOW_STOCK, setStock, useCatalog } from '../lib/catalogStore'
import { norm } from '../lib/catalog'
import { BookCover } from '../components/BookCover'
import { StationeryThumb } from '../components/StationeryThumb'
import { Card, PageHeader, StockBadge, chip } from './ui'

type F = 'all' | 'low' | 'out' | 'off'
type Row = { kind: 'book' | 'stationery'; id: string; name: string; sub: string; stock: number; available?: boolean; thumb: React.ReactNode }

function StockEditor({ row }: { row: Row }) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => { if (draft !== null && draft !== '' && Number(draft) >= 0) setStock(row.kind, row.id, Number(draft)); setDraft(null) }
  return (
    <div className="flex items-center rounded-full bg-paper p-0.5">
      <button onClick={() => setStock(row.kind, row.id, row.stock - 1)} disabled={row.stock <= 0} aria-label={`${row.name} — kamaytirish`} className="grid size-9 place-items-center rounded-full hover:bg-white disabled:opacity-35"><Minus className="size-4" /></button>
      <input aria-label={`${row.name} — zaxira`} inputMode="numeric" type="number" min={0} value={draft ?? row.stock} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())} className="w-16 bg-transparent text-center font-bold outline-none focus-visible:ring-2 focus-visible:ring-saffron" />
      <button onClick={() => setStock(row.kind, row.id, row.stock + 1)} aria-label={`${row.name} — ko‘paytirish`} className="grid size-9 place-items-center rounded-full hover:bg-white"><Plus className="size-4" /></button>
    </div>
  )
}

export function AdminInventory() {
  const { books, stationery } = useCatalog()
  const [f, setF] = useState<F>('all')
  const [type, setType] = useState<'all' | 'book' | 'stationery'>('all')
  const [q, setQ] = useState('')

  const rows: Row[] = useMemo(() => [
    ...books.map((b): Row => ({ kind: 'book', id: b.id, name: b.title, sub: b.author, stock: b.stock, available: b.available, thumb: <div className="w-9"><BookCover title={b.title} author={b.author} cover={b.cover} /></div> })),
    ...stationery.map((s): Row => ({ kind: 'stationery', id: s.id, name: s.name, sub: s.category, stock: s.stock, available: s.available, thumb: <StationeryThumb color={s.color} glyph={s.glyph} image={s.image} className="size-9 rounded-lg" iconClass="size-4" /> })),
  ], [books, stationery])

  const low = rows.filter(isLowStock).length
  const out = rows.filter((r) => r.available !== false && r.stock <= 0).length
  const off = rows.filter((r) => r.available === false).length
  const inStock = rows.filter((r) => effectiveStock(r) > 0).length
  const units = rows.reduce((n, r) => n + Math.max(0, r.stock), 0)

  const n = norm(q)
  const list = rows.filter((r) => (type === 'all' || r.kind === type) && (!n || norm(`${r.name} ${r.sub}`).includes(n)) && (f === 'all' || (f === 'low' && isLowStock(r)) || (f === 'out' && r.available !== false && r.stock <= 0) || (f === 'off' && r.available === false)))

  const stats = [['Sotuvda', inStock, 'text-teal-deep'], ['Kam qolgan', low, 'text-ink'], ['Tugagan', out, 'text-anor'], ['Sotuvda emas', off, 'text-ink-soft'], ['Jami dona', units, 'text-ink']] as const
  return (
    <>
      <PageHeader title="Zaxira" text={`Kam qolgan: ${LOW_STOCK} donadan kam. Miqdorni o‘zgartirsangiz, mijoz saytida darhol yangilanadi.`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([l, v, c]) => <div key={l} className="rounded-2xl bg-white p-4 shadow-sm"><p className={`text-2xl font-extrabold ${c}`} data-testid={`inv-${l}`}>{v}</p><p className="text-sm font-semibold">{l}</p></div>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {([['all', 'Hammasi'], ['low', 'Kam qolgan'], ['out', 'Tugagan'], ['off', 'Sotuvda emas']] as const).map(([v, l]) => <button key={v} aria-pressed={f === v} onClick={() => setF(v)} className={chip(f === v)}>{l}</button>)}
        <select aria-label="Tur" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-full bg-white px-3 py-2 text-sm font-semibold ring-1 ring-mist">
          <option value="all">Kitob va kanselyariya</option><option value="book">Faqat kitoblar</option><option value="stationery">Faqat kanselyariya</option>
        </select>
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Zaxirada qidirish" placeholder="Qidirish" className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60" />
        </div>
      </div>
      <Card className="mt-4 !p-0">
        {list.length === 0 ? <p className="p-8 text-center text-ink-soft">Bu filtrga mos mahsulot yo‘q.</p> : (
          <ul className="divide-y divide-mist" data-testid="inv-rows">
            {list.map((r) => (
              <li key={r.kind + r.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4" data-testid="inv-row">
                {r.thumb}
                <div className="min-w-0 flex-1 basis-40"><p className="truncate font-semibold">{r.name}</p><p className="truncate text-sm text-ink-soft">{r.kind === 'book' ? 'Kitob' : 'Kanselyariya'} · {r.sub}</p></div>
                <StockBadge stock={r.stock} available={r.available} />
                <StockEditor row={r} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
