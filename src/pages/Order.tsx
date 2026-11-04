import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, ShoppingBag, Zap } from 'lucide-react'
import { BookCover } from '../components/BookCover'
import { DemoNotice } from '../components/DemoNotice'
import { EmptyState } from '../components/EmptyState'
import { MiniProgress, StatusChip } from '../components/StatusChip'
import { TrackLookup } from '../components/TrackLookup'
import { resolveLine } from '../lib/catalog'
import { useCatalog } from '../lib/catalogStore'
import { StationeryThumb } from '../components/StationeryThumb'
import { formatDateTime, formatPhone, formatPrice, isValidPhone } from '../lib/format'
import { ORDER_LABELS } from '../lib/orders'
import { useStore } from '../lib/store'

const field =
  'mt-1.5 block w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-saffron/60'

export function Order() {
  const { cart, orders, placeOrder, profile } = useStore()
  useCatalog()
  const navigate = useNavigate()
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(formatPhone(profile.phone))
  const [tried, setTried] = useState(false)

  const lines = cart.map(resolveLine).filter((l): l is NonNullable<typeof l> => l !== null)
  const total = lines.reduce((s, l) => s + l.price * l.line.qty, 0)
  const count = lines.reduce((n, l) => n + l.line.qty, 0)
  const nameOk = name.trim().length >= 2
  const phoneOk = isValidPhone(phone)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!nameOk || !phoneOk) return
    const order = placeOrder(name, phone)
    if (order) navigate(`/order/${order.id}?new=1`, { replace: true })
  }

  const recent = orders.slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="px-4">
        <h1 className="text-3xl font-extrabold">Tez buyurtma</h1>
        <p className="mt-1 text-ink-soft">Ismingiz va telefon raqamingizni kiriting — buyurtmani do‘kondan olib ketasiz.</p>

        {!lines.length ? (
          <EmptyState icon={ShoppingBag} title="Buyurtma uchun savat bo‘sh" text="Avval kitob yoki kanselyariya mahsulotlarini savatga qo‘shing.">
            <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
              Kitoblarni ko‘rish
            </Link>
            <Link to="/stationery" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm">
              Kanselyariya
            </Link>
          </EmptyState>
        ) : (
          <div className="mt-5 md:grid md:grid-cols-[1fr_340px] md:items-start md:gap-8">
            <form onSubmit={submit} noValidate className="space-y-4" aria-label="Buyurtma shakli">
              <DemoNotice>Bu namuna: buyurtma haqiqiy do‘konga yuborilmaydi va to‘lov olinmaydi.</DemoNotice>

              <div>
                <label htmlFor="o-name" className="text-sm font-bold">
                  Ismingiz
                </label>
                <input
                  id="o-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Masalan, Timur"
                  aria-invalid={tried && !nameOk}
                  className={field}
                />
                {tried && !nameOk && (
                  <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
                    Ismingizni kiriting (kamida 2 ta harf).
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="o-phone" className="text-sm font-bold">
                  Telefon raqami
                </label>
                <input
                  id="o-phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+998 90 123 45 67"
                  aria-invalid={tried && !phoneOk}
                  className={field}
                />
                {tried && !phoneOk && (
                  <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
                    Raqamni to‘liq kiriting: +998 va 9 ta raqam.
                  </p>
                )}
              </div>

              <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <MapPin className="mt-0.5 size-5 shrink-0 text-teal" />
                <div className="text-sm">
                  <p className="font-bold">Do‘kondan olib ketish</p>
                  <p className="mt-0.5 text-ink-soft">Buyurtma tayyor bo‘lgach, do‘konda raqamingizni ayting. To‘lov do‘konda amalga oshiriladi.</p>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-[16px] font-bold text-white transition-transform active:scale-[0.98]"
              >
                <Zap className="size-5 text-saffron" /> Buyurtmani tasdiqlash
              </button>
            </form>

            <aside className="mt-6 rounded-2xl bg-white p-4 shadow-sm md:mt-0" aria-label="Buyurtma tarkibi">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">Buyurtma tarkibi</h2>
                <Link to="/cart" className="text-sm font-semibold text-teal hover:underline">
                  Savatni tahrirlash
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-mist">
                {lines.map((l) => {
                  return (
                    <li key={l.key} className="flex items-center gap-3 py-3">
                      <div className="w-10 shrink-0">
                        {l.book ? (
                          <BookCover title={l.book.title} author={l.book.author} cover={l.book.cover} />
                        ) : (
                          <StationeryThumb color={l.color!} glyph={l.glyph!} image={l.image} className="aspect-square rounded-lg" iconClass="size-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">{l.title}</p>
                        <p className="text-xs text-ink-soft">
                          {l.line.qty} × {formatPrice(l.price)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold">{formatPrice(l.price * l.line.qty)}</p>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-2 flex items-baseline justify-between border-t border-mist pt-3">
                <span className="text-sm text-ink-soft">{count} dona mahsulot · Jami</span>
                <span className="text-xl font-extrabold" data-testid="order-total">
                  {formatPrice(total)}
                </span>
              </div>
            </aside>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <TrackLookup />
          {recent.length > 0 && (
            <section aria-label="So‘nggi buyurtmalar">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-lg font-bold">So‘nggi buyurtmalar</h2>
                <Link to="/account?tab=orders" className="text-sm font-semibold text-teal hover:underline">
                  Hammasi
                </Link>
              </div>
              <ul className="space-y-3">
                {recent.map((o) => (
                  <li key={o.id}>
                    <Link to={`/order/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-extrabold">{o.id}</span>
                        <StatusChip status={o.status} labels={ORDER_LABELS} />
                      </div>
                      <p className="mt-1 flex items-center justify-between text-sm text-ink-soft">
                        <span>{formatDateTime(o.createdAt)}</span>
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          {formatPrice(o.total)} <ArrowRight className="size-4" />
                        </span>
                      </p>
                      <div className="mt-3">
                        <MiniProgress status={o.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
