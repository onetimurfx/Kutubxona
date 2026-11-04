import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { Book, Category, Motif } from '../data/types'
import { removeBook, saveBook, setAvailable, useCatalog } from '../lib/catalogStore'
import { useStore } from '../lib/store'
import { norm } from '../lib/catalog'
import { discountPercent, formatPrice } from '../lib/format'
import { BookCover } from '../components/BookCover'
import { ImagePicker } from './ImagePicker'
import { ConfirmDialog, Modal, PageHeader, StockBadge, Switch, adminField, btnGhost, btnPrimary } from './ui'

const CATEGORIES: Category[] = ['Badiiy adabiyot', 'Ilm-fan', 'Biznes va iqtisod', 'Bolalar kitoblari', 'Diniy kitoblar']
const FLAGS: { v: Book['flags'][number]; label: string }[] = [
  { v: 'new', label: 'Yangi' },
  { v: 'popular', label: 'Ommabop' },
  { v: 'bestseller', label: 'Bestseller' },
  { v: 'recommended', label: 'Tavsiya' },
]
const PRESETS: { bg: string; fg: string; accent: string; motif: Motif }[] = [
  { bg: '#16224F', fg: '#F2F5F9', accent: '#F0B429', motif: 'arches' },
  { bg: '#0B7A80', fg: '#F2F5F9', accent: '#F0B429', motif: 'star' },
  { bg: '#C23B4E', fg: '#FFF7E8', accent: '#16224F', motif: 'ikat' },
  { bg: '#F0B429', fg: '#16224F', accent: '#C23B4E', motif: 'rings' },
  { bg: '#2B1E5B', fg: '#F2F5F9', accent: '#8AD1A5', motif: 'waves' },
  { bg: '#F2F5F9', fg: '#16224F', accent: '#0B7A80', motif: 'tiles' },
]

const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kitob'

interface Form {
  title: string
  author: string
  category: Category
  genre: string
  description: string
  price: string
  oldPrice: string
  stock: string
  pages: string
  year: string
  subjects: string
  flags: Book['flags']
  available: boolean
  preset: number
  image?: string
}

const empty: Form = { title: '', author: '', category: 'Badiiy adabiyot', genre: '', description: '', price: '', oldPrice: '', stock: '10', pages: '200', year: String(new Date().getFullYear()), subjects: '', flags: ['new'], available: true, preset: 0 }

function toForm(b: Book): Form {
  const idx = PRESETS.findIndex((p) => p.bg === b.cover.bg && p.motif === b.cover.motif)
  return { title: b.title, author: b.author, category: b.category, genre: b.genre, description: b.description, price: String(b.price), oldPrice: b.oldPrice ? String(b.oldPrice) : '', stock: String(b.stock), pages: String(b.pages), year: String(b.year), subjects: b.subjects.join(', '), flags: b.flags, available: b.available !== false, preset: idx < 0 ? 0 : idx, image: b.cover.image }
}

