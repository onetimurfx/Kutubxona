/** Reads an image file and returns a small JPEG data URL (max side 640 px) so it fits in localStorage. */
export function fileToDataUrl(file: File, maxSide = 640, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Faqat rasm fayllari qabul qilinadi (JPG, PNG, WebP).'))
    if (file.size > 15 * 1024 * 1024) return reject(new Error('Rasm juda katta (15 MB dan oshmasin).'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('Rasmni qayta ishlab bo‘lmadi.'))
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Rasmni o‘qib bo‘lmadi. Boshqa fayl tanlang.'))
    }
    img.src = url
  })
}
