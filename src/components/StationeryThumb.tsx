import { Backpack, FileText, Folder, NotebookPen, Paperclip, Pencil, PenLine, Ruler } from 'lucide-react'
import type { StationeryItem } from '../data/types'

export const ICONS = {
  notebook: NotebookPen,
  pen: PenLine,
  pencil: Pencil,
  paper: FileText,
  backpack: Backpack,
  stapler: Paperclip,
  ruler: Ruler,
  folder: Folder,
}

/** Coloured icon tile, or the product photo when the admin uploaded one. */
export function StationeryThumb({
  color,
  glyph,
  image,
  className = '',
  iconClass = 'size-1/3',
}: {
  color: string
  glyph: StationeryItem['glyph']
  image?: string
  className?: string
  iconClass?: string
}) {
  const Icon = ICONS[glyph] ?? FileText
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background: color }}>
      {image ? <img src={image} alt="" className="absolute inset-0 size-full object-cover" /> : <Icon className={`${iconClass} text-white/95`} strokeWidth={1.5} />}
    </div>
  )
}
