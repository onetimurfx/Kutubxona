import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Package, Printer, RotateCcw, Save } from 'lucide-react'
import { BOOKS } from '../data/books'
import { BookCard } from '../components/BookCard'
import { DemoNotice } from '../components/DemoNotice'
import { MiniProgress, StatusChip } from '../components/StatusChip'
import { formatDateTime, formatPhone, formatPrice, isValidPhone } from '../lib/format'
import { BINDINGS, ORDER_LABELS, PRINT_LABELS, SERVICES } from '../lib/orders'
import { useStore } from '../lib/store'

type Tab = 'orders' | 'prints' | 'favorites'
const TABS: { id: Tab; label: string }[] = [
  { id: 'orders', label: 'Buyurtmalar' },
  { id: 'prints', label: 'Chop etish' },
  { id: 'favorites', label: 'Sevimlilar' },
]

const field =
  'mt-1.5 block w-full rounded-2xl bg-paper px-4 py-3.5 text-[16px] outline-none focus-visible:ring-4 focus-visible:ring-saffron/60'

export function Account() {
  const { profile, saveProfile, orders, printRequests, favorites, resetDemo } = useStore()
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.some((t) => t.id === params.get('tab')) ? (params.get('tab') as Tab) : 'orders'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(formatPhone(profile.phone))
  const [tried, setTried] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const nameOk = name.trim().length >= 2
  const phoneOk = isValidPhone(phone)
  const favBooks = favorites.map((id) => BOOKS.find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => Boolean(b))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (nameOk && phoneOk) {
      saveProfile({ name: name.trim(), phone })
      setTried(false)
    }
  }

  const doReset = () => {
    resetDemo()
    setName('')
    setPhone('')
    setConfirmReset(false)
  }

  const stats: { id: Tab; label: string; value: number; icon: typeof Package }[] = [
    { id: 'orders', label: 'Buyurtmalar', value: orders.length, icon: Package },
    { id: 'prints', label: 'Chop etish', value: printRequests.length, icon: Printer },
    { id: 'favorites', label: 'Sevimlilar', value: favBooks.length, icon: Heart },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-saffron font-display text-2xl font-extrabold" aria-hidden>
          {(profile.name.trim()[0] ?? 'M').toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold">{profile.name || 'Mehmon'}</h1>
          <p className="truncate text-ink-soft">{profile.phone ? formatPhone(profile.phone) : 'Profil hali to‘ldirilmagan'}</p>
        </div>
      </div>

      <DemoNotice className="mt-4">Bu namunaviy hisob: parol yoki haqiqiy kirish yo‘q. Ma’lumotlar faqat shu brauzerda saqlanadi.</DemoNotice>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map(({ id, label, value, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-2xl p-4 text-left shadow-sm transition-colors ${tab === id ? 'bg-ink text-white' : 'bg-white'}`}
          >
            <Icon className={`size-5 ${tab === id ? 'text-saffron' : 'text-teal'}`} />
            <p className="mt-2 text-2xl font-extrabold" data-testid={`stat-${id}`}>
              {value}
            </p>
            <p className={`text-xs font-medium ${tab === id ? 'text-white/70' : 'text-ink-soft'}`}>{label}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="mt-5 rounded-2xl bg-white p-5 shadow-sm" aria-label="Profil">
        <h2 className="text-lg font-bold">Profil</h2>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="a-name" className="text-sm font-bold">
              Ismingiz
            </label>
            <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} aria-invalid={tried && !nameOk} />
            {tried && !nameOk && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
                Ismingizni kiriting (kamida 2 ta harf).
              </p>
            )}
          </div>
          <div>
            <label htmlFor="a-phone" className="text-sm font-bold">
              Telefon raqami
            </label>
            <input id="a-phone" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" className={field} aria-invalid={tried && !phoneOk} />
            {tried && !phoneOk && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
                Raqamni to‘liq kiriting: +998 va 9 ta raqam.
              </p>
            )}
          </div>
        </div>
        <button type="submit" className="mt-4 flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white transition-transform active:scale-[0.98]">
          <Save className="size-4" /> Profilni saqlash
        </button>
      </form>

      <div role="tablist" aria-label="Hisob bo‘limlari" className="mt-7 flex gap-1 border-b border-mist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="tab-panel"
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-[15px] font-bold ${tab === t.id ? 'text-ink' : 'text-ink-soft'}`}
          >
            {t.label}
            {tab === t.id && <motion.span layoutId="acc-tab" className="absolute inset-x-2 bottom-[-1px] h-[3px] rounded bg-teal" />}
          </button>
        ))}
      </div>

      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5">
        {tab === 'orders' &&
          (orders.length === 0 ? (
            <Empty text="Hali buyurtma yo‘q. Savatni to‘ldirib, Tez buyurtma bo‘limidan buyurtma bering.">
              <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
                Kitoblarni ko‘rish
              </Link>
            </Empty>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/order/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-sm" data-testid="account-order">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-extrabold">{o.id}</span>
                      <StatusChip status={o.status} labels={ORDER_LABELS} />
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {formatDateTime(o.createdAt)} · {o.lines.reduce((n, l) => n + l.qty, 0)} dona
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm">{o.lines.map((l) => l.title).join(', ')}</p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <MiniProgress status={o.status} />
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-bold">
                        {formatPrice(o.total)} <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'prints' &&
          (printRequests.length === 0 ? (
            <Empty text="Hali chop etish so‘rovi yo‘q.">
              <Link to="/print" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
                Chop etish so‘rovi
              </Link>
            </Empty>
          ) : (
            <ul className="space-y-3">
              {printRequests.map((r) => (
                <li key={r.id}>
                  <Link to="/print" className="block rounded-2xl bg-white p-4 shadow-sm" data-testid="account-print">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-extrabold">{r.id}</span>
                      <StatusChip status={r.status} labels={PRINT_LABELS} />
                    </div>
                    <p className="mt-1 text-sm font-semibold">{SERVICES[r.service].label}</p>
                    <p className="text-sm text-ink-soft">
                      {r.service !== 'binding' && `${r.pages} bet × `}
                      {r.copies} nusxa{r.binding !== 'none' && ` · ${BINDINGS[r.binding].label.toLowerCase()}`} · {formatDateTime(r.createdAt)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <MiniProgress status={r.status} />
                      </div>
                      <b className="shrink-0 text-sm">{formatPrice(r.estimate)}</b>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === 'favorites' &&
          (favBooks.length === 0 ? (
            <Empty text="Sevimli kitoblar yo‘q. Kitob ustidagi yurakcha tugmasini bosing.">
              <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
                Kitoblarni ko‘rish
              </Link>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                {favBooks.slice(0, 8).map((b) => (
                  <BookCard key={b.id} book={b} width="100%" />
                ))}
              </div>
              <Link to="/favorites" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold shadow-sm">
                Barcha sevimlilar ({favBooks.length}) <ArrowRight className="size-4" />
              </Link>
            </>
          ))}
      </div>

      <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm" aria-label="Demo ma’lumotlari">
        <h2 className="text-lg font-bold">Demo ma’lumotlari</h2>
        <p className="mt-1 text-sm text-ink-soft">Savat, sevimlilar, buyurtmalar, chop etish so‘rovlari va profil shu brauzerda saqlanadi. Hammasini boshidan boshlash mumkin.</p>
        {confirmReset ? (
          <div className="mt-4 rounded-xl bg-anor/10 p-4" role="alertdialog" aria-label="Tasdiqlash">
            <p className="font-semibold">Hamma demo ma’lumotlari o‘chiriladi. Davom etasizmi?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={doReset} className="rounded-full bg-anor px-5 py-2.5 font-semibold text-white">
                Ha, tiklash
              </button>
              <button onClick={() => setConfirmReset(false)} className="rounded-full bg-white px-5 py-2.5 font-semibold shadow-sm">
                Bekor qilish
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="mt-4 flex items-center gap-2 rounded-full bg-paper px-5 py-3 font-semibold text-anor">
            <RotateCcw className="size-4" /> Demo ma’lumotlarini tiklash
          </button>
        )}
      </section>
    </div>
  )
}

function Empty({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className="text-ink-soft">{text}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}
