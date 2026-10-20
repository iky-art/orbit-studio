import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthProvider'
import { useSettings } from './SettingsProvider'
import { DEMO_MODE, put, subscribeDoc } from '../services/db'
import { SETTINGS } from '../services/settings'
import { readJSON, writeJSON } from '../services/storage'

const ACCOUNT_SETTINGS = SETTINGS.filter((item) => item.group === 'akun')

/**
 * Pengaturan mengikuti akun:
 * 1. Data pribadi di grup "Akun & Profil" milik satu akun. Saat akun yang masuk
 *    berbeda dari pemilik data tersimpan, kolom akun dikosongkan lalu diisi
 *    nama dan email akun baru.
 * 2. Mode Firebase: semua pengaturan disinkronkan ke dokumen `userSettings/{uid}`
 *    (real-time antarperangkat, perubahan terakhir menang).
 */
export function AccountSettingsSync() {
  const { session } = useAuth()
  const { setValues, values } = useSettings()
  const uid = session?.uid
  const [remoteReady, setRemoteReady] = useState(false)
  const lastSent = useRef('')

  // 1. kepemilikan data akun di perangkat ini
  useEffect(() => {
    if (!uid) return
    const owner = readJSON('settings-owner', null)
    const storedEmail = String(values['akun.email'] ?? '').trim().toLowerCase()
    const sessionEmail = String(session?.email ?? '').trim().toLowerCase()
    // Data lama tanpa pemilik: dianggap milik akun ini hanya jika emailnya cocok/kosong.
    const mine = owner ? owner === uid : !storedEmail || storedEmail === sessionEmail

    setValues((current) => {
      const next = { ...current }
      if (!mine) {
        ACCOUNT_SETTINGS.forEach((item) => {
          next[item.id] = item.default
        })
      }
      if (!String(next['akun.name'] ?? '').trim()) next['akun.name'] = session?.name ?? ''
      if (!String(next['akun.email'] ?? '').trim()) next['akun.email'] = session?.email ?? ''
      return next
    })
    writeJSON('settings-owner', uid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // 2a. terima pengaturan dari cloud (termasuk perubahan dari perangkat lain)
  useEffect(() => {
    if (DEMO_MODE || !uid) {
      setRemoteReady(false)
      return undefined
    }
    setRemoteReady(false)
    lastSent.current = ''
    return subscribeDoc(
      'userSettings',
      uid,
      (remote, meta) => {
        if (meta?.pending) return // gema dari tulisan lokal sendiri
        if (remote?.values && typeof remote.values === 'object') {
          lastSent.current = JSON.stringify(remote.values)
          setValues((current) => ({ ...current, ...remote.values }))
        }
        setRemoteReady(true)
      },
      () => setRemoteReady(false),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // 2b. kirim perubahan lokal ke cloud (ditunda agar tidak menulis tiap geser slider)
  useEffect(() => {
    if (DEMO_MODE || !uid || !remoteReady) return undefined
    const json = JSON.stringify(values)
    if (json === lastSent.current) return undefined
    const timer = window.setTimeout(() => {
      lastSent.current = json
      put('userSettings', uid, { values, updatedAt: new Date().toISOString() }).catch(() => {
        lastSent.current = ''
      })
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [values, uid, remoteReady])

  return null
}
