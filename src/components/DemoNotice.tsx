import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

/** Marks a simulated operation so nobody mistakes the demo for a real shop. */
export function DemoNotice({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div role="note" className={`flex gap-3 rounded-2xl bg-saffron/20 p-3.5 text-sm leading-snug ${className}`}>
      <Info className="mt-0.5 size-5 shrink-0 text-ink" />
      <p>
        <span className="mr-1.5 rounded bg-saffron px-1.5 py-0.5 text-[11px] font-bold">DEMO</span>
        {children}
      </p>
    </div>
  )
}
