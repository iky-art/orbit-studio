/** Pesan status untuk pemuatan data Firestore. */
export function DataNotice({ status, error }) {
  if (status === 'loading') return <p className="section-note">Memuat data…</p>
  if (status !== 'error') return null
  const code = error?.code ?? ''
  const text =
    code === 'permission-denied'
      ? 'Firestore menolak akses ke koleksi "activities". Perbarui Rules di Firebase Console (lihat README → Setup Firebase) lalu muat ulang.'
      : `Gagal memuat data (${code || 'galat tak dikenal'}). Periksa koneksi dan konfigurasi Firebase.`
  return (
    <p className="field-error" role="alert">
      {text}
    </p>
  )
}
