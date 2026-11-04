import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Boxes, Database, LayoutDashboard, LogOut, Menu, Package, Printer, Shapes, ShieldAlert, Store, X, BookOpen } from 'lucide-react'
import { useStore } from '../lib/store'
import { btnPrimary } from './ui'

const GATE_KEY = 'kx:admin-ok'
const DEMO_CODE = '1234'

const readGate = () => {
  try {
    return sessionStorage.getItem(GATE_KEY) === '1'
  } catch {
    return false
  }
}

function Gate({ onEnter }: { onEnter: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim() === DEMO_CODE) {
      try {
        sessionStorage.setItem(GATE_KEY, '1')
      } catch {
        /* ignore */
      }
      onEnter()
    } else setError(true)
  }
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <motion.form initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" aria-label="Demo admin kirish">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-xl font-extrabold tracking-[0.1em]">KUTUBXONA</span>
          <span className="rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold">DEMO ADMIN</span>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">Boshqaruv paneliga kirish</h1>
        <div role="note" className="mt-4 flex gap-3 rounded-2xl bg-saffron/20 p-3.5 text-sm leading-snug">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <p>
            <b>Bu himoya emas.</b> Demo kod brauzer kodida ochiq turadi, shuning uchun u hech kimni to‘sa olmaydi — faqat boshqaruv sahifalarini mijoz sahifalaridan ajratadi. Haqiqiy do‘konda kirish serverda tekshiriladi.
          </p>
        </div>
        <label htmlFor="admin-code" className="mt-5 block text-sm font-bold">
          Demo kod
        </label>
        <input
          id="admin-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={error}
          placeholder="••••"
          className="mt-1.5 block w-full rounded-xl bg-paper px-4 py-3.5 text-lg tracking-widest outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60"
        />
        <p className="mt-1.5 text-sm text-ink-soft">
          Demo kod: <b data-testid="demo-code">{DEMO_CODE}</b>
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-anor">
            Kod noto‘g‘ri. Yuqorida ko‘rsatilgan demo kodni kiriting.
          </p>
        )}
        <button type="submit" className={`${btnPrimary} mt-5 w-full py-3.5 text-base`}>
          Kirish
        </button>
        <Link to="/" className="mt-3 block text-center text-sm font-semibold text-teal hover:underline">
          Do‘konga qaytish
        </Link>
      </motion.form>
    </div>
  )
}

const NAV = [
  { to: '/admin', label: 'Umumiy ko‘rinish', icon: LayoutDashboard, end: true },
  { to: '/admin/books', label: 'Kitoblar', icon: BookOpen },
  { to: '/admin/stationery', label: 'Kanselyariya', icon: Shapes },
  { to: '/admin/orders', label: 'Buyurtmalar', icon: Package, badge: true },
  { to: '/admin/print', label: 'Chop etish', icon: Printer },
  { to: '/admin/inventory', label: 'Zaxira', icon: Boxes },
  { to: '/admin/data', label: 'Ma’lumotlar', icon: Database },
]

function SidebarContent({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const { orders } = useStore()
  const pending = orders.filter((o) => o.status !== 'completed').length
  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="px-5 pb-4 pt-6">
        <div className="font-display text-xl font-extrabold tracking-[0.1em]">KUTUBXONA</div>
        <span className="mt-1.5 inline-block rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold text-ink">DEMO ADMIN</span>
      </div>
      <nav aria-label="Admin navigatsiya" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors ${isActive ? 'bg-saffron text-ink' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Icon className="size-5" />
            <span className="flex-1">{label}</span>
            {badge && pending > 0 && (
              <span className="grid min-w-[22px] place-items-center rounded-full bg-anor px-1.5 text-xs font-bold leading-[22px] text-white" aria-label={`${pending} ta kutilayotgan`}>
                {pending}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold text-white/80 hover:bg-white/10">
          <Store className="size-5" /> Do‘konga qaytish
        </Link>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[15px] font-semibold text-white/80 hover:bg-white/10">
          <LogOut className="size-5" /> Chiqish
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const [ok, setOk] = useState(readGate)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  const logout = () => {
    try {
      sessionStorage.removeItem(GATE_KEY)
    } catch {
      /* ignore */
    }
    setOk(false)
  }

  if (!ok) return <Gate onEnter={() => setOk(true)} />

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent onLogout={logout} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 bg-ink px-4 py-3 text-white lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menyuni ochish" aria-expanded={open} className="grid size-10 place-items-center rounded-full bg-white/10">
          <Menu className="size-5" />
        </button>
        <span className="font-display font-extrabold tracking-[0.1em]">KUTUBXONA</span>
        <span className="rounded-full bg-saffron px-2 py-0.5 text-[11px] font-bold text-ink">DEMO ADMIN</span>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.22 }} className="absolute inset-y-0 left-0 w-72 shadow-2xl">
              <button onClick={() => setOpen(false)} aria-label="Menyuni yopish" className="absolute right-3 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/10 text-white">
                <X className="size-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} onLogout={logout} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div role="note" className="bg-saffron/30 px-4 py-2 text-center text-xs font-semibold sm:text-sm">
        DEMO: bu namunaviy boshqaruv paneli. O‘zgarishlar faqat shu brauzerda saqlanadi va mijoz sahifalarida darhol ko‘rinadi.
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <Outlet />
      </div>
    </div>
  )
}
