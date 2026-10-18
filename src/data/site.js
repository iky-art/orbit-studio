// ------------------------------------------------------------------
// Konten situs Orbit Studio.
// Semua teks yang tampil di website bersumber dari file ini.
// ------------------------------------------------------------------

export const SITE = {
  name: 'Orbit Studio',
  tagline: 'Precision in Motion',
  year: '2026',
  location: 'Indonesia',
  founders: ['Iky', 'Lana', 'Dei'],
  // Ganti dengan alamat email resmi Orbit Studio.
  email: 'hello@orbitstudio.id',
  // Tambahkan sosial resmi di sini setelah URL tersedia, contoh:
  // socials: [{ label: 'Instagram', href: 'https://instagram.com/…' }]
  // Biarkan kosong agar tidak ada tautan yang tidak benar-benar ada.
  socials: [],
}

export const NAV = [
  { id: 'work', label: 'Work', index: '02' },
  { id: 'people', label: 'About', index: '03' },
  { id: 'make', label: 'Services', index: '04' },
  { id: 'contact', label: 'Contact', index: '06' },
]

export const SECTIONS = [
  { id: 'work', index: '02', label: 'Selected Work' },
  { id: 'people', index: '03', label: 'The People' },
  { id: 'make', index: '04', label: 'What We Make' },
  { id: 'system', index: '05', label: 'Orbit System' },
  { id: 'contact', index: '06', label: 'Contact' },
]

export const MARQUEE_ITEMS = [
  'Digital Products',
  'Web',
  'Applications',
  'Experiments',
  'Creative Technology',
  'Design Systems',
  'Interaction',
]

export const PROJECTS = [
  {
    index: '01',
    name: 'NovaTalk',
    category: 'Community / Product',
    year: '2024',
    poster: 'signal',
    figure: 'Signal field',
    description:
      'A conversation platform built around small, focused rooms rather than one endless feed.',
    notes: ['Realtime', 'Web', 'Design system'],
    align: 'right',
  },
  {
    index: '02',
    name: 'DropZone',
    category: 'Utility / Product',
    year: '2024',
    poster: 'grid',
    figure: 'Transfer grid',
    description:
      'A file transfer tool that keeps the interface out of the way. Send, receive, done.',
    notes: ['Web', 'P2P', 'Minimal UI'],
    align: 'left',
  },
  {
    index: '03',
    name: 'Nagi',
    category: 'Weather / Product',
    year: '2023',
    poster: 'waves',
    figure: 'Pressure waves',
    description:
      'A weather app that reads the day in a single glance, without the dashboard noise.',
    notes: ['Mobile', 'Data viz', 'Product design'],
    align: 'right',
  },
  {
    index: '04',
    name: 'Atlas',
    category: 'AI / Experiment',
    year: '2024',
    poster: 'network',
    figure: 'Node map',
    description:
      'An ongoing experiment in turning written material into spatial, explorable structures.',
    notes: ['Experiment', 'Generative', 'Interface'],
    align: 'left',
  },
]

export const SERVICES = [
  {
    index: '01',
    name: 'Web',
    description:
      'Sites and web applications built by hand, tuned for speed, accessibility and long-term editing.',
  },
  {
    index: '02',
    name: 'App',
    description:
      'Mobile applications where the interface stays quiet and the interaction does the talking.',
  },
  {
    index: '03',
    name: 'Product',
    description:
      'From an early sketch to something people can use. Scoping, structure, and the unglamorous details.',
  },
  {
    index: '04',
    name: 'Design',
    description:
      'Typography, layout, and visual systems that hold together as the product grows.',
  },
  {
    index: '05',
    name: 'Experiments',
    description:
      'Space we keep open for ideas without a client or a deadline. Some become products, all become lessons.',
  },
]

export const FOUNDERS = [
  {
    index: '01',
    name: 'Iky',
    role: 'Developer · Founder · Builder',
    glyph: 'square',
    note: 'Writes the code, builds the systems, keeps things running.',
  },
  {
    index: '02',
    name: 'Lana',
    role: 'Founder',
    glyph: 'arcs',
    note: 'Shapes the work and the direction it moves in.',
  },
  {
    index: '03',
    name: 'Dei',
    role: 'Founder',
    glyph: 'triangle',
    note: 'Explores the ideas, tests them, and pushes them further.',
  },
]

export const SYSTEM_LINES = [
  { index: '01', text: 'We build.' },
  { index: '02', text: 'We test.' },
  { index: '03', text: 'We break.' },
  { index: '04', text: 'We rebuild.' },
]
