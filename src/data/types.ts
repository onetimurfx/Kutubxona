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
