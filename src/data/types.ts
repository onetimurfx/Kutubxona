export type Category =
  | 'Badiiy adabiyot'
  | 'Ilm-fan'
  | 'Biznes va iqtisod'
  | 'Bolalar kitoblari'
  | 'Diniy kitoblar'

export type Motif = 'star' | 'ikat' | 'arches' | 'rings' | 'waves' | 'tiles'

export interface CoverStyle {
  bg: string
  fg: string
  accent: string
  motif: Motif
}

export interface Book {
  id: string
  title: string
  author: string
  category: Category
  genre: string
  subjects: string[]
  description: string
  price: number
  oldPrice?: number
  stock: number
  pages: number
  year: number
  rating: number
  flags: Array<'new' | 'popular' | 'bestseller' | 'recommended'>
  cover: CoverStyle
}

export type StationeryCategory =
  | 'Daftarlar'
  | 'Ruchkalar'
  | 'Qalamlar'
  | "Qog'oz"
  | 'Maktab buyumlari'
  | 'Ofis buyumlari'

export interface StationeryItem {
  id: string
  name: string
  category: StationeryCategory
  description: string
  price: number
  stock: number
  color: string
  glyph: 'notebook' | 'pen' | 'pencil' | 'paper' | 'backpack' | 'stapler' | 'ruler' | 'folder'
}

/* ---------- Phase 3: orders, print requests, profile (demo data kept in localStorage) ---------- */

export type Status = 'received' | 'preparing' | 'ready' | 'completed'

export interface OrderLine {
  kind: 'book' | 'stationery'
  id: string
  title: string
  subtitle: string
  price: number
  qty: number
}

export interface Order {
  id: string // same as the order number, e.g. KX-483920
  createdAt: number
  name: string
  phone: string
  lines: OrderLine[]
  total: number
  status: Status
  history: { status: Status; at: number }[]
}

export type PrintService = 'book' | 'document' | 'copy' | 'binding'
export type PaperSize = 'A5' | 'A4' | 'A3'
export type BindingType = 'none' | 'spiral' | 'thermo' | 'hard'

export interface PrintRequest {
  id: string // e.g. CH-48392
  createdAt: number
  name: string
  phone: string
  service: PrintService
  pages: number
  copies: number
  paper: PaperSize
  color: 'bw' | 'color'
  binding: BindingType
  files: { name: string; size: number }[] // only file names are kept — nothing is uploaded
  notes: string
  estimate: number
  status: Status
  history: { status: Status; at: number }[]
}

export interface Profile {
  name: string
  phone: string
}
