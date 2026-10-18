/**
 * Konfigurasi Firebase.
 *
 * Isi nilai-nilai berikut di `.env.local` (lihat `.env.example`).
 * Bila kosong, aplikasi berjalan penuh dalam MODE DEMO memakai data lokal —
 * semua layar, panel admin, dan pengaturan tetap berfungsi.
 */

const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

export const MODE = isFirebaseConfigured ? 'firebase' : 'demo'