function BookForm({ book, onClose }: { book?: Book; onClose: () => void }) {
  const { showToast } = useStore()
  const { books } = useCatalog()
  const [f, setF] = useState<Form>(() => (book ? toForm(book) : empty))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))
  const preset = PRESETS[f.preset]
  const price = Number(f.price)
  const oldPrice = Number(f.oldPrice)
  const pct = discountPercent(price, oldPrice || undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!f.title.trim()) er.title = 'Kitob nomini kiriting'
    if (!f.author.trim()) er.author = 'Muallifni kiriting'
    if (!(price > 0)) er.price = 'Narx 0 dan katta bo‘lishi kerak'
    if (f.oldPrice && !(oldPrice > price)) er.oldPrice = 'Eski narx joriy narxdan katta bo‘lishi kerak'
    if (!(Number(f.stock) >= 0) || f.stock === '') er.stock = 'Zaxira 0 yoki undan katta bo‘lishi kerak'
    setErrors(er)
    if (Object.keys(er).length) return
    let id = book?.id
    if (!id) {
      const base = slug(f.title)
      id = base
      for (let n = 2; books.some((b) => b.id === id); n++) id = `${base}-${n}`
    }
    const next: Book = {
      id,
      title: f.title.trim(),
      author: f.author.trim(),
      category: f.category,
      genre: f.genre.trim() || f.category,
      subjects: f.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      description: f.description.trim() || 'Tavsif hali kiritilmagan.',
      price: Math.round(price),
      oldPrice: f.oldPrice ? Math.round(oldPrice) : undefined,
      stock: Math.max(0, Math.round(Number(f.stock))),
      pages: Math.max(1, Math.round(Number(f.pages) || 1)),
      year: Math.round(Number(f.year) || new Date().getFullYear()),
      rating: book?.rating ?? 4.5,
      flags: f.flags,
      cover: { ...preset, image: f.image },
      available: f.available,
    }
    const res = saveBook(next)
    if (!res.ok) return setErrors({ image: 'Brauzer xotirasi to‘ldi. Kichikroq rasm tanlang yoki demo ma’lumotlarni tiklang.' })
    showToast(res.isNew ? 'Kitob qo‘shildi' : 'Kitob saqlandi')
    onClose()
  }

  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-anor">{errors[k]}</p>

  return (
    <Modal title={book ? 'Kitobni tahrirlash' : 'Yangi kitob'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold sm:col-span-2">
          Nomi
          <input className={adminField} value={f.title} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title} />
          {err('title')}
        </label>
        <label className="text-sm font-bold">
          Muallif
          <input className={adminField} value={f.author} onChange={(e) => set('author', e.target.value)} aria-invalid={!!errors.author} />
          {err('author')}
        </label>
        <label className="text-sm font-bold">
          Kategoriya
          <select className={adminField} value={f.category} onChange={(e) => set('category', e.target.value as Category)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          Janr
          <input className={adminField} value={f.genre} onChange={(e) => set('genre', e.target.value)} />
        </label>
        <label className="text-sm font-bold">
          Mavzular (vergul bilan)
          <input className={adminField} value={f.subjects} onChange={(e) => set('subjects', e.target.value)} placeholder="tarix, sevgi" />
        </label>
        <label className="text-sm font-bold sm:col-span-2">
          Tavsif
          <textarea className={adminField} rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label className="text-sm font-bold">
          Narx (so‘m)
          <input className={adminField} inputMode="numeric" type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} aria-invalid={!!errors.price} />
          {err('price')}
        </label>
        <label className="text-sm font-bold">
          Eski narx (chegirma uchun)
          <input className={adminField} inputMode="numeric" type="number" min={0} value={f.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} aria-invalid={!!errors.oldPrice} />
          {pct > 0 && <span className="mt-1 block text-sm font-semibold text-anor">Chegirma: −{pct}%</span>}
          {err('oldPrice')}
        </label>
        <label className="text-sm font-bold">
          Zaxira (dona)
          <input className={adminField} inputMode="numeric" type="number" min={0} value={f.stock} onChange={(e) => set('stock', e.target.value)} aria-invalid={!!errors.stock} />
          {err('stock')}
        </label>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
          <span className="text-sm font-bold">Sotuvda mavjud</span>
          <Switch checked={f.available} onChange={(v) => set('available', v)} label="Sotuvda mavjud" />
        </div>
        <label className="text-sm font-bold">
          Sahifalar
          <input className={adminField} type="number" min={1} value={f.pages} onChange={(e) => set('pages', e.target.value)} />
        </label>
        <label className="text-sm font-bold">
          Nashr yili
          <input className={adminField} type="number" value={f.year} onChange={(e) => set('year', e.target.value)} />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-bold">Belgilar</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {FLAGS.map(({ v, label }) => {
              const on = f.flags.includes(v)
              return (
                <button key={v} type="button" aria-pressed={on} onClick={() => set('flags', on ? f.flags.filter((x) => x !== v) : [...f.flags, v])} className={`rounded-full px-4 py-2 text-sm font-semibold ${on ? 'bg-ink text-white' : 'bg-paper ring-1 ring-mist'}`}>
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <p className="text-sm font-bold">Muqova</p>
          <div className="mt-2 flex flex-wrap items-start gap-5">
            <div className="w-24 shrink-0">
              <BookCover title={f.title || 'Sarlavha'} author={f.author || 'Ism'} cover={{ ...preset, image: f.image }} />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              {!f.image && (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Muqova uslubi">
                  {PRESETS.map((p, i) => (
                    <button key={i} type="button" role="radio" aria-checked={f.preset === i} aria-label={`Uslub ${i + 1}`} onClick={() => set('preset', i)} className={`size-9 rounded-full ring-offset-2 ${f.preset === i ? 'ring-4 ring-saffron' : 'ring-1 ring-mist'}`} style={{ background: `linear-gradient(135deg, ${p.bg} 55%, ${p.accent} 55%)` }} />
                  ))}
                </div>
              )}
              <ImagePicker label="Muqova rasmi" value={f.image} onChange={(v) => set('image', v)} />
              {err('image')}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className={btnGhost}>Bekor qilish</button>
          <button type="submit" className={btnPrimary}>Saqlash</button>
        </div>
      </form>
    </Modal>
  )
}

