import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, Zap } from 'lucide-react'
import { BookCover } from '../components/BookCover'
import { EmptyState } from '../components/EmptyState'
import { SimilarBooks } from '../components/SimilarBooks'
import { ICONS } from '../components/StationeryCard'
import { resolveLine } from '../lib/catalog'
import { formatPrice } from '../lib/format'
import { useStore } from '../lib/store'

export function Cart() {
  const { cart, setQty, removeLine, clearCart } = useStore()
  const lines = cart.map(resolveLine).filter((l): l is NonNullable<typeof l> => l !== null)
  const count = lines.reduce((n, l) => n + l.line.qty, 0)
  const total = lines.reduce((sum, l) => sum + l.price * l.line.qty, 0)
  const bookSeeds = lines.filter((l) => l.book).map((l) => l.book!.id)

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-4xl pb-36 pt-12">
        <EmptyState icon={ShoppingBag} title="Savat bo‘sh" text="Yoqqan kitoblaringizni savatga qo‘shing — ular shu yerda saqlanadi.">
          <Link to="/search" className="rounded-full bg-ink px-6 py-3 font-semibold text-white">
            Katalogni ochish
          </Link>
          <Link to="/favorites" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm">
            Sevimlilar
          </Link>
        </EmptyState>
        <SimilarBooks seeds={['atom-odatlar', 'otkan-kunlar']} fallbackToPopular />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pb-36 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="px-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-extrabold">Savat</h1>
          <button onClick={clearCart} className="flex items-center gap-1.5 text-sm font-semibold text-anor">
            <Trash2 className="size-4" /> Savatni tozalash
          </button>
        </div>

        <div className="mt-5 md:grid md:grid-cols-[1fr_300px] md:items-start md:gap-8">
          <ul className="space-y-4">
            {lines.map((l) => {
              const Icon = l.glyph ? ICONS[l.glyph] : null
              const atMax = l.line.qty >= l.stock
              return (
                <li key={l.key} className="flex gap-4 rounded-2xl bg-white p-3 shadow-sm">
                  <div className="w-20 shrink-0 self-start">
                    {l.book ? (
                      <Link to={l.link!} aria-label={`${l.title} — batafsil`}>
                        <BookCover title={l.book.title} author={l.book.author} cover={l.book.cover} />
                      </Link>
                    ) : (
                      <div className="grid aspect-square place-items-center rounded-xl" style={{ background: l.color }}>
                        {Icon && <Icon className="size-8 text-white" strokeWidth={1.5} />}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {l.link ? (
                          <Link to={l.link} className="line-clamp-2 font-semibold leading-snug">
                            {l.title}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 font-semibold leading-snug">{l.title}</p>
                        )}
                        <p className="truncate text-sm text-ink-soft">{l.subtitle}</p>
                      </div>
                      <button
                        onClick={() => removeLine(l.line.kind, l.line.id)}
                        aria-label={`${l.title} — savatdan olib tashlash`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-paper hover:text-anor"
                      >
                        <Trash2 className="size-[18px]" />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                      <div>
                        <div className="flex items-center rounded-full bg-paper p-0.5">
                          <button onClick={() => setQty(l.line.kind, l.line.id, l.line.qty - 1)} aria-label="Kamaytirish" className="grid size-9 place-items-center rounded-full hover:bg-white">
                            <Minus className="size-4" />
                          </button>
                          <span className="min-w-8 text-center font-bold" aria-label={`Miqdor: ${l.line.qty}`}>
                            {l.line.qty}
                          </span>
                          <button
                            onClick={() => setQty(l.line.kind, l.line.id, l.line.qty + 1)}
                            disabled={atMax}
                            aria-label="Ko‘paytirish"
                            className="grid size-9 place-items-center rounded-full hover:bg-white disabled:opacity-35"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        {atMax && <p className="mt-1 text-xs font-medium text-anor">Omborda atigi {l.stock} dona</p>}
                      </div>
                      <div className="text-right leading-tight">
                        <div className="text-xs text-ink-soft">
                          {l.line.qty} × {formatPrice(l.price)}
                        </div>
                        <div className="text-lg font-extrabold">{formatPrice(l.price * l.line.qty)}</div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside className="mt-6 rounded-2xl bg-ink p-5 text-white md:sticky md:top-4 md:mt-0">
            <div className="flex justify-between text-white/75">
              <span>Mahsulotlar</span>
              <span>{count} dona</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-white/15 pt-3">
              <span className="font-semibold">Jami</span>
              <span className="text-2xl font-extrabold" data-testid="cart-total">
                {formatPrice(total)}
              </span>
            </div>
            <Link to="/order" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3.5 font-bold text-ink transition-transform active:scale-[0.98]">
              <Zap className="size-5" /> Tez buyurtmaga o‘tish
            </Link>
            <Link to="/search" className="mt-3 block rounded-full bg-white/10 px-6 py-3 text-center font-semibold hover:bg-white/15">
              Xaridni davom ettirish
            </Link>
            <p className="mt-4 text-xs text-white/60">Demo versiya: to‘lov olinmaydi, buyurtma haqiqiy do‘konga yuborilmaydi.</p>
          </aside>
        </div>
      </div>

      <SimilarBooks seeds={bookSeeds} exclude={bookSeeds} fallbackToPopular />
    </div>
  )
}
