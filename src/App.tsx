import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Printer, Search, Settings, Shapes, User, Zap } from 'lucide-react'
import { StoreProvider, useStore } from './lib/store'
import { Intro } from './components/Intro'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { BookDetail } from './pages/BookDetail'
import { Placeholder } from './pages/Placeholder'
import { Search as SearchPage } from './pages/Search'
import { Cart } from './pages/Cart'
import { Favorites } from './pages/Favorites'

const INTRO_KEY = 'kx:intro-seen'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Toast() {
  const { toast } = useStore()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast}
          role="status"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-x-0 bottom-[96px] z-[60] mx-auto w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function seen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !seen())
  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowIntro(false)
  }, [])

  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Placeholder icon={Zap} title="Tez buyurtma" text="Buyurtma berish oqimi keyingi bosqichda ishga tushadi." />} />
            <Route path="/account" element={<Placeholder icon={User} title="Hisob" text="Profil va buyurtmalar tarixi keyingi bosqichda ishga tushadi. Sevimli kitoblaringiz hozir ham mavjud.">
              <Link to="/favorites" className="rounded-full bg-white px-6 py-3 font-semibold shadow-sm">Sevimlilar</Link>
            </Placeholder>} />
            <Route path="/stationery" element={<Placeholder icon={Shapes} title="Kanselyariya" text="Kanselyariya katalogi keyingi bosqichda ishga tushadi." />} />
            <Route path="/print" element={<Placeholder icon={Printer} title="Chop etish" text="Chop etish so‘rovi shakli keyingi bosqichda ishga tushadi." />} />
            <Route path="/admin" element={<Placeholder icon={Settings} title="Admin (demo)" text="Demo boshqaruv paneli keyingi bosqichda ishga tushadi." />} />
            <Route path="*" element={<Placeholder icon={Search} title="Sahifa topilmadi" text="Bu manzil mavjud emas." />} />
          </Routes>
        </main>
        <BottomNav />
        <Toast />
      </HashRouter>
      <AnimatePresence>{showIntro && <Intro onDone={finish} />}</AnimatePresence>
    </StoreProvider>
  )
}
