import { useSyncExternalStore } from 'react'
import { BOOKS as SEED_BOOKS } from '../data/books'
import { STATIONERY as SEED_STATIONERY } from '../data/stationery'
import type { ActivityItem, Book, StationeryItem } from '../data/types'

/**
 * The shop catalog (books + stationery) lives here, in localStorage, so that the admin panel and
 * the customer pages always read the same data. Components subscribe with useCatalog().
 */
const KEY = 'kx:catalog'
export const LOW_STOCK = 10

export interface CatalogState {
  books: Book[]
  stationery: StationeryItem[]
  activity: ActivityItem[]
}

type Kind = 'book' | 'stationery'
type Sellable = { stock: number; available?: boolean }

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
const seed = (): CatalogState => ({ books: clone(SEED_BOOKS), stationery: clone(SEED_STATIONERY), activity: [] })

function read(): CatalogState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (Array.isArray(p?.books) && Array.isArray(p?.stationery)) {
        return { books: p.books, stationery: p.stationery, activity: Array.isArray(p.activity) ? p.activity : [] }
      }
    }
  } catch {
    /* fall through to seed data */
  }
  return seed()
}

let state: CatalogState = read()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** returns false only when the browser refuses to store the data (quota exceeded, e.g. too many photos) */
function commit(next: CatalogState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)
    if (quota) return false
    /* storage unavailable (private mode): keep working in memory */
  }
  state = next
  emit()
  return true
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read()
      emit()
    }
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useCatalog = () => useSyncExternalStore(subscribe, () => state)
export const getBooks = () => state.books
export const getStationery = () => state.stationery
export const getBook = (id: string) => state.books.find((b) => b.id === id)
export const getStationeryItem = (id: string) => state.stationery.find((s) => s.id === id)

/** what a customer can actually buy */
export const effectiveStock = (i: Sellable) => (i.available === false ? 0 : Math.max(0, i.stock))
export const isSellable = (i: Sellable) => effectiveStock(i) > 0
export const isLowStock = (i: Sellable) => i.available !== false && i.stock > 0 && i.stock <= LOW_STOCK

const withLog = (s: CatalogState, text: string): CatalogState => ({ ...s, activity: [{ at: Date.now(), text }, ...s.activity].slice(0, 40) })

/* ---------------- books ---------------- */
export function saveBook(book: Book): { ok: boolean; isNew: boolean } {
  const isNew = !state.books.some((b) => b.id === book.id)
  const books = isNew ? [book, ...state.books] : state.books.map((b) => (b.id === book.id ? book : b))
  const ok = commit(withLog({ ...state, books }, `${isNew ? 'Kitob qo‘shildi' : 'Kitob tahrirlandi'}: ${book.title}`))
  return { ok, isNew }
}

export function removeBook(id: string) {
  const b = getBook(id)
  if (b) commit(withLog({ ...state, books: state.books.filter((x) => x.id !== id) }, `Kitob o‘chirildi: ${b.title}`))
}

/* ---------------- stationery ---------------- */
export function saveStationery(item: StationeryItem): { ok: boolean; isNew: boolean } {
  const isNew = !state.stationery.some((s) => s.id === item.id)
  const stationery = isNew ? [item, ...state.stationery] : state.stationery.map((s) => (s.id === item.id ? item : s))
  const ok = commit(withLog({ ...state, stationery }, `${isNew ? 'Mahsulot qo‘shildi' : 'Mahsulot tahrirlandi'}: ${item.name}`))
  return { ok, isNew }
}

export function removeStationery(id: string) {
  const s = getStationeryItem(id)
  if (s) commit(withLog({ ...state, stationery: state.stationery.filter((x) => x.id !== id) }, `Mahsulot o‘chirildi: ${s.name}`))
}

/* ---------------- stock & availability ---------------- */
const nameOf = (kind: Kind, id: string) => (kind === 'book' ? getBook(id)?.title : getStationeryItem(id)?.name) ?? id

function mapItem(kind: Kind, id: string, fn: (i: { stock: number; available?: boolean }) => object): CatalogState {
  return kind === 'book'
    ? { ...state, books: state.books.map((b) => (b.id === id ? { ...b, ...fn(b) } : b)) }
    : { ...state, stationery: state.stationery.map((s) => (s.id === id ? { ...s, ...fn(s) } : s)) }
}

export function setStock(kind: Kind, id: string, qty: number) {
  const q = Math.max(0, Math.min(100000, Math.round(qty)))
  const before = (kind === 'book' ? getBook(id)?.stock : getStationeryItem(id)?.stock) ?? 0
  if (before === q) return
  commit(withLog(mapItem(kind, id, () => ({ stock: q })), `Zaxira o‘zgardi: ${nameOf(kind, id)} (${before} → ${q})`))
}

export function setAvailable(kind: Kind, id: string, available: boolean) {
  commit(withLog(mapItem(kind, id, () => ({ available })), `${available ? 'Sotuvga qo‘yildi' : 'Sotuvdan olindi'}: ${nameOf(kind, id)}`))
}

interface StockLine {
  kind: Kind
  id: string
  qty: number
}

/** Takes the ordered quantities out of stock. Never goes below 0; returns what was really deducted. */
export function deductStock(lines: StockLine[]): StockLine[] {
  const deducted: StockLine[] = []
  let next = state
  for (const l of lines) {
    const cur = (l.kind === 'book' ? next.books.find((b) => b.id === l.id)?.stock : next.stationery.find((s) => s.id === l.id)?.stock) ?? null
    if (cur === null) continue // product was deleted meanwhile
    const take = Math.min(cur, l.qty)
    deducted.push({ ...l, qty: take })
    if (take > 0) {
      next =
        l.kind === 'book'
          ? { ...next, books: next.books.map((b) => (b.id === l.id ? { ...b, stock: b.stock - take } : b)) }
          : { ...next, stationery: next.stationery.map((s) => (s.id === l.id ? { ...s, stock: s.stock - take } : s)) }
    }
  }
  if (deducted.some((d) => d.qty > 0)) commit(withLog(next, `Zaxira buyurtma bo‘yicha kamaytirildi (${deducted.filter((d) => d.qty > 0).length} ta mahsulot)`))
  return deducted
}

/** Puts back exactly what deductStock took (used when a completed order is re-opened). */
export function restoreStock(lines: StockLine[]) {
  let next = state
  for (const l of lines) {
    if (l.qty <= 0) continue
    next =
      l.kind === 'book'
        ? { ...next, books: next.books.map((b) => (b.id === l.id ? { ...b, stock: b.stock + l.qty } : b)) }
        : { ...next, stationery: next.stationery.map((s) => (s.id === l.id ? { ...s, stock: s.stock + l.qty } : s)) }
  }
  if (next !== state) commit(withLog(next, 'Zaxira qaytarildi (buyurtma qayta ochildi)'))
}

/* ---------------- reset ---------------- */
export function resetCatalog() {
  commit(withLog({ ...seed(), activity: state.activity }, 'Katalog boshlang‘ich holatga qaytarildi'))
}

export function resetCatalogAndActivity() {
  commit(seed())
}

export function logActivity(text: string) {
  commit(withLog(state, text))
}
