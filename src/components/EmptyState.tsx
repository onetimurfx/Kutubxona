import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ icon: Icon, title, text, children, as: Heading = 'h2' }: { icon: LucideIcon; title: string; text: string; children?: ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div className="mx-auto max-w-md px-6 py-14 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-ink text-saffron">
        <Icon className="size-8" />
      </div>
      <Heading className="mt-5 text-2xl font-extrabold">{title}</Heading>
      <p className="mt-2 text-ink-soft">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}
