import { useCallback, useEffect, useState } from 'react'

export function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true
  )
}

export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/macintosh|mac os x/i.test(ua)) return 'mac'
  return 'desktop'
}

export function useStandalone() {
  const [standalone, setStandalone] = useState(() => isStandalone())
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = () => setStandalone(isStandalone())
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return standalone
}

/** Kelola peristiwa pemasangan PWA (beforeinstallprompt / appinstalled). */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const platform = detectPlatform()

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setDeferred(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable'
    deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice?.outcome ?? 'dismissed'
  }, [deferred])

  return {
    canPrompt: Boolean(deferred),
    installed,
    platform,
    promptInstall,
    /** iOS/Safari tidak memicu beforeinstallprompt — perlu petunjuk manual. */
    needsManualInstructions: !deferred && !installed && platform === 'ios',
  }
}
