/**
 * Susun deret harian (30 hari) dari data nyata:
 * - baru: akun yang mendaftar di hari itu
 * - aktif: pengguna unik yang aktif (masuk atau mencatat aktivitas)
 * - sesi: jumlah catatan aktivitas
 * - pendapatan: 0 (belum ada sistem pembayaran)
 */
export function buildSeries(users, activities, days = 30, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const map = new Map()
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(start)
    day.setDate(day.getDate() - i)
    map.set(key(day), { date: day.toISOString(), aktif: new Set(), baru: 0, sesi: 0, pendapatan: 0 })
  }
  const bucket = (iso) => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : (map.get(key(d)) ?? null)
  }
  users.forEach((user) => {
    const joined = bucket(user.joinedAt ?? user.createdAt)
    if (joined) joined.baru += 1
    const seen = bucket(user.lastActiveAt)
    if (seen) seen.aktif.add(user.id)
  })
  activities.forEach((item) => {
    const b = bucket(item.createdAt)
    if (b) {
      b.sesi += 1
      b.aktif.add(item.uid ?? item.id)
    }
  })
  return Array.from(map.values()).map((b) => ({ ...b, aktif: b.aktif.size }))
}
