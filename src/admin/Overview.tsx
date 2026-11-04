import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, Boxes, Clock, Package, PackageCheck, Printer, Shapes, Sparkles, Wallet } from 'lucide-react'
import { useCatalog, isLowStock, effectiveStock } from '../lib/catalogStore'
import { useStore } from '../lib/store'
import { formatDateTime, formatPrice } from '../lib/format'
import { ORDER_LABELS, PRINT_LABELS, STATUS_ORDER } from '../lib/orders'
import { Card, PageHeader, btnPrimary, timeAgo } from './ui'

const DAY = 24 * 3600 * 1000
const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

function StatCard({ to, icon: Icon, label, value, sub, tone }: { to: string; icon: typeof Package; label: string; value: string | number; sub?: string; tone: string }) {
  return (
    <Link to={to} className="group rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`grid size-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" />
      </div>
      <p className="mt-3 whitespace-nowrap text-2xl font-extrabold sm:text-3xl" data-testid={`ov-${label}`}>
        {value}
      </p>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
    </Link>
  )
}

export function Overview() {
  const catalog = useCatalog()
  const { orders, printRequests, loadSampleData } = useStore()
  const [hover, setHover] = useState<number | null>(null)

  const books = catalog.books
  const stationery = catalog.stationery
  const all = [...books, ...stationery]
  const lowCount = all.filter(isLowStock).length
  const soldOut = all.filter((i) => effectiveStock(i) === 0 && i.available !== false).length
  const pending = orders.filter((o) => o.status !== 'completed')
  const pendingPrints = printRequests.filter((p) => p.status !== 'completed')
  const revenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0)

  const days = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const from = start.getTime() - (6 - i) * DAY
      const inDay = orders.filter((o) => o.createdAt >= from && o.createdAt < from + DAY)
      return { from, label: WEEKDAYS[new Date(from).getDay()], total: inDay.reduce((s, o) => s + o.total, 0), count: inDay.length }
    })
  }, [orders])
  const weekTotal = days.reduce((s, d) => s + d.total, 0)
  const weekCount = days.reduce((s, d) => s + d.count, 0)
  const max = Math.max(...days.map((d) => d.total), 1)

  const top = useMemo(() => {
    const m = new Map<string, { title: string; qty: number; sum: number }>()
    for (const o of orders)
      for (const l of o.lines) {
        const k = l.kind + l.id
        const cur = m.get(k) ?? { title: l.title, qty: 0, sum: 0 }
        cur.qty += l.qty
        cur.sum += l.qty * l.price
        m.set(k, cur)
      }
    return [...m.values()].sort((a, b) => b.qty - a.qty || b.sum - a.sum).slice(0, 5)
  }, [orders])

  const byStatus = STATUS_ORDER.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }))
  const maxStatus = Math.max(...byStatus.map((x) => x.n), 1)

  const activity = useMemo(() => {
    const ev: { at: number; text: string; to: string; kind: 'order' | 'print' | 'catalog' }[] = []
    for (const o of orders) for (const h of o.history) ev.push({ at: h.at, text: `${o.id} — ${ORDER_LABELS[h.status]} (${o.name})`, to: `/admin/orders/${o.id}`, kind: 'order' })
    for (const p of printRequests) for (const h of p.history) ev.push({ at: h.at, text: `${p.id} — ${PRINT_LABELS[h.status]} (${p.name})`, to: '/admin/print', kind: 'print' })
    for (const a of catalog.activity) ev.push({ at: a.at, text: a.text, to: '/admin/inventory', kind: 'catalog' })
    return ev.sort((a, b) => b.at - a.at).slice(0, 8)
  }, [orders, printRequests, catalog.activity])

  return (
    <>
      <PageHeader title="Umumiy ko‘rinish" text="Do‘kon holati bir qarashda. Hamma raqamlar shu brauzerdagi demo ma’lumotlardan olinadi." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard to="/admin/books" icon={BookOpen} label="Kitoblar" value={books.length} sub={`${books.filter((b) => b.available !== false).length} tasi sotuvda`} tone="bg-ink text-saffron" />
        <StatCard to="/admin/stationery" icon={Shapes} label="Kanselyariya" value={stationery.length} sub="mahsulot turi" tone="bg-teal text-white" />
        <StatCard to="/admin/orders" icon={Package} label="Buyurtmalar" value={orders.length} sub="jami" tone="bg-saffron text-ink" />
        <StatCard to="/admin/orders" icon={Clock} label="Kutilayotgan" value={pending.length} sub="yakunlanmagan buyurtma" tone="bg-anor text-white" />
        <StatCard to="/admin/print" icon={Printer} label="Chop etish" value={printRequests.length} sub={`${pendingPrints.length} tasi jarayonda`} tone="bg-mist text-ink" />
        <StatCard to="/admin/orders" icon={Wallet} label="Daromad" value={formatPrice(revenue).replace(" so'm", '')} sub="yakunlangan buyurtmalar, so‘m" tone="bg-teal-deep text-white" />
      </div>

      {(lowCount > 0 || soldOut > 0) && (
        <Link to="/admin/inventory" className="mt-4 flex items-center gap-3 rounded-2xl bg-saffron/30 p-4 text-sm font-semibold">
          <AlertTriangle className="size-5 shrink-0" />
          <span>
            Zaxira e’tibor talab qiladi: {lowCount} ta mahsulot kam qolgan, {soldOut} tasi tugagan.
          </span>
        </Link>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">So‘nggi 7 kunlik savdo</h2>
            <p className="text-sm text-ink-soft">
              {weekCount} ta buyurtma · <b className="text-ink">{formatPrice(weekTotal)}</b>
            </p>
          </div>
          {orders.length === 0 ? (
            <div className="mt-4 rounded-xl bg-paper p-6 text-center">
              <Sparkles className="mx-auto size-6 text-teal" />
              <p className="mt-2 font-semibold">Hali buyurtma yo‘q</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">Statistikani ko‘rish uchun namunaviy buyurtmalar va chop etish so‘rovlarini qo‘shing. Ular zaxirani o‘zgartirmaydi.</p>
              <button onClick={loadSampleData} className={`${btnPrimary} mt-4`}>
                Namuna ma’lumotlarni qo‘shish
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-5" role="img" aria-label={`So‘nggi 7 kunlik buyurtmalar summasi, jami ${formatPrice(weekTotal)}`}>
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-44 flex-col justify-between" aria-hidden>
                  {[1, 0.5, 0].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="w-12 text-right text-[10.5px] text-ink-soft">{f === 0 ? '0' : Math.round((max * f) / 1000) + ' ming'}</span>
                      <div className="h-px flex-1 bg-mist" />
                    </div>
                  ))}
                </div>
                <div className="relative ml-14 flex h-44 items-end gap-2 sm:gap-3">
                  {days.map((d, i) => (
                    <div key={d.from} className="relative flex h-full flex-1 items-end justify-center">
                      {hover === i && (
                        <div className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg" style={{ bottom: `${(d.total / max) * 100}%`, top: 'auto' }} role="tooltip">
                          {d.label}: {formatPrice(d.total)} · {d.count} ta
                        </div>
                      )}
                      <button
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        aria-label={`${d.label}: ${formatPrice(d.total)}, ${d.count} ta buyurtma`}
                        className="w-full max-w-9 rounded-t-[4px] bg-teal outline-none transition-opacity focus-visible:ring-4 focus-visible:ring-saffron/70"
                        style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 3 : 0)}%`, opacity: hover === null || hover === i ? 1 : 0.55 }}
                        data-testid="sales-bar"
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-14 mt-2 flex gap-2 sm:gap-3">
                  {days.map((d) => (
                    <span key={d.from} className="flex-1 text-center text-xs text-ink-soft">
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-semibold text-teal">Jadval ko‘rinishi</summary>
                <table className="mt-2 w-full text-left">
                  <thead className="text-ink-soft">
                    <tr>
                      <th className="py-1 font-medium">Kun</th>
                      <th className="py-1 font-medium">Buyurtmalar</th>
                      <th className="py-1 text-right font-medium">Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((d) => (
                      <tr key={d.from} className="border-t border-mist">
                        <td className="py-1.5">{new Date(d.from).toLocaleDateString('ru-RU')} ({d.label})</td>
                        <td className="py-1.5">{d.count}</td>
                        <td className="py-1.5 text-right font-semibold">{formatPrice(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Buyurtmalar holati</h2>
          <ul className="mt-3 space-y-3">
            {byStatus.map(({ s, n }) => (
              <li key={s}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{ORDER_LABELS[s]}</span>
                  <b>{n}</b>
                </div>
                <div className="mt-1 h-2 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-teal" style={{ width: `${(n / maxStatus) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-lg font-bold">Eng ko‘p sotilganlar</h2>
          {top.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Buyurtmalar paydo bo‘lgach, shu yerda ko‘rinadi.</p>
          ) : (
            <ol className="mt-2 divide-y divide-mist text-sm">
              {top.map((t) => (
                <li key={t.title} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate font-medium">{t.title}</span>
                  <span className="shrink-0 text-ink-soft">{t.qty} dona</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">So‘nggi harakatlar</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-teal hover:underline">
            Buyurtmalar
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Hozircha harakat yo‘q. Buyurtma bering yoki katalogda o‘zgartirish qiling — shu yerda ko‘rinadi.</p>
        ) : (
          <ul className="mt-2 divide-y divide-mist" data-testid="activity">
            {activity.map((a, i) => (
              <li key={i}>
                <Link to={a.to} className="flex items-center gap-3 py-2.5 hover:bg-paper">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${a.kind === 'order' ? 'bg-saffron/40' : a.kind === 'print' ? 'bg-teal/15' : 'bg-mist'}`}>
                    {a.kind === 'order' ? <PackageCheck className="size-4" /> : a.kind === 'print' ? <Printer className="size-4" /> : <Boxes className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.text}</span>
                  <span className="shrink-0 text-xs text-ink-soft" title={formatDateTime(a.at)}>
                    {timeAgo(a.at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
