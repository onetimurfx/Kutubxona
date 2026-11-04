import type { BindingType, PaperSize, PrintService, Status } from '../data/types'

export const STATUS_ORDER: Status[] = ['received', 'preparing', 'ready', 'completed']

export const ORDER_LABELS: Record<Status, string> = {
  received: 'Qabul qilindi',
  preparing: 'Tayyorlanmoqda',
  ready: 'Olib ketishga tayyor',
  completed: 'Yakunlandi',
}

export const PRINT_LABELS: Record<Status, string> = {
  received: 'Qabul qilindi',
  preparing: 'Chop etilmoqda',
  ready: 'Olib ketishga tayyor',
  completed: 'Yakunlandi',
}

export const nextStatus = (s: Status): Status | null => STATUS_ORDER[STATUS_ORDER.indexOf(s) + 1] ?? null

/** Random but collision-free order number, e.g. KX-483920 / CH-48392 */
export function makeNumber(prefix: 'KX' | 'CH', taken: string[]) {
  const digits = prefix === 'KX' ? 6 : 5
  for (let i = 0; i < 50; i++) {
    const n = String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, '0')
    const id = `${prefix}-${n}`
    if (!taken.includes(id)) return id
  }
  return `${prefix}-${Date.now()}`
}

export const SERVICES: Record<PrintService, { label: string; text: string }> = {
  book: { label: 'Kitob chop etish', text: "Kitob yoki to'plamni tayyor holda chop etish va muqovalash." },
  document: { label: 'Hujjat chiqarish', text: 'Referat, ariza, shartnoma va boshqa hujjatlar.' },
  copy: { label: "Nusxa ko'chirish", text: "Qog'ozdagi hujjatlardan tez nusxa olish." },
  binding: { label: 'Muqovalash', text: 'Tayyor varaqlarni prujina, termo yoki qattiq muqovaga olish.' },
}

export const BINDINGS: Record<BindingType, { label: string; price: number }> = {
  none: { label: "Muqovasiz", price: 0 },
  spiral: { label: 'Prujina', price: 8000 },
  thermo: { label: 'Termo muqova', price: 12000 },
  hard: { label: 'Qattiq muqova', price: 30000 },
}

/** Demo price list, so'm per page (single side) */
export const RATES: Record<'book' | 'document' | 'copy', { bw: number; color: number; setup: number }> = {
  book: { bw: 450, color: 1900, setup: 10000 },
  document: { bw: 300, color: 1500, setup: 0 },
  copy: { bw: 200, color: 1200, setup: 0 },
}

const PAPER_FACTOR: Record<PaperSize, number> = { A5: 1, A4: 1, A3: 2 }

export interface PrintInput {
  service: PrintService
  pages: number
  copies: number
  paper: PaperSize
  color: 'bw' | 'color'
  binding: BindingType
}

export function estimatePrint(i: PrintInput): number {
  const bind = BINDINGS[i.binding].price
  if (i.service === 'binding') return bind * i.copies
  const r = RATES[i.service]
  const perCopy = r.setup + r[i.color] * i.pages * PAPER_FACTOR[i.paper] + bind
  return Math.round(perCopy * i.copies)
}
