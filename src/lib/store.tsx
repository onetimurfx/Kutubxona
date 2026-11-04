import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { stockOf } from './catalog'

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
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    save('kx:favorites', favorites)
  }, [favorites])
  useEffect(() => {
    save('kx:cart', cart)
  }, [cart])
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
      toast,
      showToast: setToast,
    }),
    [favorites, cart, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}
