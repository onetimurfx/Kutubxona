import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Placeholder({ title, text, icon: Icon, children }: { title: string; text: string; icon: LucideIcon; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 pb-36 pt-28 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ink text-saffron">
        <Icon className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-ink-soft">{text}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
      <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3.5 font-semibold text-white">
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}
