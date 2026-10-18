/** Pemformat angka/tanggal untuk locale Indonesia. Aman tanpa Intl penuh. */

const numberFmt = new Intl.NumberFormat('id-ID')
const compactFmt = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const currencyFmt = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const formatNumber = (value) => numberFmt.format(Number(value) || 0)
export const formatCompact = (value) => compactFmt.format(Number(value) || 0)
export const formatCurrency = (value) => currencyFmt.format(Number(value) || 0)
export const formatPercent = (value) =>
  `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(
    Number(value) || 0,
  )}%`

export function formatDate(value, options) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** "3 menit lalu" — relatif terhadap sekarang. */
export function formatRelative(value, now = Date.now()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const diff = date.getTime() - now
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  const table = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['week', 604800000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ]
  for (const [unit, ms] of table) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit)
  }
  return rtf.format(Math.round(diff / 1000), 'second')
}

export function initialsFrom(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

export function slugify(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
