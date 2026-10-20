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
    dailyTarget: Number(found.dailyTarget) || 0,
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
    dailyTarget: Number(data?.dailyTarget) || 0,
    createdAt: data?.createdAt ?? new Date().toISOString(),
  }
}

/** Sesi aplikasi dari akun Firebase + dokumen profil. */
function sessionFrom(user, data) {
  return {
    ...profileFromDoc(user.uid, data, user.email),
    emailVerified: Boolean(user.emailVerified),
    provider: user.providerData?.[0]?.providerId ?? 'password',
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
    'Metode login ini belum diaktifkan di Firebase Console (Authentication → Sign-in method).',
  'auth/popup-closed-by-user': 'Jendela login ditutup sebelum selesai.',
  'auth/cancelled-popup-request': 'Login dibatalkan. Coba lagi.',
  'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.',
  'auth/account-exists-with-different-credential':
    'Email ini sudah terdaftar dengan metode lain. Masuk dengan email dan kata sandi.',
  'auth/requires-recent-login': 'Sesi terlalu lama. Keluar, masuk lagi, lalu ulangi.',
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
        const session = sessionFrom(user, snap.data())
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
      const session = sessionFrom(cred.user, data)
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
      ctx.auth.sendEmailVerification(cred.user).catch(() => {})
      const session = sessionFrom(cred.user, record)
      writeJSON('session', session)
      emit(session)
      return session
    } catch (error) {
      throw friendly(error)
    }
  },

  /** Masuk atau daftar dengan akun Google (butuh Google diaktifkan di Firebase). */
  async signInWithGoogle() {
    if (!isFirebaseConfigured) {
      throw new Error('Login Google hanya tersedia di mode Firebase.')
    }
    try {
      const ctx = await firebaseAuth()
      const provider = new ctx.auth.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const cred = await ctx.auth.signInWithPopup(ctx.instance, provider)
      const user = cred.user
      const ref = ctx.fs.doc(ctx.db, 'users', user.uid)
      const snap = await ctx.fs.getDoc(ref)
      let data = snap.data()
      if (!snap.exists()) {
        const now = new Date().toISOString()
        data = {
          name: user.displayName || user.email?.split('@')[0] || 'Pengguna',
          email: user.email ?? '',
          role: 'member',
          plan: 'Free',
          status: 'aktif',
          onboarded: false,
          createdAt: now,
          joinedAt: now,
          lastActiveAt: now,
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
      const session = sessionFrom(user, data)
      writeJSON('session', session)
      emit(session)
      return session
    } catch (error) {
      throw friendly(error)
    }
  },

  /** Kirim ulang email verifikasi ke akun yang sedang masuk. */
  async sendVerification() {
    if (!isFirebaseConfigured) return false
    try {
      const ctx = await firebaseAuth()
      const user = ctx.instance.currentUser
      if (!user) throw new Error('Sesi berakhir. Masuk lagi lalu coba kirim ulang.')
      await ctx.auth.sendEmailVerification(user)
      return true
    } catch (error) {
      throw friendly(error)
    }
  },

  /** Muat ulang status verifikasi email dari Firebase. */
  async refreshVerification() {
    if (!isFirebaseConfigured) return true
    const ctx = await firebaseAuth()
    const user = ctx.instance.currentUser
    if (!user) return false
    await user.reload()
    const current = readJSON('session', null)
    if (current) {
      const next = { ...current, emailVerified: Boolean(user.emailVerified) }
      writeJSON('session', next)
      emit(next)
    }
    return Boolean(user.emailVerified)
  },

  /** Kumpulkan semua data milik pengguna untuk diunduh. */
  async exportMyData() {
    const current = readJSON('session', null)
    if (!current) throw new Error('Masuk dulu untuk mengekspor data.')
    const out = { app: 'Orbit Studio', exportedAt: new Date().toISOString() }
    if (!isFirebaseConfigured) {
      return { ...out, mode: 'demo', profile: current }
    }
    try {
      const ctx = await firebaseAuth()
      const uid = current.uid
      const profile = await ctx.fs.getDoc(ctx.fs.doc(ctx.db, 'users', uid))
      out.mode = 'firebase'
      out.profile = profile.exists() ? { id: uid, ...profile.data() } : null
      const prefs = await ctx.fs.getDoc(ctx.fs.doc(ctx.db, 'userSettings', uid))
      out.settings = prefs.exists() ? prefs.data().values ?? null : null
      for (const name of ['activities', 'tickets', 'feedback', 'memberships']) {
        const snap = await ctx.fs.getDocs(
          ctx.fs.query(ctx.fs.collection(ctx.db, name), ctx.fs.where('uid', '==', uid)),
        )
        out[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      }
      out.teamMessages = []
      for (const membership of out.memberships) {
        const messages = await ctx.fs.getDocs(
          ctx.fs.query(
            ctx.fs.collection(ctx.db, 'teams', membership.teamId, 'messages'),
            ctx.fs.where('uid', '==', uid),
          ),
        )
        out.teamMessages.push(
          ...messages.docs.map((d) => ({ id: d.id, teamId: membership.teamId, ...d.data() })),
        )
      }
      return out
    } catch (error) {
      throw friendly(error)
    }
  },

  /**
   * Hapus akun dan seluruh data milik pengguna. Mode Firebase meminta
   * konfirmasi ulang (kata sandi atau popup Google) sebelum menghapus apa pun.
   */
  async deleteAccount({ password } = {}) {
    const current = readJSON('session', null)
    if (!current) throw new Error('Tidak ada sesi yang aktif.')
    if (!isFirebaseConfigured) {
      writeJSON(
        'accounts',
        accounts().filter((account) => account.uid !== current.uid),
      )
      removeKey('session')
      emit(null)
      return true
    }
    try {
      const ctx = await firebaseAuth()
      const user = ctx.instance.currentUser
      if (!user) throw new Error('Sesi berakhir. Masuk lagi lalu ulangi.')

      if (user.providerData.some((item) => item.providerId === 'password')) {
        if (!password) throw new Error('Masukkan kata sandimu untuk konfirmasi.')
        await ctx.auth.reauthenticateWithCredential(
          user,
          ctx.auth.EmailAuthProvider.credential(user.email, password),
        )
      } else {
        await ctx.auth.reauthenticateWithPopup(user, new ctx.auth.GoogleAuthProvider())
      }

      const uid = user.uid
      const owned = await ctx.fs.getDocs(
        ctx.fs.query(
          ctx.fs.collection(ctx.db, 'memberships'),
          ctx.fs.where('uid', '==', uid),
          ctx.fs.where('role', '==', 'owner'),
        ),
      )
      if (!owned.empty) {
        const teamName = owned.docs[0].data().teamName ?? 'tim'
        throw new Error(
          `Kamu masih pemilik tim "${teamName}". Hapus tim itu dulu sebelum menghapus akun.`,
        )
      }

      // pesan obrolan tim yang kamu kirim (dihapus sebelum keanggotaan dihapus)
      const joined = await ctx.fs.getDocs(
        ctx.fs.query(ctx.fs.collection(ctx.db, 'memberships'), ctx.fs.where('uid', '==', uid)),
      )
      for (const entry of joined.docs) {
        const messages = await ctx.fs.getDocs(
          ctx.fs.query(
            ctx.fs.collection(ctx.db, 'teams', entry.data().teamId, 'messages'),
            ctx.fs.where('uid', '==', uid),
          ),
        )
        await Promise.all(messages.docs.map((d) => ctx.fs.deleteDoc(d.ref)))
      }

      for (const name of ['activities', 'tickets', 'feedback', 'memberships']) {
        const snap = await ctx.fs.getDocs(
          ctx.fs.query(ctx.fs.collection(ctx.db, name), ctx.fs.where('uid', '==', uid)),
        )
        await Promise.all(snap.docs.map((d) => ctx.fs.deleteDoc(d.ref)))
      }
      await ctx.fs.deleteDoc(ctx.fs.doc(ctx.db, 'userSettings', uid)).catch(() => {})
      await ctx.fs.deleteDoc(ctx.fs.doc(ctx.db, 'users', uid))
      await ctx.auth.deleteUser(user)
      removeKey('session')
      emit(null)
      return true
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
