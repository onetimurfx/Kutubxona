import { BOOKS } from '../data/books'
import { STATIONERY } from '../data/stationery'
import type { Book, Category } from '../data/types'
import type { CartLine } from './store'

/** Lower-case, strip diacritics and every apostrophe/okina variant so "o'tkan", "o‘tkan" and "otkan" all match. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʻʼ'’‘`´‛]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

interface Indexed {
  book: Book
  title: string
  author: string
  genre: string
  category: string
  subjects: string[]
  description: string
}

const INDEX: Indexed[] = BOOKS.map((book) => ({
  book,
  title: norm(book.title),
  author: norm(book.author),
  genre: norm(book.genre),
  category: norm(book.category),
  subjects: book.subjects.map(norm),
  description: norm(book.description),
}))

const words = (s: string) => s.split(' ')

/** true when `a` and `b` differ by at most one edit (typo tolerance for longer words) */
function withinOneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (a.length < b.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function tokenScore(token: string, x: Indexed): number {
  const fields: Array<[string, number]> = [
    [x.title, 6],
    [x.author, 5],
    [x.genre, 3],
    [x.category, 3],
    [x.subjects.join(' '), 3],
    [x.description, 1],
  ]
  let best = 0
  let total = 0
  for (const [text, weight] of fields) {
    if (text.includes(token)) {
      const startsWord = words(text).some((w) => w.startsWith(token))
      total += weight + (startsWord ? 2 : 0)
      best++
    } else if (token.length >= 5 && weight >= 3 && words(text).some((w) => withinOneEdit(w, token))) {
      total += 1
      best++
    }
  }
  return best ? total : 0
}

/** Every word typed must match somewhere (title, author, genre, category, subject, description). */
export function searchBooks(query: string): Book[] {
  const tokens = norm(query).split(' ').filter(Boolean)
  if (!tokens.length) return BOOKS
  return INDEX.map((x) => {
    let score = 0
    for (const t of tokens) {
      const s = tokenScore(t, x)
      if (!s) return { book: x.book, score: 0 }
      score += s
    }
    return { book: x.book, score }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.book.rating - a.book.rating)
    .map((r) => r.book)
}

export interface Suggestion {
  kind: 'Kitob' | 'Muallif' | 'Mavzu'
  text: string
}

export function suggest(query: string, limit = 6): Suggestion[] {
  const q = norm(query)
  if (!q) return []
  const out: Suggestion[] = []
  const seen = new Set<string>()
  const push = (kind: Suggestion['kind'], text: string) => {
    const k = kind + text
    if (!seen.has(k)) {
      seen.add(k)
      out.push({ kind, text })
    }
  }
  const rank = (n: string) => (n.startsWith(q) ? 0 : words(n).some((w) => w.startsWith(q)) ? 1 : 2)
  const sorted = (items: Array<[string, string]>) =>
    items.filter(([n]) => n.includes(q)).sort((a, b) => rank(a[0]) - rank(b[0]))
  sorted(INDEX.map((x) => [x.title, x.book.title])).forEach(([, t]) => push('Kitob', t))
  sorted(INDEX.map((x) => [x.author, x.book.author])).forEach(([, t]) => push('Muallif', t))
  sorted(INDEX.flatMap((x) => x.book.subjects.map((s): [string, string] => [norm(s), s]))).forEach(([, t]) => push('Mavzu', t))
  return out.slice(0, limit)
}

export const TOPICS = ['sevgi', 'tarix', 'kosmos', 'pul', 'ertak', 'psixologiya', 'klassika', 'startap']
export const AUTHORS = Array.from(new Set(BOOKS.map((b) => b.author))).slice(0, 6)
export const CATEGORY_LIST: Category[] = [
  'Badiiy adabiyot',
  'Ilm-fan',
  'Biznes va iqtisod',
  'Bolalar kitoblari',
  'Diniy kitoblar',
]

/** Books similar to the seed books: same author, genre, category and shared subjects. */
export function similarBooks(seedIds: string[], exclude: string[] = [], limit = 8): Book[] {
  const seeds = BOOKS.filter((b) => seedIds.includes(b.id))
  const skip = new Set([...seedIds, ...exclude])
  if (!seeds.length) return []
  return BOOKS.filter((b) => !skip.has(b.id))
    .map((b) => {
      let score = 0
      for (const s of seeds) {
        if (b.author === s.author) score += 4
        if (b.genre === s.genre) score += 3
        if (b.category === s.category) score += 3
        score += b.subjects.filter((x) => s.subjects.includes(x)).length * 2
      }
      return { b, score: score / seeds.length }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.b.rating - a.b.rating)
    .slice(0, limit)
    .map((r) => r.b)
}

export function popularBooks(exclude: string[] = [], limit = 8) {
  return BOOKS.filter((b) => !exclude.includes(b.id) && (b.flags.includes('popular') || b.flags.includes('bestseller'))).slice(0, limit)
}

export interface ResolvedLine {
  key: string
  line: CartLine
  title: string
  subtitle: string
  price: number
  stock: number
  link?: string
  book?: Book
  color?: string
  glyph?: (typeof STATIONERY)[number]['glyph']
}

export function resolveLine(line: CartLine): ResolvedLine | null {
  if (line.kind === 'book') {
    const b = BOOKS.find((x) => x.id === line.id)
    return b
      ? { key: `book:${b.id}`, line, title: b.title, subtitle: b.author, price: b.price, stock: b.stock, link: `/book/${b.id}`, book: b }
      : null
  }
  const s = STATIONERY.find((x) => x.id === line.id)
  return s
    ? { key: `st:${s.id}`, line, title: s.name, subtitle: s.category, price: s.price, stock: s.stock, link: `/stationery/${s.id}`, color: s.color, glyph: s.glyph }
    : null
}

export function stockOf(kind: CartLine['kind'], id: string) {
  return kind === 'book' ? (BOOKS.find((b) => b.id === id)?.stock ?? 0) : (STATIONERY.find((s) => s.id === id)?.stock ?? 0)
}
