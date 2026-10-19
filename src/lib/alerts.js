/** Bunyi, getaran, dan notifikasi sistem untuk timer fokus. */

let audioContext = null
function audio() {
  try {
    audioContext =
      audioContext || new (window.AudioContext || window.webkitAudioContext)()
    return audioContext
  } catch {
    return null
  }
}

const TONES = {
  lembut: [[660, 0.22]],
  tegas: [[880, 0.14], [880, 0.14]],
  naik: [[523, 0.13], [659, 0.13], [784, 0.2]],
}

export function playTone(name = 'lembut', volume = 60) {
  if (name === 'hening' || volume <= 0) return
  const ctx = audio()
  if (!ctx) return
  try {
    ctx.resume?.()
    let at = ctx.currentTime
    ;(TONES[name] ?? TONES.lembut).forEach(([freq, length]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, (volume / 100) * 0.35), at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(at)
      osc.stop(at + length + 0.03)
      at += length + 0.06
    })
  } catch {
    /* audio tidak tersedia */
  }
}

const PATTERNS = { pendek: [200], ganda: [150, 80, 150], panjang: [600] }
export function vibrate(name = 'pendek') {
  try {
    navigator.vibrate?.(PATTERNS[name] ?? PATTERNS.pendek)
  } catch {
    /* tidak didukung */
  }
}

export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export async function showNotification(title, body) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const options = { body, icon: '/icons/icon-192.png', tag: 'orbit-focus' }
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) await registration.showNotification(title, options)
    else new Notification(title, options)
  } catch {
    /* ditolak browser */
  }
}
