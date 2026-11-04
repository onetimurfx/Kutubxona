import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-14 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ink text-saffron">
        <Icon className="size-8" />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-ink-soft">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}
