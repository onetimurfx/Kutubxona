import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Check, Copy, FastForward, FileText, Layers, Palette, Printer, Upload, X } from 'lucide-react'
import type { BindingType, PaperSize, PrintRequest, PrintService } from '../data/types'
import { DemoNotice } from '../components/DemoNotice'
import { MiniProgress, StatusChip } from '../components/StatusChip'
import { formatDateTime, formatPhone, formatPrice, formatSize, isValidPhone } from '../lib/format'
import { BINDINGS, PRINT_LABELS, RATES, SERVICES, estimatePrint, nextStatus } from '../lib/orders'
import { useStore } from '../lib/store'

const SERVICE_ICONS: Record<PrintService, typeof BookOpen> = { book: BookOpen, document: FileText, copy: Copy, binding: Layers }
const MAX_FILES = 5
const MAX_BYTES = 50 * 1024 * 1024

const field =
  'mt-1.5 block w-full rounded-2xl bg-paper px-4 py-3.5 text-[16px] outline-none focus-visible:ring-4 focus-visible:ring-saffron/60'

const toInt = (s: string) => {
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : 0
}

export function Print() {
  const { profile, printRequests, addPrintRequest, advancePrint, showToast } = useStore()
  const [service, setService] = useState<PrintService>('document')
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(formatPhone(profile.phone))
  const [pages, setPages] = useState('10')
  const [copies, setCopies] = useState('1')
  const [paper, setPaper] = useState<PaperSize>('A4')
  const [color, setColor] = useState<'bw' | 'color'>('bw')
  const [binding, setBinding] = useState<BindingType>('none')
  const [files, setFiles] = useState<{ name: string; size: number }[]>([])
  const [fileError, setFileError] = useState('')
  const [notes, setNotes] = useState('')
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<PrintRequest | null>(null)
  const [dragging, setDragging] = useState(false)
  const doneRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isBinding = service === 'binding'
  const pagesN = toInt(pages)
  const copiesN = toInt(copies)
  const errors = {
    name: name.trim().length < 2 ? 'Ismingizni kiriting (kamida 2 ta harf).' : '',
    phone: isValidPhone(phone) ? '' : 'Raqamni to‘liq kiriting: +998 va 9 ta raqam.',
    pages: !isBinding && (pagesN < 1 || pagesN > 5000) ? 'Sahifalar sonini kiriting (1 dan 5000 gacha).' : '',
    copies: copiesN < 1 || copiesN > 1000 ? 'Nusxalar sonini kiriting (1 dan 1000 gacha).' : '',
    binding: isBinding && binding === 'none' ? 'Muqova turini tanlang.' : '',
  }
  const valid = !Object.values(errors).some(Boolean)

  const estimate = useMemo(
    () =>
      estimatePrint({
        service,
        pages: Math.max(0, pagesN),
        copies: Math.max(0, copiesN),
        paper,
        color,
        binding,
      }),
    [service, pagesN, copiesN, paper, color, binding],
  )

  const pick = (s: PrintService) => {
    setService(s)
    if (s === 'binding' && binding === 'none') setBinding('spiral')
    if (s !== 'binding' && binding !== 'none' && service === 'binding') setBinding('none')
  }

  const addFiles = (list: FileList | File[]) => {
    const next = [...files]
    let msg = ''
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        msg = `Eng ko‘pi bilan ${MAX_FILES} ta fayl qo‘shish mumkin.`
        break
      }
      if (f.size > MAX_BYTES) {
        msg = `“${f.name}” juda katta (50 MB dan oshmasin).`
        continue
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push({ name: f.name, size: f.size })
    }
    setFiles(next)
    setFileError(msg)
  }
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!valid) return
    const req = addPrintRequest({
      name: name.trim(),
      phone,
      service,
      pages: isBinding ? Math.max(0, pagesN) : pagesN,
      copies: copiesN,
      paper,
      color,
      binding,
      files,
      notes: notes.trim(),
      estimate,
    })
    setDone(req)
    setFiles([])
    setNotes('')
    setTried(false)
    window.setTimeout(() => doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const err = (k: keyof typeof errors) =>
    tried && errors[k] ? (
      <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
        {errors[k]}
      </p>
    ) : null

  return (
    <div className="mx-auto max-w-4xl px-4 pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-2xl bg-teal text-white">
          <Printer className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Chop etish</h1>
          <p className="text-sm text-ink-soft">Kitob, hujjat, nusxa va muqovalash</p>
        </div>
      </div>

      <DemoNotice className="mt-4">Chop etish so‘rovlari haqiqiy korxonaga yuborilmaydi. Ular faqat shu brauzerda saqlanadi, fayllar esa yuklanmaydi.</DemoNotice>

      <AnimatePresence>
        {done && (
          <motion.div
            ref={doneRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-2xl bg-teal p-5 text-white"
            role="status"
            data-testid="print-done"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-teal">
                <Check className="size-6" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold">So‘rov qabul qilindi (demo)</p>
                <p className="mt-1 text-white/85">
                  Raqam: <b data-testid="print-number">{done.id}</b> · {SERVICES[done.service].label} · taxminiy narx {formatPrice(done.estimate)}
                </p>
              </div>
              <button onClick={() => setDone(null)} aria-label="Yopish" className="grid size-8 place-items-center rounded-full bg-white/15">
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mt-6" aria-label="Xizmat turi">
        <h2 className="mb-3 text-xl font-bold">Xizmatni tanlang</h2>
        <div role="radiogroup" aria-label="Xizmat turi" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.keys(SERVICES) as PrintService[]).map((s) => {
            const Icon = SERVICE_ICONS[s]
            const on = service === s
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(s)}
                className={`relative rounded-2xl p-4 text-left transition-colors ${on ? 'bg-ink text-white' : 'bg-white shadow-sm'}`}
              >
                <Icon className={`size-6 ${on ? 'text-saffron' : 'text-teal'}`} />
                <p className="mt-3 font-bold leading-tight">{SERVICES[s].label}</p>
                <p className={`mt-1 text-xs leading-snug ${on ? 'text-white/70' : 'text-ink-soft'}`}>{SERVICES[s].text}</p>
              </button>
            )
          })}
        </div>
      </section>

      <form onSubmit={submit} noValidate className="mt-6 md:grid md:grid-cols-[1fr_300px] md:items-start md:gap-8" aria-label="Chop etish so‘rovi">
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">So‘rov shakli</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="text-sm font-bold">
                Ismingiz
              </label>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} aria-invalid={tried && !!errors.name} />
              {err('name')}
            </div>
            <div>
              <label htmlFor="p-phone" className="text-sm font-bold">
                Telefon raqami
              </label>
              <input
                id="p-phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                className={field}
                aria-invalid={tried && !!errors.phone}
              />
              {err('phone')}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-pages" className="text-sm font-bold">
                Sahifalar soni{isBinding ? ' (ixtiyoriy)' : ''}
              </label>
              <input id="p-pages" value={pages} onChange={(e) => setPages(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className={field} aria-invalid={tried && !!errors.pages} />
              {err('pages')}
            </div>
            <div>
              <label htmlFor="p-copies" className="text-sm font-bold">
                Nusxalar soni
              </label>
              <input id="p-copies" value={copies} onChange={(e) => setCopies(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className={field} aria-invalid={tried && !!errors.copies} />
              {err('copies')}
            </div>
          </div>

          {!isBinding && (
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="flex items-center gap-1.5 text-sm font-bold">
                  <Palette className="size-4" /> Rang
                </legend>
                <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-full bg-paper p-1" role="radiogroup" aria-label="Rang">
                  {(
                    [
                      ['bw', 'Oq-qora'],
                      ['color', 'Rangli'],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={color === v}
                      onClick={() => setColor(v)}
                      className={`rounded-full py-2.5 text-sm font-bold transition-colors ${color === v ? 'bg-ink text-white' : 'text-ink-soft'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="p-paper" className="text-sm font-bold">
                  Qog‘oz o‘lchami
                </label>
                <select id="p-paper" value={paper} onChange={(e) => setPaper(e.target.value as PaperSize)} className={field}>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="A3">A3 (narx ×2)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="p-binding" className="text-sm font-bold">
              Muqovalash{isBinding ? '' : ' (ixtiyoriy)'}
            </label>
            <select id="p-binding" value={binding} onChange={(e) => setBinding(e.target.value as BindingType)} className={field} aria-invalid={tried && !!errors.binding}>
              {(Object.keys(BINDINGS) as BindingType[]).map((b) => (
                <option key={b} value={b}>
                  {BINDINGS[b].label}
                  {BINDINGS[b].price ? ` — ${formatPrice(BINDINGS[b].price)}` : ''}
                </option>
              ))}
            </select>
            {err('binding')}
          </div>

          <div>
            <p className="text-sm font-bold">Fayllar</p>
            <label
              htmlFor="p-files"
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`mt-1.5 flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:ring-4 focus-within:ring-saffron/60 ${dragging ? 'border-teal bg-teal/10' : 'border-mist bg-paper'}`}
            >
              <Upload className="size-6 text-teal" />
              <span className="font-semibold">Faylni tanlang yoki shu yerga tashlang</span>
              <span className="text-xs text-ink-soft">PDF, Word, rasm — 5 tagacha, har biri 50 MB gacha. Demo: faqat fayl nomi saqlanadi.</span>
              <input id="p-files" ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={onPick} className="sr-only" />
            </label>
            {fileError && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-anor">
                {fileError}
              </p>
            )}
            {files.length > 0 && (
              <ul className="mt-2 space-y-2" aria-label="Tanlangan fayllar">
                {files.map((f) => (
                  <li key={f.name + f.size} className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
                    <FileText className="size-5 shrink-0 text-teal" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{formatSize(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((cur) => cur.filter((x) => x !== f))}
                      aria-label={`${f.name} — olib tashlash`}
                      className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-white"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="p-notes" className="text-sm font-bold">
              Qo‘shimcha ko‘rsatmalar (ixtiyoriy)
            </label>
            <textarea id="p-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} placeholder="Masalan: ikki tomonlama, 3–7-sahifalar rangli bo‘lsin" className={field} />
          </div>
        </div>

        <aside className="mt-4 rounded-2xl bg-ink p-5 text-white md:sticky md:top-4 md:mt-0" aria-label="Taxminiy narx">
          <p className="text-sm text-white/70">Taxminiy narx (namuna)</p>
          <p className="mt-1 text-3xl font-extrabold" data-testid="print-estimate" aria-live="polite">
            {formatPrice(estimate)}
          </p>
          <p className="mt-2 text-xs text-white/60">
            {SERVICES[service].label}
            {!isBinding && ` · ${pagesN || 0} bet × ${copiesN || 0} nusxa · ${color === 'bw' ? 'oq-qora' : 'rangli'}`}
            {binding !== 'none' && ` · ${BINDINGS[binding].label.toLowerCase()}`}
          </p>
          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3.5 font-bold text-ink transition-transform active:scale-[0.98]">
            <Printer className="size-5" /> So‘rov yuborish
          </button>
          <p className="mt-3 text-xs text-white/60">Demo: so‘rov hech qayerga yuborilmaydi, narx haqiqiy emas.</p>
        </aside>
      </form>

      <details className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-bold">Narxlar ro‘yxati (namuna)</summary>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-ink-soft">
              <th className="py-1.5 font-medium">Xizmat</th>
              <th className="py-1.5 font-medium">Oq-qora</th>
              <th className="py-1.5 font-medium">Rangli</th>
            </tr>
          </thead>
          <tbody>
            {(['copy', 'document', 'book'] as const).map((s) => (
              <tr key={s} className="border-t border-mist">
                <td className="py-2 font-medium">
                  {SERVICES[s].label}
                  {RATES[s].setup > 0 && <span className="block text-xs font-normal text-ink-soft">+ {formatPrice(RATES[s].setup)} tayyorlash</span>}
                </td>
                <td className="py-2">{formatPrice(RATES[s].bw)} / bet</td>
                <td className="py-2">{formatPrice(RATES[s].color)} / bet</td>
              </tr>
            ))}
            {(['spiral', 'thermo', 'hard'] as const).map((b) => (
              <tr key={b} className="border-t border-mist">
                <td className="py-2 font-medium" colSpan={2}>
                  Muqovalash: {BINDINGS[b].label.toLowerCase()}
                </td>
                <td className="py-2">{formatPrice(BINDINGS[b].price)} / nusxa</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <section className="mt-9" aria-label="So‘rovlar tarixi">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-bold">So‘rovlar tarixi</h2>
          <Link to="/account?tab=prints" className="-my-2 py-2 pl-3 text-sm font-semibold text-teal hover:underline">
            Hisobda ko‘rish
          </Link>
        </div>
        {printRequests.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-ink-soft shadow-sm">Hali so‘rov yo‘q. Yuqoridagi shaklni to‘ldiring — so‘rov shu yerda ko‘rinadi.</p>
        ) : (
          <ul className="space-y-3">
            {printRequests.map((r) => {
              const n = nextStatus(r.status)
              return (
                <li key={r.id} className="rounded-2xl bg-white p-4 shadow-sm" data-testid="print-item">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-extrabold">{r.id}</span>
                    <StatusChip status={r.status} labels={PRINT_LABELS} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{SERVICES[r.service].label}</p>
                  <p className="text-sm text-ink-soft">
                    {r.service !== 'binding' && `${r.pages} bet × `}
                    {r.copies} nusxa
                    {r.service !== 'binding' && ` · ${r.color === 'bw' ? 'oq-qora' : 'rangli'} · ${r.paper}`}
                    {r.binding !== 'none' && ` · ${BINDINGS[r.binding].label.toLowerCase()}`}
                    {r.files.length > 0 && ` · ${r.files.length} ta fayl`}
                  </p>
                  {r.notes && <p className="mt-1 text-sm italic text-ink-soft">“{r.notes}”</p>}
                  <p className="mt-1 flex justify-between text-sm">
                    <span className="text-ink-soft">{formatDateTime(r.createdAt)}</span>
                    <b>{formatPrice(r.estimate)}</b>
                  </p>
                  <div className="mt-3">
                    <MiniProgress status={r.status} />
                  </div>
                  {n && (
                    <button
                      onClick={() => {
                        advancePrint(r.id)
                        showToast(`${r.id}: ${PRINT_LABELS[n]}`)
                      }}
                      className="mt-3 flex items-center gap-2 rounded-full bg-saffron/30 px-4 py-2 text-sm font-semibold"
                    >
                      <FastForward className="size-4" /> Demo: keyingi holat — {PRINT_LABELS[n]}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
