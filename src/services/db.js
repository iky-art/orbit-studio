import { firebaseConfig, isFirebaseConfigured } from '../firebase/config'
import { seed } from './seed'
import { readJSON, writeJSON } from './storage'

/**
 * Lapisan data tunggal.
 *
 * - Mode demo (tanpa konfigurasi Firebase): data dari `seed`, mutasi disimpan
 *   di localStorage sehingga perubahan bertahan saat reload.
 * - Mode Firebase (VITE_FIREBASE_* terisi): baca/tulis ke Cloud Firestore
 *   dengan bentuk dokumen yang sama. SDK diimpor dinamis agar tidak masuk
 *   bundel awal saat mode demo.
 */

export const DEMO_MODE = !isFirebaseConfigured
export const demoAccountHint = DEMO_MODE

export const COLLECTIONS = Object.keys(seed)

const memory = new Map()
/** Lengkapi dokumen pengguna lama agar konsol admin tidak menampilkan kolom kosong. */
function normalizeRow(name, row) {
  if (name !== 'users') return row
  return {
    ...row,
    status: row.status ?? 'aktif',
    role: row.role ?? 'member',
    plan: row.plan ?? 'Free',
    joinedAt: row.joinedAt ?? row.createdAt,
    lastActiveAt: row.lastActiveAt ?? row.createdAt,
  }
}

const latency = () => new Promise((r) => setTimeout(r, 180 + Math.random() * 220))

function demoList(name) {
  if (memory.has(name)) return memory.get(name)
  const stored = readJSON(`db:${name}`, null)
  const value = Array.isArray(stored) ? stored : seed[name] ?? []
  memory.set(name, value)
  return value
}

function persist(name) {
  writeJSON(`db:${name}`, memory.get(name) ?? [])
}

let sdkPromise = null
async function firestore() {
  if (!isFirebaseConfigured) return null
  if (!sdkPromise) {
    sdkPromise = (async () => {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore'),
      ])
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
      return { app, fs, db: fs.getFirestore(app) }
    })()
  }
  return sdkPromise
}

async function fbList(name) {
  const ctx = await firestore()
  if (!ctx) return null
  const { fs, db } = ctx
  const snap = await fs.getDocs(fs.collection(db, name))
  return snap.docs.map((d) => normalizeRow(name, { id: d.id, ...d.data() }))
}

export async function list(name) {
  if (!COLLECTIONS.includes(name) && DEMO_MODE) return []
  if (!DEMO_MODE) {
    const rows = await fbList(name)
    if (rows) return rows
  }
  await latency()
  return demoList(name).map((row) => ({ ...row }))
}

/**
 * Berlangganan koleksi secara real-time.
 * - Mode Firebase: `onSnapshot` Firestore — setiap perubahan (dari perangkat
 *   atau orang lain) langsung dikirim ke `onData`.
 * - Mode demo: sekali muat saja (data lokal).
 * Mengembalikan fungsi untuk berhenti berlangganan.
 */
export function subscribe(name, onData, onError) {
  if (DEMO_MODE) {
    let active = true
    list(name)
      .then((rows) => active && onData(rows))
      .catch((error) => active && onError?.(error))
    return () => {
      active = false
    }
  }
  let cancelled = false
  let unsubscribe = null
  firestore()
    .then((ctx) => {
      if (cancelled || !ctx) return
      const { fs, db } = ctx
      unsubscribe = fs.onSnapshot(
        fs.collection(db, name),
        (snap) => onData(snap.docs.map((d) => normalizeRow(name, { id: d.id, ...d.data() }))),
        (error) => onError?.(error),
      )
    })
    .catch((error) => {
      if (!cancelled) onError?.(error)
    })
  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

/**
 * Berlangganan dokumen koleksi yang `field == value` secara real-time.
 * Sengaja tanpa orderBy agar tidak butuh indeks komposit; urutkan di klien.
 */
export function subscribeWhere(name, field, value, onData, onError) {
  if (DEMO_MODE) {
    onData([])
    return () => {}
  }
  let cancelled = false
  let unsubscribe = null
  firestore()
    .then((ctx) => {
      if (cancelled || !ctx) return
      const { fs, db } = ctx
      unsubscribe = fs.onSnapshot(
        fs.query(fs.collection(db, name), fs.where(field, '==', value)),
        (snap) => onData(snap.docs.map((d) => normalizeRow(name, { id: d.id, ...d.data() }))),
        (error) => onError?.(error),
      )
    })
    .catch((error) => {
      if (!cancelled) onError?.(error)
    })
  return () => {
    cancelled = true
    unsubscribe?.()
  }
}

export async function update(name, id, patch) {
  if (!DEMO_MODE) {
    const ctx = await firestore()
    if (ctx) {
      const { fs, db } = ctx
      await fs.updateDoc(fs.doc(db, name, id), patch)
      return { id, ...patch }
    }
  }
  await latency()
  const rows = demoList(name)
  const index = rows.findIndex((row) => String(row.id) === String(id))
  if (index === -1) return null
  const next = { ...rows[index], ...patch }
  rows[index] = next
  persist(name)
  return { ...next }
}

export async function remove(name, id) {
  if (!DEMO_MODE) {
    const ctx = await firestore()
    if (ctx) {
      const { fs, db } = ctx
      await fs.deleteDoc(fs.doc(db, name, id))
      return true
    }
  }
  await latency()
  const rows = demoList(name)
  const index = rows.findIndex((row) => String(row.id) === String(id))
  if (index === -1) return false
  rows.splice(index, 1)
  persist(name)
  return true
}

export async function create(name, doc) {
  const id =
    doc.id ??
    `${name.slice(0, 3)}_${Math.random().toString(36).slice(2, 8)}${Date.now()
      .toString(36)
      .slice(-3)}`
  const record = { ...doc, id }
  if (!DEMO_MODE) {
    const ctx = await firestore()
    if (ctx) {
      const { fs, db } = ctx
      await fs.setDoc(fs.doc(db, name, id), record)
      return record
    }
  }
  await latency()
  const rows = demoList(name)
  rows.unshift(record)
  persist(name)
  return record
}

/** Kembalikan seluruh dataset ke kondisi seed (mode demo). */
export function resetDemoData() {
  memory.clear()
  COLLECTIONS.forEach((name) => writeJSON(`db:${name}`, seed[name] ?? []))
}
