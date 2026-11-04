import { useMemo, useState } from 'react'
import { ArrowRight, FileText, Search } from 'lucide-react'
import type { Status } from '../data/types'
import { useStore } from '../lib/store'
import { BINDINGS, PRINT_LABELS, SERVICES, STATUS_ORDER, nextStatus } from '../lib/orders'
import { norm } from '../lib/catalog'
import { formatDateTime, formatPhone, formatPrice, formatSize } from '../lib/format'
import { StatusChip } from '../components/StatusChip'
import { Card, PageHeader, STATUS_FILTERS, btnPrimary, chip } from './ui'

export function AdminPrint() {
  const { printRequests, setPrintStatus } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const list = useMemo(() => {
    const n = norm(q)
    return printRequests.filter((p) => (filter === 'all' || p.status === filter) && (!n || norm(`${p.id} ${p.name}`).includes(n)))
  }, [printRequests, q, filter])

  return (
    <>
      <PageHeader title="Chop etish so‘rovlari" text="Mijoz ma’lumotlari, xizmat tafsilotlari va fayl nomlari. Fayllar saqlanmaydi — faqat nomi va hajmi." />
      <div className="relative mb-3 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="So‘rovni qidirish" placeholder="So‘rov raqami yoki mijoz ismi" className="w-full rounded-full bg-white py-3 pl-11 pr-4 shadow-sm outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60" />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Holat bo‘yicha filtr">
        {STATUS_FILTERS.map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} aria-pressed={filter === f.v} className={chip(filter === f.v)}>
            {f.label} <span className="opacity-60">{f.v === 'all' ? printRequests.length : printRequests.filter((p) => p.status === f.v).length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Card><p className="py-6 text-center text-ink-soft">{printRequests.length === 0 ? 'Hali chop etish so‘rovi yo‘q.' : 'Hech narsa topilmadi.'}</p></Card>
      ) : (
        <ul className="space-y-4" data-testid="print-rows">
          {list.map((p) => {
            const nx = nextStatus(p.status)
            return (
              <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5" data-testid="print-row">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{p.id} <span className="font-medium text-ink-soft">· {SERVICES[p.service].label}</span></p>
                    <p className="text-sm">{p.name} · {formatPhone(p.phone)}</p>
                    <p className="text-xs text-ink-soft">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <div className="text-right"><StatusChip status={p.status} labels={PRINT_LABELS} /><p className="mt-1 font-bold">{formatPrice(p.estimate)}</p></div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-5">
                  {[['Sahifalar', p.pages], ['Nusxalar', p.copies], ['Qog‘oz', p.paper], ['Rang', p.color === 'color' ? 'Rangli' : 'Oq-qora'], ['Muqova', BINDINGS[p.binding].label]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs text-ink-soft">{k}</dt><dd className="font-semibold">{v}</dd></div>
                  ))}
                </dl>
                {p.files.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{p.files.map((f, i) => <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-medium"><FileText className="size-3.5" />{f.name} · {formatSize(f.size)}</li>)}</ul>}
                {p.notes && <p className="mt-3 rounded-xl bg-paper p-3 text-sm">“{p.notes}”</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select aria-label={`${p.id} — holatni o‘zgartirish`} value={p.status} onChange={(e) => setPrintStatus(p.id, e.target.value as Status)} className="rounded-full bg-paper px-3 py-2 text-sm font-semibold outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60">
                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{PRINT_LABELS[s]}</option>)}
                  </select>
                  {nx && <button onClick={() => setPrintStatus(p.id, nx)} className={btnPrimary} aria-label={`${p.id} — keyingi holat: ${PRINT_LABELS[nx]}`}>{PRINT_LABELS[nx]} <ArrowRight className="size-4" /></button>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
