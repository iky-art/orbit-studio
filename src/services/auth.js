import { firebaseConfig, isFirebaseConfigured } from '../firebase/config'
import { demoAccounts } from './seed'
import { readJSON, removeKey, writeJSON } from './storage'

/**
 * Layanan autentikasi.
 *
 * Mode demo: akun contoh + pendaftaran lokal (localStorage).
 * Mode Firebase: Firebase Authentication (email/sandi) + profil di Firestore.
 * Keduanya memakai bentuk `Session` yang sama:
 *   { uid, name, email, role, plan, onboarded, createdAt }
 */

const listeners = new Set()

function emit(session) {
  listeners.forEach((fn) => {
    try {
      fn(session)
    } catch {
      /* ignore listener errors */
    }
  })
}

export function onAuthChange(callback) {
  listeners.add(callback)
  startFirebaseSync()
  return () => listeners.delete(callback)
}

// ------------------------------------------------------------- demo branch
function accounts() {
  const stored = readJSON('accounts', null)
  if (Array.isArray(stored) && stored.length) return stored
  writeJSON('accounts', demoAccounts)
  return demoAccounts
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function demoSignIn(email, password) {
  await wait(520)
  const found = accounts().find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!found) {
    const error = new Error('Email belum terdaftar.')
    error.code = 'auth/user-not-found'
    throw error
  }
  if (found.password !== password) {
    const error = new Error('Kata sandi salah.')
    error.code = 'auth/wrong-password'
    throw error
  }
  const session = {
    uid: found.uid,
    name: found.name,
    email: found.email,
    role: found.role ?? 'member',
    plan: found.plan ?? 'Free',
    onboarded: Boolean(found.onboarded),
    createdAt: found.createdAt ?? new Date().toISOString(),
  }
  writeJSON('session', session)
  emit(session)
  return session
}

async function demoSignUp({ name, email, password }) {
  await wait(640)
  const list = accounts()
  if (list.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
    const error = new Error('Email sudah digunakan.')
    error.code = 'auth/email-already-in-use'
    throw error
  }
  const account = {
    uid: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: name.trim(),
    email: email.trim(),
    password,
    role: 'member',
    plan: 'Free',
    onboarded: false,
    createdAt: new Date().toISOString(),
  }
  list.push(account)
  writeJSON('accounts', list)
  const session = { ...account }
  delete session.password
  writeJSON('session', session)
  emit(session)
  return session
}

async function demoResetPassword(email) {
  await wait(460)
  const found = accounts().some(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!found) {
    const error = new Error('Email belum terdaftar.')
    error.code = 'auth/user-not-found'
    throw error
  }
  return true
}

// ---------------------------------------------------------- firebase branch
let fbPromise = null
async function firebaseAuth() {
  if (!isFirebaseConfigured) return null
  if (!fbPromise) {
    fbPromise = (async () => {
      const [{ initializeApp, getApps }, auth, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ])
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
      return {
        auth,
        fs,
        app,
        instance: auth.getAuth(app),
        db: fs.getFirestore(app),
      }
    })()
  }
  return fbPromise
}

function profileFromDoc(uid, data, fallbackEmail) {
  return {
    uid,
    name: data?.name ?? fallbackEmail?.split('@')[0] ?? 'Pengguna',
    email: data?.email ?? fallbackEmail ?? '',
    role: data?.role ?? 'member',
    plan: data?.plan ?? 'Free',
    onboarded: Boolean(data?.onboarded),
    createdAt: data?.createdAt ?? new Date().toISOString(),
  }
}

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Email sudah digunakan. Coba masuk, bukan daftar.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/weak-password': 'Kata sandi terlalu lemah (minimal 6 karakter).',
  'auth/user-not-found': 'Email atau kata sandi salah.',
  'auth/wrong-password': 'Email atau kata sandi salah.',
  'auth/invalid-credential': 'Email atau kata sandi salah.',
  'auth/invalid-login-credentials': 'Email atau kata sandi salah.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.',
  'auth/network-request-failed': 'Tidak bisa terhubung ke Firebase. Periksa koneksi internet.',
  'auth/operation-not-allowed':
    'Login Email/Password belum diaktifkan di Firebase Console (Authentication → Sign-in method).',
  'auth/invalid-api-key': 'API key Firebase tidak valid. Periksa VITE_FIREBASE_API_KEY.',
  'auth/configuration-not-found':
    'Authentication belum diaktifkan di Firebase Console (klik Get started).',
  'permission-denied':
    'Firestore menolak akses. Periksa Rules di Firebase Console (sudah di-Publish?).',
  'not-found': 'Database Firestore belum dibuat. Buat dulu di Firebase Console → Firestore Database.',
  'failed-precondition': 'Database Firestore belum siap. Pastikan sudah dibuat di Firebase Console.',
  unavailable: 'Firestore tidak bisa dihubungi. Periksa koneksi internet.',
}

/** Ubah galat Firebase menjadi pesan Indonesia yang bisa ditindaklanjuti. */
function friendly(error) {
  const code = error?.code ?? ''
  const message = ERROR_MESSAGES[code] ?? ERROR_MESSAGES[code.replace('firestore/', '')]
  if (!message) return error
  const next = new Error(`${message} (${code})`)
  next.code = code
  return next
}

