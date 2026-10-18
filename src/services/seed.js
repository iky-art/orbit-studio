/**
 * Data demo untuk mode tanpa Firebase.
 * Semua angka & nama adalah contoh — ditandai jelas di UI sebagai data demo.
 * Deterministik (seeded PRNG) supaya tampilan stabil antar-reload.
 */

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20261017)

const pick = (list) => list[Math.floor(rnd() * list.length)]
const int = (min, max) => Math.floor(rnd() * (max - min + 1)) + min
const float = (min, max, digits = 1) =>
  Number((rnd() * (max - min) + min).toFixed(digits))
const chance = (p) => rnd() < p
const some = (list, n) => {
  const copy = [...list]
  const out = []
  for (let i = 0; i < n && copy.length; i += 1) {
    out.push(...copy.splice(Math.floor(rnd() * copy.length), 1))
  }
  return out
}

const DAY = 86400000
const NOW = Date.now()
const ago = (days) => new Date(NOW - days * DAY).toISOString()
const ahead = (days) => new Date(NOW + days * DAY).toISOString()
const id = (prefix, i) => `${prefix}_${String(i).padStart(3, '0')}`

const FIRST = [
  'Aria', 'Bagas', 'Citra', 'Damar', 'Elang', 'Farah', 'Galih', 'Hana',
  'Indra', 'Jihan', 'Kirana', 'Laras', 'Mahesa', 'Nadia', 'Okta', 'Prita',
  'Rangga', 'Sari', 'Tirta', 'Umar', 'Vina', 'Wahyu', 'Yasmin', 'Zahra',
  'Bima', 'Cahya', 'Dewi', 'Fajar', 'Gita', 'Hendra', 'Intan', 'Joko',
]
const LAST = [
  'Rahman', 'Pratama', 'Wijaya', 'Kusuma', 'Saputra', 'Halim', 'Nugroho',
  'Anggraini', 'Permata', 'Siregar', 'Lestari', 'Firmansyah', 'Hakim',
  'Maulana', 'Puspita', 'Ramadhan', 'Sudirman', 'Utami', 'Wibowo', 'Yuliana',
]
const CITIES = [
  'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Makassar',
  'Denpasar', 'Semarang', 'Balikpapan', 'Malang', 'Palembang', 'Bogor',
]
const DEVICES = ['Pixel 8', 'iPhone 15', 'Galaxy S24', 'MacBook Pro', 'ThinkPad X1', 'iPad Air', 'Redmi Note 13']
const BROWSERS = ['Chrome 132', 'Safari 18', 'Firefox 134', 'Edge 132', 'Opera 116']
const OS = ['Android 15', 'iOS 18', 'macOS 15', 'Windows 11', 'Ubuntu 24.04']

const fullName = () => `${pick(FIRST)} ${pick(LAST)}`
const emailOf = (name, i) =>
  `${name.toLowerCase().replace(/\s+/g, '.')}${i % 7 === 0 ? `.${i}` : ''}@contoh.id`

// ---------------------------------------------------------------- users
const users = Array.from({ length: 26 }, (_, i) => {
  const name = fullName()
  const role = i === 0 ? 'owner' : chance(0.18) ? 'admin' : chance(0.3) ? 'editor' : 'member'
  return {
    id: id('usr', i + 1),
    name,
    email: emailOf(name, i),
    role,
    plan: pick(['Free', 'Studio', 'Studio', 'Tim']),
    status: chance(0.82) ? 'aktif' : chance(0.5) ? 'tertunda' : 'nonaktif',
    joinedAt: ago(int(3, 420)),
    lastActiveAt: ago(float(0, 21, 2)),
    sessions: int(1, 6),
    tasksDone: int(4, 180),
    location: pick(CITIES),
  }
})

