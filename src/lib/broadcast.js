/** Konstanta dan helper bersama untuk fitur Broadcast. */

export const BROADCAST_TONES = [
  { id: 'info', label: 'Info', icon: 'info' },
  { id: 'success', label: 'Kabar baik', icon: 'check' },
  { id: 'warning', label: 'Peringatan', icon: 'alert' },
  { id: 'danger', label: 'Penting', icon: 'alert' },
]

export const BROADCAST_AUDIENCES = [
  { id: 'all', label: 'Semua pengguna' },
  { id: 'member', label: 'Anggota saja' },
  { id: 'admin', label: 'Admin saja' },
]

export const BROADCAST_DURATIONS = [
  { id: '1h', label: '1 jam', ms: 3600000 },
  { id: '24h', label: '24 jam', ms: 86400000 },
  { id: '7d', label: '7 hari', ms: 604800000 },
  { id: 'none', label: 'Sampai dihentikan', ms: 0 },
]

const isAdminRole = (role) => role === 'owner' || role === 'admin'

/** Apakah pengguna dengan `role` termasuk audiens broadcast ini. */
export function audienceMatches(audience, role) {
  if (audience === 'admin') return isAdminRole(role)
  if (audience === 'member') return !isAdminRole(role)
  return true
}

/** 'aktif' | 'berakhir' | 'dihentikan' */
export function broadcastState(item, now = Date.now()) {
  if (item.active === false) return 'dihentikan'
  if (item.expiresAt && new Date(item.expiresAt).getTime() <= now) return 'berakhir'
  return 'aktif'
}
