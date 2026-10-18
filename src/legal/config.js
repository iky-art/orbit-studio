/** Pengaturan yang dipakai halaman legal. */
export const LEGAL = {
  company: 'Orbit Studio',
  product: 'Orbit Studio Workbench',
  updated: '18 Oktober 2026',
  // Isi lewat VITE_CONTACT_EMAIL di .env.local / variabel Cloudflare Pages.
  email: (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim(),
}

/** Kalimat kontak: memakai email bila diisi, kalau tidak, kanal resmi umum. */
export function contactLine() {
  return LEGAL.email
    ? `Hubungi kami di ${LEGAL.email}.`
    : 'Hubungi kami melalui kanal kontak resmi Orbit Studio yang tercantum di halaman utama.'
}