// ---------------------------------------------------------------- roles
const roles = [
  { id: 'role_01', name: 'Owner', level: 4, scope: 'Penuh', members: 1, system: true, description: 'Akses tanpa batas, termasuk tagihan dan hapus ruang kerja.', updatedAt: ago(2) },
  { id: 'role_02', name: 'Admin', level: 3, scope: 'Kelola', members: users.filter((u) => u.role === 'admin').length, system: true, description: 'Kelola pengguna, konten, dan integrasi. Tanpa akses tagihan.', updatedAt: ago(9) },
  { id: 'role_03', name: 'Editor', level: 2, scope: 'Konten', members: users.filter((u) => u.role === 'editor').length, system: false, description: 'Buat dan sunting konten serta media, tanpa pengaturan sistem.', updatedAt: ago(16) },
  { id: 'role_04', name: 'Member', level: 1, scope: 'Terbatas', members: users.filter((u) => u.role === 'member').length, system: true, description: 'Akses ruang kerja pribadi dan proyek yang diikuti.', updatedAt: ago(30) },
  { id: 'role_05', name: 'Analis', level: 2, scope: 'Baca', members: 3, system: false, description: 'Hanya baca: analitik, laporan, dan ekspor data agregat.', updatedAt: ago(21) },
  { id: 'role_06', name: 'Dukungan', level: 2, scope: 'Tiket', members: 5, system: false, description: 'Tangani tiket dan umpan balik tanpa akses data pelanggan penuh.', updatedAt: ago(6) },
]

// ---------------------------------------------------------------- teams
const TEAMS = ['Studio Produk', 'Riset & Wawasan', 'Platform', 'Pertumbuhan', 'Dukungan', 'Operasi']
const teams = TEAMS.map((name, i) => ({
  id: id('tm', i + 1),
  name,
  lead: users[i * 3]?.name ?? fullName(),
  members: int(3, 11),
  projects: int(1, 6),
  visibility: chance(0.7) ? 'publik' : 'privat',
  createdAt: ago(int(30, 500)),
}))

// ---------------------------------------------------------------- invitations
const invitations = Array.from({ length: 14 }, (_, i) => {
  const name = fullName()
  const status = pick(['terkirim', 'terkirim', 'dibuka', 'kedaluwarsa', 'diterima'])
  return {
    email: emailOf(name, i + 40),
    id: id('inv', i + 1),
    role: pick(['Admin', 'Editor', 'Member', 'Analis']),
    invitedBy: pick(users.slice(0, 6)).name,
    status,
    sentAt: ago(int(1, 30)),
    expiresAt: ahead(int(-4, 12)),
  }
})

