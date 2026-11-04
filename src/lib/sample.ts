import type { Book, Order, OrderLine, PrintRequest, Status, StationeryItem } from '../data/types'
import { effectiveStock } from './catalogStore'
import { makeNumber } from './orders'

/** small deterministic generator so sample data looks the same on every machine */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const NAMES = ['Aziza Karimova', 'Bobur Rahimov', 'Dilnoza Yusupova', 'Jasur Toshmatov', 'Malika Sodiqova', 'Sherzod Aliyev', 'Nodira Ergasheva', 'Otabek Qodirov', 'Zilola Hamidova', 'Rustam Nazarov']
const DAY = 24 * 3600 * 1000

const phone = (r: () => number) => {
  const d = (n: number) => String(Math.floor(r() * 10 ** n)).padStart(n, '0')
  return `+998 9${Math.floor(r() * 10)} ${d(3)} ${d(2)} ${d(2)}`
}

function history(created: number, status: Status, now: number) {
  const steps: Status[] = ['received', 'preparing', 'ready', 'completed']
  const upTo = steps.indexOf(status)
  const offsets = [0, 25 * 60000, 3 * 3600000, 20 * 3600000]
  return steps.slice(0, upTo + 1).map((s, i) => ({ status: s, at: Math.min(now, created + offsets[i]) }))
}

export function makeSampleData(books: Book[], stationery: StationeryItem[], takenOrders: string[], takenPrints: string[]) {
  const r = rng(20261104)
  const now = Date.now()
  const pool: { kind: 'book' | 'stationery'; id: string; title: string; subtitle: string; price: number }[] = [
    ...books.filter((b) => effectiveStock(b) > 0).map((b) => ({ kind: 'book' as const, id: b.id, title: b.title, subtitle: b.author, price: b.price })),
    ...stationery.filter((s) => effectiveStock(s) > 0).map((s) => ({ kind: 'stationery' as const, id: s.id, title: s.name, subtitle: s.category, price: s.price })),
  ]
  if (!pool.length) return { orders: [] as Order[], prints: [] as PrintRequest[] }

  // newest first: 2 received, 2 preparing, 2 ready, rest completed
  const statuses: Status[] = ['received', 'received', 'preparing', 'preparing', 'ready', 'ready', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed']
  const ids = [...takenOrders]
  const orders: Order[] = statuses.map((status, i) => {
    const created = now - (i * 0.55 + r() * 0.3) * DAY
    const lines: OrderLine[] = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
      const p = pool[Math.floor(r() * pool.length)]
      return { ...p, qty: 1 + Math.floor(r() * 2) }
    }).filter((l, idx, arr) => arr.findIndex((x) => x.id === l.id && x.kind === l.kind) === idx)
    const id = makeNumber('KX', ids)
    ids.push(id)
    return {
      id,
      createdAt: created,
      name: NAMES[i % NAMES.length],
      phone: phone(r),
      lines,
      total: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
      status,
      history: history(created, status, now),
      // sample orders are already accounted for: they must not change today's stock
      stockDeducted: status === 'completed' ? [] : undefined,
    }
  })

  const printSpecs: { status: Status; service: PrintRequest['service']; pages: number; copies: number; color: 'bw' | 'color'; binding: PrintRequest['binding']; files: string[]; notes: string; estimate: number }[] = [
    { status: 'received', service: 'document', pages: 24, copies: 2, color: 'bw', binding: 'none', files: ['referat.pdf'], notes: 'Ikki tomonlama', estimate: 14400 },
    { status: 'preparing', service: 'book', pages: 180, copies: 1, color: 'bw', binding: 'thermo', files: ['kitob-matni.pdf', 'muqova.png'], notes: 'A5 formatda', estimate: 103000 },
    { status: 'ready', service: 'copy', pages: 40, copies: 3, color: 'bw', binding: 'spiral', files: [], notes: '', estimate: 48000 },
    { status: 'completed', service: 'binding', pages: 0, copies: 4, color: 'bw', binding: 'hard', files: [], notes: 'Diplom ishlari', estimate: 120000 },
  ]
  const pids = [...takenPrints]
  const prints: PrintRequest[] = printSpecs.map((p, i) => {
    const created = now - (i * 0.9 + 0.2) * DAY
    const id = makeNumber('CH', pids)
    pids.push(id)
    return {
      id,
      createdAt: created,
      name: NAMES[(i + 4) % NAMES.length],
      phone: phone(r),
      service: p.service,
      pages: p.pages,
      copies: p.copies,
      paper: 'A4',
      color: p.color,
      binding: p.binding,
      files: p.files.map((name, k) => ({ name, size: (120 + k * 340) * 1024 })),
      notes: p.notes,
      estimate: p.estimate,
      status: p.status,
      history: history(created, p.status, now),
    }
  })
  return { orders, prints }
}
