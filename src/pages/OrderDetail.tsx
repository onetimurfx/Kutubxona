import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Copy, FastForward, MapPin, PackageSearch } from 'lucide-react'
import { DemoNotice } from '../components/DemoNotice'
import { EmptyState } from '../components/EmptyState'
import { StatusTracker } from '../components/StatusTracker'
import { TrackLookup } from '../components/TrackLookup'
import { formatDateTime, formatPrice } from '../lib/format'
import { ORDER_LABELS, nextStatus } from '../lib/orders'
import { useStore } from '../lib/store'
import { getBook, getStationeryItem, useCatalog } from '../lib/catalogStore'

const MESSAGES = {
  received: 'Buyurtmangiz qabul qilindi. Tez orada tayyorlashni boshlaymiz.',
  preparing: 'Buyurtmangiz yig‘ilmoqda.',
  ready: 'Buyurtmangiz tayyor! Do‘konga kelib, buyurtma raqamini ayting.',
  completed: 'Buyurtma topshirildi. Xaridingiz uchun rahmat!',
} as const

export function OrderDetail() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { orders, advanceOrder, showToast } = useStore()
  useCatalog()
  const order = orders.find((o) => o.id === id.toUpperCase())
  const isNew = params.get('new') === '1'

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 pb-36 pt-12">
        <EmptyState icon={PackageSearch} title="Buyurtma topilmadi" text="Bunday raqamli buyurtma bu qurilmada yo‘q. Demo buyurtmalar faqat shu brauzerda saqlanadi.">
          <Link to="/order" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
            Tez buyurtma
          </Link>
        </EmptyState>
        <TrackLookup />
      </div>
    )
  }

  const next = nextStatus(order.status)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.id)
      showToast('Raqam nusxalandi')
    } catch {
      showToast(`Buyurtma raqami: ${order.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      {isNew ? (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="mx-auto grid size-20 place-items-center rounded-full bg-teal text-white"
          >
            <Check className="size-10" strokeWidth={3} />
          </motion.div>
          <h1 className="mt-5 text-3xl font-extrabold">Buyurtma qabul qilindi</h1>
          <p className="mt-1 text-ink-soft">Buyurtmangizni do‘kondan olib ketishingiz mumkin.</p>
        </div>
      ) : (
        <h1 className="text-3xl font-extrabold">Buyurtma holati</h1>
      )}

      <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
        <p className="text-sm text-white/70">Buyurtma raqami</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="font-display text-3xl font-extrabold tracking-wider" data-testid="order-number">
            {order.id}
          </span>
          <button onClick={copy} aria-label="Raqamni nusxalash" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
            <Copy className="size-4" /> Nusxalash
          </button>
        </div>
        <p className="mt-2 text-sm text-white/70">{formatDateTime(order.createdAt)}</p>
      </div>

      <section className="mt-5 rounded-2xl bg-white px-3 py-5 shadow-sm sm:px-5" aria-label="Holat">
        <StatusTracker status={order.status} labels={ORDER_LABELS} history={order.history} />
        <p className="mt-5 text-center font-semibold" data-testid="order-status-text" aria-live="polite">
          {ORDER_LABELS[order.status]}
        </p>
        <p className="mt-1 text-center text-sm text-ink-soft">{MESSAGES[order.status]}</p>
      </section>

      <DemoNotice className="mt-4">
        Haqiqiy do‘kon bu yerda holatni o‘zgartiradi. Namuna uchun holatni o‘zingiz keyingi bosqichga o‘tkazishingiz mumkin.
        {next ? (
          <button
            onClick={() => advanceOrder(order.id)}
            className="mt-3 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-white"
          >
            <FastForward className="size-4" /> Keyingi holatga: {ORDER_LABELS[next]}
          </button>
        ) : (
          <span className="mt-2 block font-semibold">Buyurtma yakunlandi — oxirgi bosqich.</span>
        )}
      </DemoNotice>

      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm" aria-label="Buyurtma tarkibi">
        <h2 className="text-lg font-bold">Buyurtma tarkibi</h2>
        <ul className="mt-2 divide-y divide-mist">
          {order.lines.map((l) => (
            <li key={l.kind + l.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                {(l.kind === 'book' ? getBook(l.id) : getStationeryItem(l.id)) ? (
                  <Link to={l.kind === 'book' ? `/book/${l.id}` : `/stationery/${l.id}`} className="line-clamp-2 font-semibold leading-snug hover:underline">
                    {l.title}
                  </Link>
                ) : (
                  <span className="line-clamp-2 font-semibold leading-snug">{l.title}</span>
                )}
                <p className="text-sm text-ink-soft">
                  {l.subtitle} · {l.qty} × {formatPrice(l.price)}
                </p>
              </div>
              <p className="shrink-0 font-bold">{formatPrice(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-baseline justify-between border-t border-mist pt-3">
          <span className="font-semibold">Jami (to‘lov do‘konda)</span>
          <span className="text-2xl font-extrabold">{formatPrice(order.total)}</span>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-ink-soft">Buyurtmachi</p>
          <p className="font-bold">{order.name}</p>
          <p className="text-sm">{order.phone}</p>
        </div>
        <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <MapPin className="mt-0.5 size-5 shrink-0 text-teal" />
          <div>
            <p className="font-bold">Do‘kondan olib ketish</p>
            <p className="text-sm text-ink-soft">Onlayn to‘lov yo‘q. Do‘konda buyurtma raqamini ayting.</p>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
          Xaridni davom ettirish
        </Link>
        <Link to="/account?tab=orders" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm">
          Barcha buyurtmalarim
        </Link>
      </div>
    </div>
  )
}