// ---------------------------------------------------------------- sessions
const sessions = users.slice(0, 14).map((u, i) => ({
  id: id('ses', i + 1),
  user: u.name,
  email: u.email,
  device: pick(DEVICES),
  os: pick(OS),
  browser: pick(BROWSERS),
  location: pick(CITIES),
  ip: `${int(10, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
  startedAt: ago(float(0, 9, 3)),
  lastSeenAt: ago(float(0, 0.4, 4)),
  current: i < 2,
}))

// ---------------------------------------------------------------- projects
const PROJECT_NAMES = [
  'Dasbor Observasi', 'Sistem Desain v3', 'Onboarding Baru', 'Ruang Kerja Tim',
  'Mesin Laporan', 'Integrasi Kalender', 'Pusat Notifikasi', 'Toko Tema',
  'Uji Coba Fokus', 'Arsip Pengetahuan', 'Kontrol Akses', 'Panel Tagihan',
]
const projects = PROJECT_NAMES.map((name, i) => ({
  id: id('prj', i + 1),
  name,
  owner: users[i * 2]?.name ?? fullName(),
  team: pick(TEAMS),
  status: pick(['aktif', 'aktif', 'perencanaan', 'tertunda', 'selesai']),
  progress: int(8, 98),
  tasks: int(4, 46),
  priority: pick(['tinggi', 'sedang', 'sedang', 'rendah']),
  dueAt: ahead(int(-10, 90)),
}))

// ---------------------------------------------------------------- tasks
const TASK_TITLES = [
  'Rapikan komponen kartu', 'Tulis skrip onboarding', 'Audit kontras warna',
  'Optimalkan bundel awal', 'Perbaiki animasi dock', 'Siapkan data contoh',
  'Selaraskan token spasi', 'Uji alur pendaftaran', 'Dokumentasikan API',
  'Rancang eskala notifikasi', 'Bersihkan cache media', 'Tambah mode gelap',
]
const tasks = Array.from({ length: 42 }, (_, i) => ({
  id: id('tsk', i + 1),
  title: pick(TASK_TITLES),
  project: pick(projects).name,
  assignee: pick(users).name,
  status: pick(['selesai', 'berjalan', 'berjalan', 'tinjauan', 'tertunda']),
  priority: pick(['tinggi', 'sedang', 'rendah']),
  dueAt: ahead(int(-6, 30)),
  estimate: `${int(1, 13)} jam`,
}))

// ---------------------------------------------------------------- plans
const plans = [
  { id: 'plan_free', name: 'Free', priceMonthly: 0, priceYearly: 0, seats: 1, active: true, popular: false, features: ['1 ruang kerja', 'Riwayat 7 hari', 'Ekspor dasar'] },
  { id: 'plan_studio', name: 'Studio', priceMonthly: 79000, priceYearly: 790000, seats: 5, active: true, popular: true, features: ['5 anggota', 'Riwayat 1 tahun', 'Panel admin', 'Integrasi kalender'] },
  { id: 'plan_tim', name: 'Tim', priceMonthly: 249000, priceYearly: 2490000, seats: 25, active: true, popular: false, features: ['25 anggota', 'Riwayat tanpa batas', 'Peran khusus', 'Webhook & API'] },
  { id: 'plan_enterprise', name: 'Enterprise', priceMonthly: 0, priceYearly: 0, seats: 500, active: true, popular: false, features: ['SSO SAML', 'Audit lanjutan', 'Dukungan prioritas', 'SLA 99,9%'] },
  { id: 'plan_edu', name: 'Edukasi', priceMonthly: 19000, priceYearly: 190000, seats: 40, active: false, popular: false, features: ['Verifikasi kampus', '40 anggota', 'Panel admin'] },
]

// ---------------------------------------------------------------- subscriptions
const subscriptions = Array.from({ length: 30 }, (_, i) => {
  const plan = pick(plans.filter((p) => p.priceMonthly > 0))
  const seats = int(1, Math.max(2, plan.seats))
  return {
    id: id('sub', i + 1),
    customer: pick(users).name,
    plan: plan.name,
    seats,
    mrr: plan.priceMonthly * seats,
    status: pick(['aktif', 'aktif', 'aktif', 'uji coba', 'tertunda', 'batal']),
    startedAt: ago(int(20, 640)),
    renewsAt: ahead(int(1, 40)),
  }
})

// ---------------------------------------------------------------- invoices
const invoices = Array.from({ length: 34 }, (_, i) => {
  const amount = int(11, 480) * 10000
  return {
    id: id('inv', i + 1),
    number: `INV-2026-${String(1200 + i)}`,
    customer: pick(users).name,
    plan: pick(plans).name,
    amount,
    status: pick(['lunas', 'lunas', 'lunas', 'tertunda', 'gagal', 'draf']),
    issuedAt: ago(int(1, 180)),
    dueAt: ahead(int(-40, 20)),
  }
})

// ---------------------------------------------------------------- transactions
const METHODS = ['Kartu Kredit', 'Transfer Bank', 'Virtual Account', 'QRIS', 'E-Wallet', 'GoPay']
const transactions = Array.from({ length: 36 }, (_, i) => ({
  id: id('trx', i + 1),
  reference: `TRX${String(90210 + i)}`,
  customer: pick(users).name,
  method: pick(METHODS),
  amount: int(9, 520) * 10000,
  status: pick(['berhasil', 'berhasil', 'berhasil', 'tertunda', 'gagal', 'dikembalikan']),
  createdAt: ago(float(0, 60, 3)),
}))

// ---------------------------------------------------------------- coupons
const coupons = Array.from({ length: 12 }, (_, i) => ({
  id: id('cpn', i + 1),
  code: `ORBIT${pick(['NEW', 'PRO', 'TEAM', 'FOCUS', 'YEAR'])}${int(10, 99)}`,
  type: pick(['persen', 'nominal']),
  value: pick([10, 15, 20, 25, 50000, 100000]),
  redemptions: int(0, 240),
  limit: int(50, 500),
  active: chance(0.7),
  expiresAt: ahead(int(-20, 200)),
}))

// ---------------------------------------------------------------- content
const CONTENT_TITLES = [
  'Panduan memulai Orbit', 'Catatan rilis 2.4', 'Pola fokus yang bekerja',
  'Studi kasus: tim riset', 'Dokumentasi panel admin', 'Kebijakan privasi',
  'Syarat layanan', 'Tips navigasi mobile', 'Anatomi sistem desain',
  'Cara membaca analitik', 'Panduan peran & izin', 'Cerita di balik dock',
]
const content = Array.from({ length: 24 }, (_, i) => ({
  id: id('cnt', i + 1),
  title: pick(CONTENT_TITLES),
  type: pick(['artikel', 'halaman', 'catatan rilis', 'panduan']),
  author: pick(users.slice(0, 10)).name,
  status: pick(['terbit', 'terbit', 'draf', 'tinjauan', 'terjadwal']),
  views: int(40, 18400),
  locale: pick(['id', 'id', 'id', 'en']),
  updatedAt: ago(int(0, 120)),
}))

// ---------------------------------------------------------------- media
const media = Array.from({ length: 28 }, (_, i) => {
  const kind = pick(['image', 'image', 'image', 'video', 'doc', 'audio'])
  return {
    id: id('med', i + 1),
    name: `${pick(['ikon', 'banner', 'potret', 'mockup', 'denah', 'laporan', 'rekaman'])}-${i + 1}.${kind === 'video' ? 'mp4' : kind === 'doc' ? 'pdf' : kind === 'audio' ? 'mp3' : 'webp'}`,
    type: kind,
    size: int(24, 9800),
    dimensions: kind === 'image' ? `${int(400, 3200)}×${int(300, 2400)}` : '—',
    folder: pick(['Umum', 'Produk', 'Pemasaran', 'Dokumen', 'Suara']),
    uploadedBy: pick(users).name,
    uploadedAt: ago(int(0, 200)),
  }
})

// ---------------------------------------------------------------- categories
const categories = [
  { id: 'cat_01', name: 'Desain', slug: 'desain', type: 'Konten', items: 24, parent: '—' },
  { id: 'cat_02', name: 'Riset', slug: 'riset', type: 'Konten', items: 11, parent: '—' },
  { id: 'cat_03', name: 'Teknik', slug: 'teknik', type: 'Konten', items: 31, parent: '—' },
  { id: 'cat_04', name: 'Panduan', slug: 'panduan', type: 'Dokumen', items: 17, parent: 'Teknik' },
  { id: 'cat_05', name: 'Catatan Rilis', slug: 'catatan-rilis', type: 'Konten', items: 42, parent: '—' },
  { id: 'cat_06', name: 'Pemasaran', slug: 'pemasaran', type: 'Tag', items: 9, parent: '—' },
  { id: 'cat_07', name: 'Fokus', slug: 'fokus', type: 'Tag', items: 28, parent: '—' },
  { id: 'cat_08', name: 'Onboarding', slug: 'onboarding', type: 'Tag', items: 6, parent: 'Panduan' },
]

// ---------------------------------------------------------------- moderation
const moderation = Array.from({ length: 18 }, (_, i) => ({
  id: id('mod', i + 1),
  target: pick(['Komentar', 'Ulasan', 'Unggahan', 'Profil', 'Pesan']),
  preview: pick([
    'Berisi tautan mencurigakan ke situs luar.',
    'Bahasa kasar pada diskusi publik.',
    'Duplikat konten di beberapa utas.',
    'Menyesatkan — klaim tanpa sumber.',
    'Spam promosi berulang.',
  ]),
  reporter: pick(users).name,
  severity: pick(['tinggi', 'sedang', 'sedang', 'rendah']),
  status: pick(['menunggu', 'menunggu', 'ditinjau', 'selesai', 'ditolak']),
  createdAt: ago(float(0, 14, 2)),
}))

// ---------------------------------------------------------------- campaigns
const campaigns = Array.from({ length: 14 }, (_, i) => {
  const sent = int(320, 24000)
  return {
    id: id('cmp', i + 1),
    name: pick(['Rilis 2.4', 'Tips Mingguan', 'Diskon Tahunan', 'Ajak Tim', 'Fitur Baru', 'Survei Pengguna']) + ` #${i + 1}`,
    channel: pick(['Email', 'Push', 'Dalam aplikasi']),
    audience: pick(['Semua pengguna', 'Plan Studio', 'Tidak aktif 30 hari', 'Admin saja']),
    sent,
    opened: Math.round(sent * float(0.18, 0.62, 3)),
    clicked: Math.round(sent * float(0.03, 0.24, 3)),
    status: pick(['terkirim', 'terkirim', 'terjadwal', 'draf', 'dijeda']),
    scheduledAt: ahead(int(-30, 21)),
  }
})

