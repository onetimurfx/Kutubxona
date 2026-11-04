import { useState } from 'react'
import { Database, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { resetCatalog } from '../lib/catalogStore'
import { useStore } from '../lib/store'
import { Card, ConfirmDialog, PageHeader, btnDanger, btnGhost, btnPrimary } from './ui'

const usage = () => {
  try {
    let n = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('kx:')) n += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2
    }
    return Math.round(n / 1024)
  } catch {
    return 0
  }
}

export function AdminData() {
  const { orders, printRequests, loadSampleData, resetAll, showToast } = useStore()
  const [confirm, setConfirm] = useState<'catalog' | 'all' | null>(null)
  return (
    <>
      <PageHeader title="Ma’lumotlar" text="Demo ma’lumotlar faqat shu brauzerning localStorage xotirasida saqlanadi." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <Database className="size-6 text-teal" />
          <h2 className="mt-2 text-lg font-bold">Xotira</h2>
          <p className="mt-1 text-sm text-ink-soft">{orders.length} ta buyurtma, {printRequests.length} ta chop etish so‘rovi. Band joy: <b data-testid="ls-usage">{usage()} KB</b> (brauzer odatda ~5 MB ruxsat beradi).</p>
        </Card>
        <Card>
          <Sparkles className="size-6 text-teal" />
          <h2 className="mt-2 text-lg font-bold">Namunaviy buyurtmalar</h2>
          <p className="mt-1 text-sm text-ink-soft">Statistika uchun buyurtmalar va chop etish so‘rovlarini qo‘shadi. Zaxirani o‘zgartirmaydi.</p>
          <button onClick={loadSampleData} className={`${btnPrimary} mt-3`}>Namuna ma’lumotlarni qo‘shish</button>
        </Card>
        <Card>
          <RotateCcw className="size-6 text-saffron" />
          <h2 className="mt-2 text-lg font-bold">Katalogni tiklash</h2>
          <p className="mt-1 text-sm text-ink-soft">Kitoblar va kanselyariya boshlang‘ich holatga qaytadi (qo‘shilgan, tahrirlangan, o‘chirilganlar bekor bo‘ladi). Buyurtmalar saqlanadi.</p>
          <button onClick={() => setConfirm('catalog')} className={`${btnGhost} mt-3`}>Katalogni tiklash</button>
        </Card>
        <Card>
          <Trash2 className="size-6 text-anor" />
          <h2 className="mt-2 text-lg font-bold">Hamma demo ma’lumotni tiklash</h2>
          <p className="mt-1 text-sm text-ink-soft">Katalog, buyurtmalar, so‘rovlar, savat, sevimlilar va profil — hammasi boshlang‘ich holatga qaytadi.</p>
          <button onClick={() => setConfirm('all')} className={`${btnDanger} mt-3`}>Hammasini tiklash</button>
        </Card>
      </div>
      <ConfirmDialog open={confirm === 'catalog'} title="Katalogni tiklash" text="Katalogdagi barcha o‘zgarishlar bekor qilinadi. Davom etasizmi?" confirmLabel="Ha, tiklash" onCancel={() => setConfirm(null)} onConfirm={() => { resetCatalog(); showToast('Katalog tiklandi'); setConfirm(null) }} />
      <ConfirmDialog open={confirm === 'all'} title="Hamma ma’lumotni tiklash" text="Barcha demo ma’lumotlar (katalog, buyurtmalar, so‘rovlar, savat, sevimlilar, profil) o‘chiriladi. Davom etasizmi?" confirmLabel="Ha, hammasini tiklash" onCancel={() => setConfirm(null)} onConfirm={() => { resetAll(); setConfirm(null) }} />
    </>
  )
}
