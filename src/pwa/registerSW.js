/** Daftarkan service worker hanya pada build produksi (agar dev/HMR bersih). */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        /* pendaftaran gagal — aplikasi tetap berjalan */
      })
  })
}