// ---------------------------------------------------------------- notifications
const notifications = Array.from({ length: 20 }, (_, i) => ({
  id: id('ntf', i + 1),
  title: pick(['Sesi fokus selesai', 'Anggota baru bergabung', 'Tagihan jatuh tempo', 'Rilis pratinjau siap', 'Umpan balik baru', 'Kuota penyimpanan 80%']),
  body: pick([
    'Ruang kerja menyelesaikan tugas latar belakang.',
    'Tinjau sebelum jadwal berikutnya.',
    'Ada 3 item menunggu persetujuanmu.',
  ]),
  audience: pick(['Pribadi', 'Semua pengguna', 'Admin', 'Tim Platform']),
  channel: pick(['Push', 'Email', 'Dalam aplikasi']),
  status: pick(['terkirim', 'terkirim', 'tertunda', 'gagal']),
  createdAt: ago(float(0, 20, 3)),
}))

// ---------------------------------------------------------------- email templates
const emailTemplates = Array.from({ length: 12 }, (_, i) => ({
  id: id('eml', i + 1),
  name: pick(['Selamat datang', 'Verifikasi email', 'Reset sandi', 'Undangan tim', 'Faktur terbit', 'Pengingat tagihan', 'Ringkasan mingguan', 'Uji coba berakhir']),
  subject: pick(['Selamat datang di Orbit Studio', 'Verifikasi alamat emailmu', 'Atur ulang sandi akun', 'Kamu diundang ke ruang kerja']),
  locale: pick(['id', 'id', 'en']),
  status: pick(['aktif', 'aktif', 'draf']),
  opens: int(120, 5400),
  updatedAt: ago(int(1, 200)),
}))

