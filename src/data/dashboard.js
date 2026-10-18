/* Contoh data demo — bukan data produksi. */

export const user = {
  name: 'Aria Rahman',
  role: 'Product Designer',
  initials: 'AR',
}

export const metrics = [
  {
    id: 'projects',
    label: 'Proyek aktif',
    value: 12,
    unit: 'proyek',
    delta: 8.4,
    trend: 'up',
    icon: 'layers',
    spark: [7, 9, 8, 10, 9, 11, 12],
  },
  {
    id: 'focus',
    label: 'Jam fokus',
    value: 34.5,
    unit: 'jam',
    delta: 12.1,
    trend: 'up',
    icon: 'zap',
    spark: [22, 26, 24, 29, 27, 32, 34.5],
  },
  {
    id: 'completion',
    label: 'Penyelesaian',
    value: 92,
    unit: '%',
    delta: -3.2,
    trend: 'down',
    icon: 'check',
    spark: [95, 94, 96, 93, 95, 93.5, 92],
  },
]

export const week = [
  { day: 'Sen', value: 4.5 },
  { day: 'Sel', value: 6.2 },
  { day: 'Rab', value: 5.1 },
  { day: 'Kam', value: 7.4 },
  { day: 'Jum', value: 6.8, today: true },
  { day: 'Sab', value: 3.2 },
  { day: 'Min', value: 1.5 },
]

export const insights = {
  tiles: [
    { id: 'streak', label: 'Rentetan fokus', value: '9 hari', note: 'Rekor pribadi: 11 hari' },
    { id: 'avg', label: 'Rata-rata sesi', value: '48 mnt', note: 'Naik 6 menit dari minggu lalu' },
    { id: 'best', label: 'Jam terbaik', value: '09–11', note: 'Penyelesaian tertinggi di pagi hari' },
    { id: 'tasks', label: 'Tugas selesai', value: '28', note: 'Dari 31 tugas minggu ini' },
  ],
  breakdown: [
    { id: 'design', label: 'Desain produk', value: 42 },
    { id: 'research', label: 'Riset & uji', value: 27 },
    { id: 'meeting', label: 'Rapat tim', value: 19 },
    { id: 'admin', label: 'Administrasi', value: 12 },
  ],
}

export const activity = [
  {
    id: 'a1',
    type: 'focus',
    title: 'Sesi fokus selesai',
    meta: 'Desain ulang dasbor — 50 menit',
    time: '09:24',
    icon: 'zap',
    tone: 'lime',
  },
  {
    id: 'a2',
    type: 'design',
    title: 'Berkas desain dikirim',
    meta: 'Orbit Design System v2.3',
    time: '08:52',
    icon: 'layers',
    tone: 'plain',
  },
  {
    id: 'a3',
    type: 'deploy',
    title: 'Rilis pratinjau',
    meta: 'preview/orbit-observatory · build 128',
    time: '08:15',
    icon: 'send',
    tone: 'plain',
  },
  {
    id: 'a4',
    type: 'collab',
    title: 'Ulasan tim diposting',
    meta: '3 komentar pada alur onboarding',
    time: '07:40',
    icon: 'users',
    tone: 'plain',
  },
  {
    id: 'a5',
    type: 'review',
    title: 'Permintaan gabungan ditinjau',
    meta: '#412 — pembersihan komponen kartu',
    time: 'Kemarin',
    icon: 'code',
    tone: 'plain',
  },
  {
    id: 'a6',
    type: 'focus',
    title: 'Sesi fokus selesai',
    meta: 'Riset pola navigasi mobile — 45 menit',
    time: 'Kemarin',
    icon: 'zap',
    tone: 'lime',
  },
  {
    id: 'a7',
    type: 'design',
    title: 'Prototipe diperbarui',
    meta: 'Alur fokus & istirahat',
    time: 'Kemarin',
    icon: 'layers',
    tone: 'plain',
  },
  {
    id: 'a8',
    type: 'deploy',
    title: 'Pratinjau dipromosikan',
    meta: 'preview → staging',
    time: '2 hari lalu',
    icon: 'send',
    tone: 'plain',
  },
  {
    id: 'a9',
    type: 'collab',
    title: 'Catatan rapi disinkronkan',
    meta: '5 item agenda sprint 14',
    time: '2 hari lalu',
    icon: 'users',
    tone: 'plain',
  },
]

export const activityFilters = [
  { id: 'all', label: 'Semua' },
  { id: 'focus', label: 'Fokus' },
  { id: 'design', label: 'Desain' },
  { id: 'deploy', label: 'Rilis' },
  { id: 'review', label: 'Tinjauan' },
  { id: 'collab', label: 'Kolaborasi' },
]