let syncStarted = false
/**
 * Sinkronkan sesi dengan Firebase Auth: keluar otomatis bila tidak lagi masuk,
 * dan segarkan profil (mis. peran yang diubah di Firestore) saat aplikasi dibuka.
 */
async function startFirebaseSync() {
  if (syncStarted || !isFirebaseConfigured) return
  syncStarted = true
  try {
    const ctx = await firebaseAuth()
    ctx.auth.onAuthStateChanged(ctx.instance, async (user) => {
      if (!user) {
        if (readJSON('session', null)) {
          removeKey('session')
          emit(null)
        }
        return
      }
      try {
        const snap = await ctx.fs.getDoc(ctx.fs.doc(ctx.db, 'users', user.uid))
        if (!snap.exists()) return // profil baru ditulis oleh signUp/signIn
        if (snap.data().status === 'nonaktif') {
          // akun dinonaktifkan admin: keluarkan dari perangkat ini
          await ctx.auth.signOut(ctx.instance)
          removeKey('session')
          emit(null)
          return
        }
        const session = profileFromDoc(user.uid, snap.data(), user.email)
        writeJSON('session', session)
        emit(session)
      } catch {
        /* luring / rules: tetap pakai sesi tersimpan */
      }
    })
  } catch {
    syncStarted = false
  }
}

// --------------------------------------------------------------- public API
export const authService = {
  getSession() {
    return readJSON('session', null)
  },

  async signIn(email, password) {
    if (!isFirebaseConfigured) return demoSignIn(email, password)
    try {
      const ctx = await firebaseAuth()
      const cred = await ctx.auth.signInWithEmailAndPassword(
        ctx.instance,
        email.trim(),
        password,
      )
      const uid = cred.user.uid
      const ref = ctx.fs.doc(ctx.db, 'users', uid)
      const snap = await ctx.fs.getDoc(ref)
      let data = snap.data()
      if (!snap.exists()) {
        // Akun Auth ada tapi profil Firestore belum tertulis (mis. pendaftaran
        // terputus). Buat profil standar agar bisa lanjut.
        data = {
          name: cred.user.email?.split('@')[0] ?? 'Pengguna',
          email: cred.user.email ?? email.trim(),
          role: 'member',
          plan: 'Free',
          status: 'aktif',
          onboarded: false,
          createdAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        }
        await ctx.fs.setDoc(ref, data)
      }
      if (data.status === 'nonaktif') {
        await ctx.auth.signOut(ctx.instance)
        const blocked = new Error(
          'Akun ini dinonaktifkan oleh admin. Hubungi admin untuk mengaktifkannya kembali.',
        )
        blocked.code = 'app/account-disabled'
        throw blocked
      }
      ctx.fs
        .setDoc(ref, { lastActiveAt: new Date().toISOString() }, { merge: true })
        .catch(() => {})
      const session = profileFromDoc(uid, data, cred.user.email)
      writeJSON('session', session)
      emit(session)
      return session
    } catch (error) {
      throw friendly(error)
    }
  },

  async signUp({ name, email, password }) {
    if (!isFirebaseConfigured) return demoSignUp({ name, email, password })
    try {
      const ctx = await firebaseAuth()
      const cred = await ctx.auth.createUserWithEmailAndPassword(
        ctx.instance,
        email.trim(),
        password,
      )
      const record = {
        name: name.trim(),
        email: email.trim(),
        role: 'member',
        plan: 'Free',
        status: 'aktif',
        onboarded: false,
        createdAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      }
      await ctx.fs.setDoc(ctx.fs.doc(ctx.db, 'users', cred.user.uid), record)
      const session = profileFromDoc(cred.user.uid, record, email)
      writeJSON('session', session)
      emit(session)
      return session
    } catch (error) {
      throw friendly(error)
    }
  },

  async signOut() {
    if (isFirebaseConfigured) {
      const ctx = await firebaseAuth()
      if (ctx) await ctx.auth.signOut(ctx.instance)
    }
    removeKey('session')
    emit(null)
  },

  async resetPassword(email) {
    if (!isFirebaseConfigured) return demoResetPassword(email)
    const ctx = await firebaseAuth()
    await ctx.auth.sendPasswordResetEmail(ctx.instance, email)
    return true
  },

  async updateProfile(patch) {
    const current = readJSON('session', null)
    if (!current) return null
    const next = { ...current, ...patch }
    if (isFirebaseConfigured) {
      const ctx = await firebaseAuth()
      if (ctx) {
        try {
          await ctx.fs.setDoc(ctx.fs.doc(ctx.db, 'users', current.uid), patch, {
            merge: true,
          })
        } catch (error) {
          throw friendly(error)
        }
      }
    } else {
      const list = accounts().map((account) =>
        account.uid === current.uid ? { ...account, ...patch } : account,
      )
      writeJSON('accounts', list)
    }
    writeJSON('session', next)
    emit(next)
    return next
  },

  /** Untuk mode demo: sinkronkan perubahan akun contoh tanpa login ulang. */
  async refresh() {
    const current = readJSON('session', null)
    if (current) emit(current)
    return current
  },
}
