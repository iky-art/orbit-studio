/** Penyimpanan lokal bernamespace. Aman bila localStorage tidak tersedia. */
const NS = 'orbit:'

export function readJSON(key, fallback = null) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(NS + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(NS + key)
  } catch {
    /* ignore */
  }
}

export function listKeys() {
  if (typeof window === 'undefined') return []
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(NS))
      .map((key) => key.slice(NS.length))
  } catch {
    return []
  }
}
