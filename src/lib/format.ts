export const formatPrice = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ') + " so'm"

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0
