import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { StationeryItem } from '../data/types'
import { removeStationery, saveStationery, setAvailable, useCatalog } from '../lib/catalogStore'
import { useStore } from '../lib/store'
import { norm } from '../lib/catalog'
import { formatPrice } from '../lib/format'
import { ICONS, StationeryThumb } from '../components/StationeryThumb'
import { ImagePicker } from './ImagePicker'
import { ConfirmDialog, Modal, PageHeader, StockBadge, Switch, adminField, btnGhost, btnPrimary } from './ui'

const COLORS = ['#0B7A80', '#C23B4E', '#16224F', '#F0B429', '#8AD1A5', '#7CC6C9', '#F2A7B0', '#2B1E5B']
const GLYPHS = Object.keys(ICONS) as StationeryItem['glyph'][]
const GLYPH_LABEL: Record<StationeryItem['glyph'], string> = { notebook: 'Daftar', pen: 'Ruchka', pencil: 'Qalam', paper: 'Qog‘oz', backpack: 'Ryukzak', stapler: 'Steplyer', ruler: 'Chizg‘ich', folder: 'Papka' }

interface Form { name: string; category: string; description: string; price: string; stock: string; available: boolean; color: string; glyph: StationeryItem['glyph']; image?: string }

function ItemForm({ item, onClose }: { item?: StationeryItem; onClose: () => void }) {
  const { showToast } = useStore()
  const { stationery } = useCatalog()
  const cats = useMemo(() => [...new Set(stationery.map((s) => s.category))], [stationery])
  const [f, setF] = useState<Form>(() => item ? { name: item.name, category: item.category, description: item.description, price: String(item.price), stock: String(item.stock), available: item.available !== false, color: item.color, glyph: item.glyph, image: item.image } : { name: '', category: cats[0] ?? 'Daftarlar', description: '', price: '', stock: '20', available: true, color: COLORS[0], glyph: 'notebook' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!f.name.trim()) er.name = 'Mahsulot nomini kiriting'
    if (!f.category.trim()) er.category = 'Kategoriyani kiriting'
    if (!(Number(f.price) > 0)) er.price = 'Narx 0 dan katta bo‘lishi kerak'
    if (f.stock === '' || !(Number(f.stock) >= 0)) er.stock = 'Zaxira 0 yoki undan katta bo‘lishi kerak'
    setErrors(er)
    if (Object.keys(er).length) return
    let id = item?.id
    if (!id) {
      const base = norm(f.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mahsulot'
      id = base
      for (let n = 2; stationery.some((s) => s.id === id); n++) id = `${base}-${n}`
    }
    const res = saveStationery({ id, name: f.name.trim(), category: f.category.trim(), description: f.description.trim() || 'Tavsif hali kiritilmagan.', price: Math.round(Number(f.price)), stock: Math.round(Number(f.stock)), color: f.color, glyph: f.glyph, image: f.image, available: f.available })
    if (!res.ok) return setErrors({ image: 'Brauzer xotirasi to‘ldi. Kichikroq rasm tanlang yoki demo ma’lumotlarni tiklang.' })
    showToast(res.isNew ? 'Mahsulot qo‘shildi' : 'Mahsulot saqlandi')
    onClose()
  }
  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-anor">{errors[k]}</p>

  return (
    <Modal title={item ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold sm:col-span-2">Nomi
          <input className={adminField} value={f.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} />{err('name')}
        </label>
        <label className="text-sm font-bold">Kategoriya
          <input className={adminField} list="st-cats" value={f.category} onChange={(e) => set('category', e.target.value)} aria-invalid={!!errors.category} />
          <datalist id="st-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>{err('category')}
        </label>
        <label className="text-sm font-bold">Narx (so‘m)
          <input className={adminField} type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} aria-invalid={!!errors.price} />{err('price')}
        </label>
        <label className="text-sm font-bold">Zaxira (dona)
          <input className={adminField} type="number" min={0} value={f.stock} onChange={(e) => set('stock', e.target.value)} aria-invalid={!!errors.stock} />{err('stock')}
        </label>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
          <span className="text-sm font-bold">Sotuvda mavjud</span>
          <Switch checked={f.available} onChange={(v) => set('available', v)} label="Sotuvda mavjud" />
        </div>
        <label className="text-sm font-bold sm:col-span-2">Tavsif
          <textarea className={adminField} rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="sm:col-span-2">
          <p className="text-sm font-bold">Ko‘rinish</p>
          <div className="mt-2 flex flex-wrap items-start gap-5">
            <StationeryThumb color={f.color} glyph={f.glyph} image={f.image} className="size-24 shrink-0 rounded-2xl" iconClass="size-10" />
            <div className="min-w-0 flex-1 space-y-4">
              {!f.image && (
                <>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Rang">
                    {COLORS.map((c) => <button key={c} type="button" role="radio" aria-checked={f.color === c} aria-label={`Rang ${c}`} onClick={() => set('color', c)} className={`size-8 rounded-full ring-offset-2 ${f.color === c ? 'ring-4 ring-saffron' : 'ring-1 ring-mist'}`} style={{ background: c }} />)}
                  </div>
                  <select aria-label="Belgi" className={adminField + ' max-w-48'} value={f.glyph} onChange={(e) => set('glyph', e.target.value as StationeryItem['glyph'])}>
                    {GLYPHS.map((g) => <option key={g} value={g}>{GLYPH_LABEL[g]}</option>)}
                  </select>
                </>
              )}
              <ImagePicker label="Mahsulot rasmi" value={f.image} onChange={(v) => set('image', v)} />{err('image')}
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

export function AdminStationery() {
  const { stationery } = useCatalog()
  const { showToast } = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<StationeryItem | 'new' | null>(null)
  const [del, setDel] = useState<StationeryItem | null>(null)
  const list = useMemo(() => { const n = norm(q); return n ? stationery.filter((s) => norm(`${s.name} ${s.category}`).includes(n)) : stationery }, [stationery, q])

  return (
    <>
      <PageHeader title="Kanselyariya" text={`${stationery.length} ta mahsulot. O‘zgarishlar mijoz saytida darhol ko‘rinadi.`}>
        <button className={btnPrimary} onClick={() => setEditing('new')}><Plus className="size-4" /> Mahsulot qo‘shish</button>
      </PageHeader>
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Mahsulotlarni qidirish" placeholder="Nom yoki kategoriya" className="w-full rounded-full bg-white py-3 pl-11 pr-4 shadow-sm outline-none ring-1 ring-mist focus-visible:ring-4 focus-visible:ring-saffron/60" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {list.length === 0 ? <p className="p-8 text-center text-ink-soft">Hech narsa topilmadi.</p> : (
          <ul className="divide-y divide-mist" data-testid="st-rows">
            {list.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4" data-testid="st-row">
                <StationeryThumb color={s.color} glyph={s.glyph} image={s.image} className="size-12 shrink-0 rounded-xl" iconClass="size-6" />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-bold">{s.name}</p>
                  <p className="truncate text-sm text-ink-soft">{s.category}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(s.price)}</p>
                <div className="flex w-28 flex-col items-start gap-1"><StockBadge stock={s.stock} available={s.available} /><span className="text-xs text-ink-soft">{s.stock} dona</span></div>
                <Switch checked={s.available !== false} onChange={(v) => { setAvailable('stationery', s.id, v); showToast(v ? 'Sotuvga qo‘yildi' : 'Sotuvdan olindi') }} label={`${s.name} — sotuvda`} />
                <div className="flex gap-1">
                  <button onClick={() => setEditing(s)} aria-label={`${s.name} — tahrirlash`} className="grid size-10 place-items-center rounded-full hover:bg-paper"><Pencil className="size-[18px]" /></button>
                  <button onClick={() => setDel(s)} aria-label={`${s.name} — o‘chirish`} className="grid size-10 place-items-center rounded-full text-anor hover:bg-anor/10"><Trash2 className="size-[18px]" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <AnimatePresence>{editing && <ItemForm key={editing === 'new' ? 'new' : editing.id} item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}</AnimatePresence>
      <ConfirmDialog open={!!del} title="Mahsulotni o‘chirish" text={del ? `“${del.name}” katalogdan butunlay o‘chiriladi va mijoz saytidan yo‘qoladi. Davom etasizmi?` : ''} confirmLabel="Ha, o‘chirish" onCancel={() => setDel(null)} onConfirm={() => { if (del) { removeStationery(del.id); showToast('Mahsulot o‘chirildi') } setDel(null) }} />
    </>
  )
}
