const OK = new Set([
  'aktif', 'berhasil', 'sukses', 'lunas', 'terbit', 'terhubung', 'sehat',
  'positif', 'selesai', 'diterima', 'ya', 'resolved', 'primer', 'dibuka',
  'berlangsung', 'tinggi-ok',
])
const WARN = new Set([
  'tertunda', 'menunggu', 'ditinjau', 'terjadwal', 'draf', 'berjalan',
  'dijeda', 'degradasi', 'sedang', 'perencanaan', 'berjalan-lambat', 'uji coba',
])
const DANGER = new Set([
  'nonaktif', 'gagal', 'ditolak', 'dicabut', 'kritis', 'negatif',
  'kedaluwarsa', 'terputus', 'dibatalkan', 'batal', 'tinggi',
])
const INFO = new Set(['info', 'publik', 'privat', 'rendah', 'baru', 'terkirim'])

export function badgeTone(value) {
  const key = String(value ?? '').toLowerCase()
  if (OK.has(key)) return 'ok'
  if (WARN.has(key)) return 'warn'
  if (DANGER.has(key)) return 'danger'
  if (INFO.has(key)) return 'info'
  return 'neutral'
}

export function Badge({ children, tone, dot = true }) {
  const resolved = tone ?? badgeTone(children)
  return (
    <span className={`badge badge-${resolved}`}>
      {dot ? <span className="badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

export function SeverityMark({ value }) {
  const key = String(value ?? '').toLowerCase()
  const map = { kritis: 'danger', tinggi: 'danger', sedang: 'warn', rendah: 'info', info: 'neutral', peringatan: 'warn' }
  const tone = map[key] ?? 'neutral'
  return (
    <span className={`sev sev-${tone}`}>
      <i aria-hidden="true" />
      {value}
    </span>
  )
}
