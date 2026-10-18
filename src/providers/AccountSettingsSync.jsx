import { useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useSettings } from './SettingsProvider'
import { SETTINGS } from '../services/settings'
import { readJSON, writeJSON } from '../services/storage'

const ACCOUNT_SETTINGS = SETTINGS.filter((item) => item.group === 'akun')

/**
 * Pengaturan tampilan berlaku per perangkat, tetapi data pribadi di grup
 * "Akun & Profil" (nama, username, email, telepon, dst.) milik satu akun.
 * Saat akun yang masuk berbeda dari pemilik data tersimpan, kolom akun
 * dikosongkan lalu diisi nama dan email akun baru.
 */
export function AccountSettingsSync() {
  const { session } = useAuth()
  const { setValues, values } = useSettings()
  const uid = session?.uid

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

  return null
}
