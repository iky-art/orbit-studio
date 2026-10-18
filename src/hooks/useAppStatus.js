import { useEffect, useMemo, useState } from 'react'
import { subscribe } from '../services/db'

/** Kunci feature flag yang dikenali aplikasi (diatur dari konsol admin). */
export const FLAG_MAINTENANCE = 'mode.pemeliharaan'
export const FLAG_SIGNUP_CLOSED = 'pendaftaran.tutup'

/**
 * Status aplikasi untuk semua pengunjung (real-time): mode pemeliharaan,
 * pendaftaran ditutup, dan layanan yang sedang bermasalah.
 */
export function useAppStatus() {
  const [flags, setFlags] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => subscribe('featureFlags', setFlags, () => {}), [])
  useEffect(() => subscribe('systemServices', setServices, () => {}), [])

  return useMemo(() => {
    const active = (key) => flags.find((flag) => flag.key === key && flag.enabled === true)
    const maintenance = active(FLAG_MAINTENANCE)
    return {
      maintenance: Boolean(maintenance),
      maintenanceNote: maintenance?.description ?? '',
      signupClosed: Boolean(active(FLAG_SIGNUP_CLOSED)),
      issues: services.filter((service) => service.status && service.status !== 'sehat'),
    }
  }, [flags, services])
}
