/** ID pendek deterministik-cukup untuk data demo. */
export function uid(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${random}`
}
