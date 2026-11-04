import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { resolveLine, stockOf } from './catalog'
import type { Order, PrintRequest, Profile, Status } from '../data/types'
import { makeNumber, nextStatus } from './orders'

export interface CartLine {
  kind: 'book' | 'stationery'
  id: string
  qty: number
}

interface StoreValue {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  cart: CartLine[]
  addToCart: (kind: CartLine['kind'], id: string) => void
  addBooks: (ids: string[]) => number
  setQty: (kind: CartLine['kind'], id: string, qty: number) => void
  removeLine: (kind: CartLine['kind'], id: string) => void
  clearCart: () => void
  qtyInCart: (kind: CartLine['kind'], id: string) => number
  cartCount: number
  orders: Order[]
  placeOrder: (name: string, phone: string) => Order | null
  advanceOrder: (id: string) => void
  printRequests: PrintRequest[]
  addPrintRequest: (r: Omit<PrintRequest, 'id' | 'createdAt' | 'status' | 'history'>) => PrintRequest
  advancePrint: (id: string) => void
  profile: Profile
  saveProfile: (p: Profile) => void
  resetDemo: () => void
  toast: string | null
  showToast: (msg: string) => void
}

const Ctx = createContext<StoreValue | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be unavailable (private mode) — the demo still works in memory */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => load('kx:favorites', []))
  const [cart, setCart] = useState<CartLine[]>(() => load('kx:cart', []))
  const [orders, setOrders] = useState<Order[]>(() => load('kx:orders', []))
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>(() => load('kx:prints', []))
  const [profile, setProfile] = useState<Profile>(() => load('kx:profile', { name: '', phone: '' }))
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    save('kx:favorites', favorites)
  }, [favorites])
  useEffect(() => {
    save('kx:cart', cart)
  }, [cart])
  useEffect(() => {
    save('kx:orders', orders)
  }, [orders])
  useEffect(() => {
    save('kx:prints', printRequests)
  }, [printRequests])
  useEffect(() => {
    save('kx:profile', profile)
  }, [profile])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  const value = useMemo<StoreValue>(
    () => ({
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id) => {
        const has = favorites.includes(id)
        setFavorites(has ? favorites.filter((x) => x !== id) : [...favorites, id])
        setToast(has ? 'Sevimlilardan olib tashlandi' : "Sevimlilarga qo'shildi")
      },
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      addToCart: (kind, id) => {
        const stock = stockOf(kind, id)
        const cur = cart.find((l) => l.kind === kind && l.id === id)?.qty ?? 0
        if (stock <= 0) return setToast('Hozircha sotuvda yo‘q')
        if (cur >= stock) return setToast(`Omborda faqat ${stock} dona bor`)
        setCart((c) => {
          const line = c.find((l) => l.kind === kind && l.id === id)
          if (!line) return [...c, { kind, id, qty: 1 }]
          return c.map((l) => (l === line ? { ...l, qty: Math.min(stock, l.qty + 1) } : l))
        })
        setToast("Savatga qo'shildi")
      },
      addBooks: (ids) => {
        const next = cart.map((l) => ({ ...l }))
        let added = 0
        for (const id of ids) {
          const stock = stockOf('book', id)
          const line = next.find((l) => l.kind === 'book' && l.id === id)
          if (stock <= 0 || (line && line.qty >= stock)) continue
          if (line) line.qty += 1
          else next.push({ kind: 'book', id, qty: 1 })
          added++
        }
        setCart(next.map((l) => ({ ...l })))
        setToast(added ? `${added} ta kitob savatga qo'shildi` : 'Qo‘shish uchun mavjud kitob yo‘q')
        return added
      },
      setQty: (kind, id, qty) => {
        const stock = stockOf(kind, id)
        if (qty > stock) setToast(`Omborda faqat ${stock} dona bor`)
        setCart((c) =>
          qty <= 0
            ? c.filter((l) => !(l.kind === kind && l.id === id))
            : c.map((l) => (l.kind === kind && l.id === id ? { ...l, qty: Math.min(qty, stock) } : l)),
        )
      },
      removeLine: (kind, id) => {
        setCart((c) => c.filter((l) => !(l.kind === kind && l.id === id)))
        setToast('Savatdan olib tashlandi')
      },
      clearCart: () => {
        setCart([])
        setToast('Savat tozalandi')
      },
      qtyInCart: (kind, id) => cart.find((l) => l.kind === kind && l.id === id)?.qty ?? 0,
      orders,
      placeOrder: (name, phone) => {
        const lines = cart.map(resolveLine).filter((l): l is NonNullable<typeof l> => l !== null)
        if (!lines.length) return null
        const now = Date.now()
        const id = makeNumber('KX', orders.map((o) => o.id))
        const order: Order = {
          id,
          createdAt: now,
          name: name.trim(),
          phone,
          lines: lines.map((l) => ({
            kind: l.line.kind,
            id: l.line.id,
            title: l.title,
            subtitle: l.subtitle,
            price: l.price,
            qty: l.line.qty,
          })),
          total: lines.reduce((sum, l) => sum + l.price * l.line.qty, 0),
          status: 'received',
          history: [{ status: 'received', at: now }],
        }
        setOrders([order, ...orders])
        setCart([])
        setProfile({ name: profile.name || order.name, phone: profile.phone || phone })
        return order
      },
      advanceOrder: (id) => {
        setOrders((list) =>
          list.map((o) => {
            const n = o.id === id ? nextStatus(o.status) : null
            return n ? { ...o, status: n, history: [...o.history, { status: n as Status, at: Date.now() }] } : o
          }),
        )
      },
      printRequests,
      addPrintRequest: (r) => {
        const now = Date.now()
        const req: PrintRequest = {
          ...r,
          id: makeNumber('CH', printRequests.map((p) => p.id)),
          createdAt: now,
          status: 'received',
          history: [{ status: 'received', at: now }],
        }
        setPrintRequests([req, ...printRequests])
        setProfile({ name: profile.name || r.name, phone: profile.phone || r.phone })
        return req
      },
      advancePrint: (id) => {
        setPrintRequests((list) =>
          list.map((p) => {
            const n = p.id === id ? nextStatus(p.status) : null
            return n ? { ...p, status: n, history: [...p.history, { status: n as Status, at: Date.now() }] } : p
          }),
        )
      },
      profile,
      saveProfile: (p) => {
        setProfile(p)
        setToast('Profil saqlandi')
      },
      resetDemo: () => {
        setFavorites([])
        setCart([])
        setOrders([])
        setPrintRequests([])
        setProfile({ name: '', phone: '' })
        setToast('Demo ma’lumotlari tiklandi')
      },
      toast,
      showToast: setToast,
    }),
    [favorites, cart, orders, printRequests, profile, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}