// ---------------------------------------------------------------- feedback
const feedback = Array.from({ length: 22 }, (_, i) => ({
  id: id('fbk', i + 1),
  user: pick(users).name,
  category: pick(['Fitur', 'Bug', 'Performa', 'Desain', 'Lainnya']),
  sentiment: pick(['positif', 'positif', 'netral', 'negatif']),
  message: pick([
    'Panel admin sangat membantu, tapi pencarian perlu lebih cepat.',
    'Dock bawah terasa nyaman dipakai satu tangan.',
    'Mode gelap kurang kontras di layar terang.',
    'Ingin integrasi dengan alat manajemen tugas lain.',
    'Onboarding jelas, tapi bisa lebih singkat satu langkah.',
  ]),
  votes: int(0, 340),
  status: pick(['baru', 'baru', 'ditinjau', 'direncanakan', 'selesai']),
  createdAt: ago(int(0, 90)),
}))

// ---------------------------------------------------------------- audit log
const AUDIT_ACTIONS = ['masuk', 'keluar', 'buat pengguna', 'ubah peran', 'hapus konten', 'ubah pengaturan', 'ekspor data', 'aktifkan webhook', 'buat kunci API', 'perbarui faktur']
const auditLog = Array.from({ length: 48 }, (_, i) => ({
  id: id('aud', i + 1),
  actor: pick(users).name,
  action: pick(AUDIT_ACTIONS),
  target: pick(['usr_004', 'cnt_012', 'stg.notifications.email', 'whk_003', 'inv_009', 'plan_studio']),
  ip: `${int(10, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
  result: chance(0.9) ? 'berhasil' : 'ditolak',
  severity: pick(['info', 'info', 'info', 'peringatan', 'kritis']),
  at: ago(float(0, 30, 3)),
}))

// ---------------------------------------------------------------- security events
const security = Array.from({ length: 20 }, (_, i) => ({
  id: id('sec', i + 1),
  event: pick(['Percobaan masuk gagal', 'Perangkat baru', 'Perubahan 2FA', 'Kata sandi diubah', 'Akses dari lokasi tak biasa', 'Kunci API dibuat']),
  severity: pick(['rendah', 'sedang', 'sedang', 'tinggi', 'kritis']),
  user: pick(users).name,
  ip: `${int(10, 220)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`,
  location: pick(CITIES),
  resolved: chance(0.6),
  at: ago(float(0, 24, 3)),
}))

// ---------------------------------------------------------------- api keys
const apiKeys = Array.from({ length: 8 }, (_, i) => ({
  id: id('key', i + 1),
  label: pick(['Produksi', 'Staging', 'Analitik', 'Mobile', 'Integrasi CI', 'Laporan']),
  prefix: `orb_${Math.random().toString(36).slice(2, 10)}`,
  scopes: some(['read:users', 'write:content', 'read:analytics', 'write:webhooks', 'read:billing'], int(1, 3)),
  status: chance(0.8) ? 'aktif' : 'dicabut',
  createdAt: ago(int(5, 400)),
  lastUsedAt: ago(float(0, 12, 3)),
}))

// ---------------------------------------------------------------- webhooks
const webhooks = Array.from({ length: 9 }, (_, i) => ({
  id: id('whk', i + 1),
  url: `https://hooks.contoh.id/orbit/${pick(['events', 'billing', 'content', 'alerts'])}`,
  events: some(['user.created', 'invoice.paid', 'content.published', 'ticket.opened', 'task.completed'], int(1, 3)),
  status: chance(0.75) ? 'aktif' : 'dijeda',
  successRate: int(72, 100),
  failures: int(0, 42),
  lastDeliveryAt: ago(float(0, 6, 3)),
}))

// ---------------------------------------------------------------- feature flags
const featureFlags = Array.from({ length: 14 }, (_, i) => ({
  id: id('ffg', i + 1),
  key: pick(['panel.admin.v2', 'dock.gestur', 'sinkron.offline', 'tema.kustom', 'onboarding.pendek', 'analitik.realtime', 'ekspor.csv', 'peran.khusus']),
  description: pick(['Uji coba terbatas untuk admin.', 'Aktifkan untuk 25% pengguna.', 'Fitur eksperimental, bisa berubah.']),
  rollout: pick([0, 10, 25, 50, 75, 100]),
  audience: pick(['Semua', 'Admin', 'Plan Studio', 'Beta tester']),
  enabled: chance(0.6),
  updatedAt: ago(int(0, 60)),
}))

// ---------------------------------------------------------------- support tickets
const tickets = Array.from({ length: 26 }, (_, i) => ({
  id: id('tkt', i + 1),
  subject: pick(['Tidak bisa masuk', 'Faktur salah nominal', 'Data tidak tersinkron', 'Permintaan fitur', 'Akun terkunci', 'Bug unggah media']),
  requester: pick(users).name,
  priority: pick(['tinggi', 'sedang', 'sedang', 'rendah']),
  status: pick(['terbuka', 'terbuka', 'menunggu', 'selesai', 'ditutup']),
  assignee: pick(['Belum ditugaskan', ...users.slice(0, 6).map((u) => u.name)]),
  channel: pick(['Email', 'Dalam aplikasi', 'WhatsApp', 'Telepon']),
  messages: int(1, 14),
  updatedAt: ago(float(0, 18, 3)),
}))

// ---------------------------------------------------------------- announcements
const announcements = Array.from({ length: 10 }, (_, i) => ({
  id: id('ann', i + 1),
  title: pick(['Pemeliharaan terjadwal', 'Fitur baru: peran khusus', 'Perubahan harga', 'Peningkatan keamanan', 'Panduan baru tersedia']),
  body: 'Ringkasan singkat untuk pengguna beserta tautan ke dokumentasi.',
  audience: pick(['Semua pengguna', 'Admin', 'Plan Studio']),
  status: pick(['terbit', 'terbit', 'terjadwal', 'draf']),
  author: pick(users.slice(0, 5)).name,
  publishAt: ahead(int(-40, 20)),
}))

// ---------------------------------------------------------------- integrations
const integrations = [
  { id: 'int_01', name: 'Google Kalender', category: 'Kalender', status: 'terhubung', connectedBy: 'Aria Rahman', connectedAt: ago(40), scopes: ['calendar.read', 'calendar.write'] },
  { id: 'int_02', name: 'Slack', category: 'Pesan', status: 'terhubung', connectedBy: 'Bagas Pratama', connectedAt: ago(21), scopes: ['chat:write'] },
  { id: 'int_03', name: 'GitHub', category: 'Pengembangan', status: 'terhubung', connectedBy: 'Citra Wijaya', connectedAt: ago(64), scopes: ['repo:read', 'issues:write'] },
  { id: 'int_04', name: 'Notion', category: 'Dokumen', status: 'terputus', connectedBy: '—', connectedAt: null, scopes: [] },
  { id: 'int_05', name: 'Zapier', category: 'Otomasi', status: 'terhubung', connectedBy: 'Damar Kusuma', connectedAt: ago(12), scopes: ['hooks:trigger'] },
  { id: 'int_06', name: 'Stripe', category: 'Pembayaran', status: 'terhubung', connectedBy: 'Aria Rahman', connectedAt: ago(180), scopes: ['charges:read', 'invoices:read'] },
  { id: 'int_07', name: 'Google Analytics', category: 'Analitik', status: 'terputus', connectedBy: '—', connectedAt: null, scopes: [] },
  { id: 'int_08', name: 'Cloudinary', category: 'Media', status: 'terhubung', connectedBy: 'Farah Halim', connectedAt: ago(90), scopes: ['media:write'] },
]

// ---------------------------------------------------------------- languages
const languages = [
  { id: 'lng_01', name: 'Bahasa Indonesia', code: 'id', coverage: 100, translators: 4, status: 'primer', isDefault: true },
  { id: 'lng_02', name: 'English', code: 'en', coverage: 96, translators: 3, status: 'aktif', isDefault: false },
  { id: 'lng_03', name: 'Bahasa Melayu', code: 'ms', coverage: 61, translators: 2, status: 'aktif', isDefault: false },
  { id: 'lng_04', name: '日本語', code: 'ja', coverage: 28, translators: 1, status: 'draf', isDefault: false },
  { id: 'lng_05', name: 'Deutsch', code: 'de', coverage: 12, translators: 0, status: 'draf', isDefault: false },
]

// ---------------------------------------------------------------- system services
const systemServices = [
  { id: 'svc_01', name: 'API Gateway', region: 'asia-southeast2', status: 'sehat', latency: 84, uptime: 99.98, requests: 184200 },
  { id: 'svc_02', name: 'Basis Data', region: 'asia-southeast2', status: 'sehat', latency: 21, uptime: 99.99, requests: 92100 },
  { id: 'svc_03', name: 'Antrean Tugas', region: 'asia-southeast1', status: 'sehat', latency: 140, uptime: 99.9, requests: 41200 },
  { id: 'svc_04', name: 'Penyimpanan Media', region: 'global', status: 'degradasi', latency: 620, uptime: 99.4, requests: 12800 },
  { id: 'svc_05', name: 'Pengiriman Email', region: 'global', status: 'sehat', latency: 310, uptime: 99.7, requests: 8400 },
  { id: 'svc_06', name: 'Autentikasi', region: 'asia-southeast2', status: 'sehat', latency: 63, uptime: 99.99, requests: 33800 },
]

// ---------------------------------------------------------------- backups
const backups = Array.from({ length: 10 }, (_, i) => ({
  id: id('bkp', i + 1),
  label: pick(['Harian otomatis', 'Manual sebelum rilis', 'Mingguan']),
  size: float(120, 4200, 1),
  type: pick(['otomatis', 'otomatis', 'manual']),
  status: pick(['sukses', 'sukses', 'sukses', 'berjalan', 'gagal']),
  location: pick(['asia-southeast2', 'asia-southeast1', 'arsip dingin']),
  createdAt: ago(float(0, 60, 2)),
}))

// ---------------------------------------------------------------- saved reports
const reports = Array.from({ length: 12 }, (_, i) => ({
  id: id('rpt', i + 1),
  name: pick(['Ringkasan bulanan', 'Retensi 30 hari', 'Pendapatan per plan', 'Aktivitas tim', 'Kesehatan layanan', 'Umpan balik pengguna']) + ` ${i + 1}`,
  type: pick(['Ringkasan', 'Retensi', 'Pendapatan', 'Operasional']),
  owner: pick(users.slice(0, 6)).name,
  schedule: pick(['harian', 'mingguan', 'bulanan', 'manual']),
  format: pick(['PDF', 'CSV', 'XLSX']),
  lastRunAt: ago(float(0, 25, 3)),
}))

// ---------------------------------------------------------------- analytics series
const series = Array.from({ length: 30 }, (_, i) => ({
  date: ago(29 - i),
  aktif: int(820, 2400),
  baru: int(40, 320),
  sesi: int(1200, 4200),
  pendapatan: int(18, 96) * 100000,
}))

export const seed = {
  users,
  roles,
  teams,
  invitations,
  sessions,
  projects,
  tasks,
  plans,
  subscriptions,
  invoices,
  transactions,
  coupons,
  content,
  media,
  categories,
  moderation,
  campaigns,
  notifications,
  emailTemplates,
  feedback,
  auditLog,
  security,
  apiKeys,
  webhooks,
  featureFlags,
  tickets,
  announcements,
  integrations,
  languages,
  systemServices,
  backups,
  reports,
  series,
}

/** Akun demo untuk mode tanpa Firebase. */
export const demoAccounts = [
  {
    uid: 'demo_admin',
    name: 'Aria Rahman',
    email: 'admin@orbit.studio',
    password: 'orbit1234',
    role: 'owner',
    plan: 'Studio',
    onboarded: true,
  },
  {
    uid: 'demo_member',
    name: 'Bagas Pratama',
    email: 'anggota@orbit.studio',
    password: 'orbit1234',
    role: 'member',
    plan: 'Free',
    onboarded: false,
  },
]
