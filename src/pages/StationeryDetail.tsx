import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, PackageX, ShoppingBag } from 'lucide-react'
import { effectiveStock, isLowStock, useCatalog } from '../lib/catalogStore'
import { StationeryThumb } from '../components/StationeryThumb'
import { EmptyState } from '../components/EmptyState'
import { StationeryCard } from '../components/StationeryCard'
import { QtyStepper } from '../components/QtyStepper'
import { formatPrice } from '../lib/format'
import { useStore } from '../lib/store'

export function StationeryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, qtyInCart, setQty } = useStore()
  const { stationery: STATIONERY } = useCatalog()
  const item = STATIONERY.find((s) => s.id === id)
  const back = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/stationery'))

  if (!item) {
    return (
      <div className="pb-36 pt-16">
        <EmptyState icon={PackageX} title="Mahsulot topilmadi" text="Bu manzilda mahsulot yo‘q. Katalogdan boshqasini tanlang.">
          <Link to="/stationery" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
            Kanselyariya katalogi
          </Link>
        </EmptyState>
      </div>
    )
  }

  const inCart = qtyInCart('stationery', item.id)
  const stock = effectiveStock(item)
  const sold = stock === 0
  const low = isLowStock(item)
  const related = STATIONERY.filter((s) => s.category === item.category && s.id !== item.id)
  const more = related.length ? related : STATIONERY.filter((s) => s.id !== item.id).slice(0, 6)

  return (
    <div className="mx-auto max-w-4xl pb-36 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="px-4">
        <button onClick={back} className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-ink-soft">
          <ArrowLeft className="size-4" /> Orqaga
        </button>
        <div className="mt-2 sm:flex sm:gap-10">
          <StationeryThumb color={item.color} glyph={item.glyph} image={item.image} className={`mx-auto aspect-square w-60 shrink-0 rounded-3xl sm:mx-0 sm:w-72 ${sold ? 'opacity-60' : ''}`} />
          <div className="mt-6 min-w-0 sm:mt-0">
            <Link to={`/stationery?category=${encodeURIComponent(item.category)}`} className="text-sm font-semibold text-teal hover:underline">
              {item.category}
            </Link>
            <h1 className="mt-1 text-4xl font-extrabold">{item.name}</h1>
            <p className="mt-4 max-w-[60ch] leading-relaxed">{item.description}</p>
            <dl className="mt-4 grid max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt className="text-ink-soft">Turkum</dt>
              <dd className="font-medium">{item.category}</dd>
              <dt className="text-ink-soft">Mahsulot kodi</dt>
              <dd className="font-medium">{item.id.toUpperCase()}</dd>
            </dl>
            <p className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${sold ? 'text-anor' : 'text-teal'}`}>
              {!sold && <Check className="size-4" />}
              {sold ? 'Hozircha sotuvda yo‘q' : low ? `Sotuvda bor — atigi ${stock} dona qoldi` : `Sotuvda bor (${stock} dona)`}
            </p>
            <p className="mt-3 text-3xl font-extrabold">{formatPrice(item.price)}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {inCart > 0 ? (
                <QtyStepper qty={inCart} max={stock} onChange={(n) => setQty('stationery', item.id, n)} tone="dark" label={item.name} />
              ) : (
                <button
                  disabled={sold}
                  onClick={() => addToCart('stationery', item.id)}
                  className="flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-bold text-white transition-transform active:scale-[0.98] disabled:bg-mist disabled:text-ink-soft"
                >
                  <ShoppingBag className="size-5" /> Savatga qo‘shish
                </button>
              )}
            </div>
            {inCart > 0 && (
              <Link to="/cart" className="mt-3 inline-block text-sm font-semibold text-teal underline-offset-4 hover:underline">
                Savatda {inCart} dona — savatga o‘tish
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10" aria-label="Shu turkumdagi mahsulotlar">
        <h2 className="mb-3 px-4 text-[20px] font-bold">{related.length ? `Shu turkumda: ${item.category}` : 'Boshqa mahsulotlar'}</h2>
        <div className="rail">
          {more.map((s) => (
            <StationeryCard key={s.id} item={s} />
          ))}
        </div>
      </section>
    </div>
  )
}
