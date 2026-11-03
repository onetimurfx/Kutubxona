import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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
        setCart((c) => {
          const line = c.find((l) => l.kind === kind && l.id === id)
          return line
            ? c.map((l) => (l === line ? { ...l, qty: l.qty + 1 } : l))
            : [...c, { kind, id, qty: 1 }]
        })
        setToast("Savatga qo'shildi")
      },
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
