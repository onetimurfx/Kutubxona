import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Search } from 'lucide-react'
import type { Status } from '../data/types'
import { useStore } from '../lib/store'
import { useCatalog, getBook, getStationeryItem } from '../lib/catalogStore'
import { ORDER_LABELS, STATUS_ORDER, nextStatus } from '../lib/orders'
import { norm } from '../lib/catalog'
import { formatDateTime, formatPhone, formatPrice, phoneDigits } from '../lib/format'
import { StatusChip } from '../components/StatusChip'
import { Card, PageHeader, STATUS_FILTERS, btnGhost, btnPrimary, chip } from './ui'

export function AdminOrders() {
  const { orders, setOrderStatus } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Status | 'all'>('all')

  const list = useMemo(() => {
    const n = norm(q)
    const d = phoneDigits(q)
    return orders.filter((o) => (filter === 'all' || o.status === filter) && (!n || norm(`${o.id} ${o.name}`).includes(n) || (d.length >= 3 && o.phone.replace(/\D/g, '').includes(d))))
  }, [orders, q, filter])

  return (
    <>
      <PageHeader title="Buyurtmalar" text="Barcha buyurtmalar olib ketish (pickup) uchun. “Yakunlandi” holati zaxirani bir marta kamaytiradi." />
      <div className="relative mb-3 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buyurtmani qidirish" placeholder="Buyurtma raqami yoki mijoz ismi" className="w-full rounded-full bg-white py-3 pl-11 pr-4 shadow-sm outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60" />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Holat bo‘yicha filtr">
        {STATUS_FILTERS.map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} aria-pressed={filter === f.v} className={chip(filter === f.v)}>
            {f.label} <span className="opacity-60">{f.v === 'all' ? orders.length : orders.filter((o) => o.status === f.v).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Card><p className="py-6 text-center text-ink-soft">{orders.length === 0 ? 'Hali buyurtma yo‘q. “Ma’lumotlar” bo‘limidan namunaviy buyurtmalarni qo‘shishingiz mumkin.' : 'Hech narsa topilmadi.'}</p></Card>
      ) : (
        <ul className="space-y-3" data-testid="order-rows">
          {list.map((o) => {
            const nx = nextStatus(o.status)
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm" data-testid="order-row">
                <div className="min-w-0 flex-1 basis-48">
                  <Link to={`/admin/orders/${o.id}`} className="font-extrabold hover:underline">{o.id}</Link>
                  <p className="truncate text-sm">{o.name} · {formatPhone(o.phone)}</p>
                  <p className="text-xs text-ink-soft">{formatDateTime(o.createdAt)} · {o.lines.reduce((n, l) => n + l.qty, 0)} dona</p>
                </div>
                <p className="font-bold">{formatPrice(o.total)}</p>
                <StatusChip status={o.status} labels={ORDER_LABELS} />
                <select aria-label={`${o.id} — holatni o‘zgartirish`} value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value as Status)} className="rounded-full bg-paper px-3 py-2 text-sm font-semibold outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60">
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{ORDER_LABELS[s]}</option>)}
                </select>
                {nx && <button onClick={() => setOrderStatus(o.id, nx)} className={btnPrimary} aria-label={`${o.id} — keyingi holat: ${ORDER_LABELS[nx]}`}>{ORDER_LABELS[nx]} <ArrowRight className="size-4" /></button>}
                <Link to={`/admin/orders/${o.id}`} className={btnGhost}>Batafsil</Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export function AdminOrderDetail() {
  const { id } = useParams()
  const { orders, setOrderStatus } = useStore()
  useCatalog()
  const o = orders.find((x) => x.id === id)
  if (!o) return (
    <Card><p className="py-6 text-center">Buyurtma topilmadi.</p><Link to="/admin/orders" className={`${btnGhost} mx-auto`}>Buyurtmalarga qaytish</Link></Card>
  )
  return (
    <>
      <Link to="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"><ArrowLeft className="size-4" /> Buyurtmalar</Link>
      <PageHeader title={o.id} text={`${formatDateTime(o.createdAt)} · olib ketish (pickup)`}>
        <StatusChip status={o.status} labels={ORDER_LABELS} />
        <Link to={`/order/${o.id}`} className={btnGhost}><ExternalLink className="size-4" /> Mijoz sahifasi</Link>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold">Mahsulotlar</h2>
          <ul className="mt-2 divide-y divide-mist">
            {o.lines.map((l) => {
              const cur = l.kind === 'book' ? getBook(l.id) : getStationeryItem(l.id)
              return (
                <li key={l.kind + l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{l.title}</p>
                    <p className="text-sm text-ink-soft">{l.qty} × {formatPrice(l.price)} · {cur ? `hozirgi zaxira: ${cur.stock}` : 'katalogdan o‘chirilgan'}</p>
                  </div>
                  <b>{formatPrice(l.qty * l.price)}</b>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 flex justify-between border-t border-mist pt-3 text-lg font-extrabold"><span>Jami</span><span>{formatPrice(o.total)}</span></p>
          <p className="mt-3 rounded-xl bg-paper p-3 text-sm" data-testid="stock-note">
            {o.stockDeducted ? <>Zaxira kamaytirilgan: {o.stockDeducted.reduce((n, d) => n + d.qty, 0)} dona. Qayta kamaytirilmaydi.</> : 'Zaxira hali kamaytirilmagan — buyurtma “Yakunlandi” bo‘lganda bir marta kamayadi.'}
          </p>
        </Card>
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-bold">Mijoz</h2>
            <p className="mt-2 font-semibold">{o.name}</p>
            <a href={`tel:+998${phoneDigits(o.phone)}`} className="text-teal hover:underline">{formatPhone(o.phone)}</a>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Holatni o‘zgartirish</h2>
            <div className="mt-3 grid gap-2">
              {STATUS_ORDER.map((s) => (
                <button key={s} disabled={o.status === s} onClick={() => setOrderStatus(o.id, s)} className={`rounded-xl px-4 py-3 text-left text-sm font-bold ring-1 ring-mist disabled:bg-ink disabled:text-white`}>
                  {ORDER_LABELS[s]}{o.status === s && ' ✓'}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Tarix</h2>
            <ol className="mt-2 space-y-1.5 text-sm">
              {[...o.history].reverse().map((h, i) => <li key={i} className="flex justify-between gap-3"><span className="font-medium">{ORDER_LABELS[h.status]}</span><span className="text-ink-soft">{formatDateTime(h.at)}</span></li>)}
            </ol>
          </Card>
        </div>
      </div>
    </>
  )
}