export function AdminBooks() {
  const { books } = useCatalog()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Book | 'new' | null>(null)
  const [del, setDel] = useState<Book | null>(null)
  const { showToast } = useStore()

  const list = useMemo(() => {
    const n = norm(q)
    return n ? books.filter((b) => norm(`${b.title} ${b.author} ${b.category} ${b.genre}`).includes(n)) : books
  }, [books, q])

  return (
    <>
      <PageHeader title="Kitoblar" text={`Katalogda ${books.length} ta kitob. O‘zgarishlar mijoz saytida darhol ko‘rinadi.`}>
        <button className={btnPrimary} onClick={() => setEditing('new')}>
          <Plus className="size-4" /> Kitob qo‘shish
        </button>
      </PageHeader>

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kitoblarni qidirish" placeholder="Nom, muallif yoki kategoriya" className="w-full rounded-full bg-white py-3 pl-11 pr-4 shadow-sm outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60" />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {list.length === 0 ? (
          <p className="p-8 text-center text-ink-soft">Hech narsa topilmadi.</p>
        ) : (
          <ul className="divide-y divide-mist" data-testid="book-rows">
            {list.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4" data-testid="book-row">
                <div className="w-12 shrink-0"><BookCover title={b.title} author={b.author} cover={b.cover} /></div>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-bold">{b.title}</p>
                  <p className="truncate text-sm text-ink-soft">{b.author} · {b.category}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{formatPrice(b.price)}</p>
                  {b.oldPrice && <p className="text-xs text-ink-soft line-through">{formatPrice(b.oldPrice)}</p>}
                </div>
                <div className="flex w-28 flex-col items-start gap-1">
                  <StockBadge stock={b.stock} available={b.available} />
                  <span className="text-xs text-ink-soft">{b.stock} dona</span>
                </div>
                <Switch checked={b.available !== false} onChange={(v) => { setAvailable('book', b.id, v); showToast(v ? 'Sotuvga qo‘yildi' : 'Sotuvdan olindi') }} label={`${b.title} — sotuvda`} />
                <div className="flex gap-1">
                  <button onClick={() => setEditing(b)} aria-label={`${b.title} — tahrirlash`} className="grid size-10 place-items-center rounded-full hover:bg-paper"><Pencil className="size-[18px]" /></button>
                  <button onClick={() => setDel(b)} aria-label={`${b.title} — o‘chirish`} className="grid size-10 place-items-center rounded-full text-anor hover:bg-anor/10"><Trash2 className="size-[18px]" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>{editing && <BookForm key={editing === 'new' ? 'new' : editing.id} book={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}</AnimatePresence>
      <ConfirmDialog open={!!del} title="Kitobni o‘chirish" text={del ? `“${del.title}” katalogdan butunlay o‘chiriladi va mijoz saytidan yo‘qoladi. Davom etasizmi?` : ''} confirmLabel="Ha, o‘chirish" onCancel={() => setDel(null)} onConfirm={() => { if (del) { removeBook(del.id); showToast('Kitob o‘chirildi') } setDel(null) }} />
    </>
  )
}
