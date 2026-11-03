import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ShoppingBag, Zap, User } from 'lucide-react'
import { useStore } from '../lib/store'

const ITEMS = [
  { to: '/', label: 'Bosh sahifa', icon: Home, end: true },
  { to: '/search', label: 'Qidiruv', icon: Search },
  { to: '/cart', label: 'Savat', icon: ShoppingBag },
  { to: '/order', label: 'Tez buyurtma', icon: Zap },
  { to: '/account', label: 'Hisob', icon: User },
]

export function BottomNav() {
  const { cartCount } = useStore()
  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <ul className="flex w-full max-w-md items-stretch justify-between rounded-[26px] bg-ink p-1.5 shadow-[0_18px_40px_-12px_rgba(22,34,79,0.7)]">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="relative block rounded-[20px] py-2 text-center">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-[20px] bg-saffron"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={`relative flex flex-col items-center gap-0.5 ${isActive ? 'text-ink' : 'text-white/75'}`}>
                    <span className="relative">
                      <Icon className="size-[22px]" strokeWidth={isActive ? 2.4 : 1.9} />
                      {to === '/cart' && cartCount > 0 && (
                        <motion.span
                          key={cartCount}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-2.5 -top-2 grid min-w-[18px] place-items-center rounded-full bg-anor px-1 text-[11px] font-bold leading-[18px] text-white"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </span>
                    <span className="text-[10.5px] font-semibold leading-tight">{label}</span>
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
