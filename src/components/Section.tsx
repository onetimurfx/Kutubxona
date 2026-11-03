import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="text-[22px] font-bold">{title}</h2>
        {to && (
          <Link to={to} className="text-sm font-semibold text-teal underline-offset-4 hover:underline">
            Hammasi
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
