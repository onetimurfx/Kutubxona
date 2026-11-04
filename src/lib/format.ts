export const formatPrice = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ') + " so'm"

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0

/** Uzbek mobile numbers: +998 90 123 45 67 (9 digits after the country code) */
export const phoneDigits = (raw: string) => {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  return d.slice(0, 9)
}

export function formatPhone(raw: string) {
  const d = phoneDigits(raw)
  if (!d) return ''
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return '+998 ' + parts.join(' ')
}

export const isValidPhone = (raw: string) => phoneDigits(raw).length === 9

const two = (n: number) => String(n).padStart(2, '0')
export function formatDateTime(ts: number) {
  const d = new Date(ts)
  return `${two(d.getDate())}.${two(d.getMonth() + 1)}.${d.getFullYear()}, ${two(d.getHours())}:${two(d.getMinutes())}`
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
