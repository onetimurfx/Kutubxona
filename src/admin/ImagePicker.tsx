import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { fileToDataUrl } from '../lib/image'
import { btnGhost } from './ui'

/** Upload a photo (compressed to a small JPEG data URL). Nothing leaves the browser. */
export function ImagePicker({ value, onChange, label = 'Rasm' }: { value?: string; onChange: (v?: string) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [err, setErr] = useState('')
  const pick = async (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) return setErr('Faqat rasm fayli (JPG, PNG, WebP) yuklash mumkin.')
    try {
      onChange(await fileToDataUrl(f))
      setErr('')
    } catch {
      setErr('Rasmni o‘qib bo‘lmadi. Boshqa fayl tanlang.')
    }
  }
  return (
    <div>
      <span className="text-sm font-bold">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        {value && <img src={value} alt="Yuklangan rasm" className="h-20 w-16 rounded-lg object-cover ring-1 ring-mist" data-testid="image-preview" />}
        <input ref={input} type="file" accept="image/*" aria-label={`${label} yuklash`} data-testid="image-input" className="sr-only" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }} />
        <button type="button" className={btnGhost} onClick={() => input.current?.click()}>
          <ImagePlus className="size-4" /> {value ? 'Almashtirish' : 'Rasm yuklash'}
        </button>
        {value && (
          <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-anor" onClick={() => onChange(undefined)}>
            <Trash2 className="size-4" /> Olib tashlash
          </button>
        )}
      </div>
      {err && <p role="alert" className="mt-1.5 text-sm text-anor">{err}</p>}
    </div>
  )
}
