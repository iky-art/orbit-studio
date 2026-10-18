import { createContext, useCallback, useContext, useLayoutEffect, useMemo } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { useTheme } from '../hooks/useTheme'
import { defaultSettings } from '../services/settings'

const SettingsContext = createContext(null)

/**
 * Menyimpan nilai pengaturan dan menerapkannya ke dokumen sebagai token CSS,
 * sehingga perubahan benar-benar terlihat (aksen, skala teks, radius, kaca,
 * kontras, kepadatan, gerakan).
 */
export function SettingsProvider({ children }) {
  const theme = useTheme()
  const [values, setValues] = usePersistentState('settings-v1', defaultSettings())

  const setValue = useCallback(
    (id, value) => {
      if (id === 'tampilan.theme') theme.setPreference(value)
      setValues((current) => ({ ...current, [id]: value }))
    },
    [setValues, theme],
  )

  const reset = useCallback(() => {
    setValues(defaultSettings())
    theme.setPreference('dark')
  }, [setValues, theme])

  const { resolved } = theme

  // Terapkan token tampilan sebelum cat pertama (useLayoutEffect, bukan useEffect,
  // agar tidak ada kedipan saat preferensi tersimpan dimuat dari penyimpanan).
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const accent = values['tampilan.accent']
    if (accent) root.style.setProperty('--accent', accent)
    root.style.setProperty(
      '--font-scale',
      String((values['tampilan.fontScale'] ?? 100) / 100),
    )
    root.style.setProperty(
      '--radius-base',
      `${values['tampilan.radius'] ?? 20}px`,
    )
    root.style.setProperty(
      '--glass-blur',
      `${Math.round(((values['tampilan.glass'] ?? 70) * 0.3))}px`,
    )
    root.dataset.density = values['tampilan.density'] ?? 'nyaman'
    root.dataset.reduceMotion = values['tampilan.reduceMotion'] ? 'true' : 'false'
    root.dataset.ambient = values['tampilan.ambient'] === false ? 'off' : 'on'
    root.dataset.contrast = values['aksesibilitas.contrast'] ? 'high' : 'normal'
    root.dataset.largeText = values['aksesibilitas.largeText'] ? 'true' : 'false'
    root.dataset.underlineLinks = values['aksesibilitas.underlineLinks']
      ? 'true'
      : 'false'
    root.dataset.alwaysFocus = values['aksesibilitas.focusRing'] ? 'true' : 'false'
    root.dataset.transparency = values['aksesibilitas.reduceTransparency']
      ? 'solid'
      : 'glass'
    root.dataset.colorBlind = values['aksesibilitas.colorBlind'] ?? 'none'
    root.dataset.transparentHeader = values['tampilan.transparentHeader']
      ? 'true'
      : 'false'
    root.dataset.dockLabels = values['tampilan.dockLabels'] ? 'true' : 'false'
  }, [values, resolved])

  const api = useMemo(
    () => ({
      values,
      setValue,
      setValues,
      reset,
      get: (id) => values[id],
      theme: theme.preference,
      resolvedTheme: resolved,
      setTheme: theme.setPreference,
      toggleTheme: theme.toggle,
    }),
    [values, setValue, setValues, reset, theme, resolved],
  )

  return (
    <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings harus dipakai di dalam SettingsProvider')
  }
  return context
}

export function useSetting(id) {
  const { values, setValue } = useSettings()
  return [values[id], (next) => setValue(id, next)]
}
