import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../lib/store'

/** Find an order by its number (demo orders live in this browser only). */
export function TrackLookup() {
  const { orders } = useStore()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const code = value.trim().toUpperCase()
    const found = orders.find((o) => o.id === code)
    if (found) {
      setError('')
      navigate(`/order/${found.id}`)
    } else {
      setError(code ? `“${code}” raqamli buyurtma bu qurilmada topilmadi. Raqamni tekshiring (masalan, KX-123456).` : 'Buyurtma raqamini kiriting.')
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-4 shadow-sm" aria-label="Buyurtmani kuzatish">
      <label htmlFor="track-number" className="text-sm font-bold">
        Buyurtmani raqam bo‘yicha kuzatish
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="track-number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="KX-123456"
          autoCapitalize="characters"
          className="min-w-0 flex-1 rounded-full bg-paper px-4 py-3 text-[15px] uppercase outline-none placeholder:normal-case focus-visible:ring-4 focus-visible:ring-saffron/60"
        />
        <button type="submit" className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-semibold text-white">
          <Search className="size-4" /> Kuzatish
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-anor">
          {error}
        </p>
      )}
    </form>
  )
}
