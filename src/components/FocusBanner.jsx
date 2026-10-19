import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { playTone, requestNotificationPermission, showNotification, vibrate } from '../lib/alerts'
import { useSettings } from '../providers/SettingsProvider'
import { readJSON, writeJSON } from '../services/storage'

const KEY = 'focus-timer'
const RING_RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const MODES = [
  { id: 'focus', label: 'Fokus' },
  { id: 'short', label: 'Istirahat' },
  { id: 'long', label: 'Istirahat panjang' },
]

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Timer fokus ala Pomodoro. Durasi, jumlah siklus, istirahat otomatis, bunyi,
 * getaran, dan notifikasi mengikuti Pengaturan. Tetap akurat saat tab berada di
 * latar belakang atau dimuat ulang, karena memakai waktu berakhir (bukan hitungan).
 */
export function FocusBanner({ onComplete }) {
  const { values } = useSettings()
  const focusMin = Number(values['produktivitas.focusDuration']) || 25
  const breakMin = Number(values['produktivitas.breakDuration']) || 5
  const cycles = Number(values['produktivitas.cycles']) || 4
  const autoBreak = values['produktivitas.autoStartBreaks'] !== false

  const secondsFor = useCallback(
    (mode) =>
      (mode === 'focus' ? focusMin : mode === 'long' ? Math.min(45, breakMin * 3) : breakMin) * 60,
    [focusMin, breakMin],
  )

  const fresh = useCallback(
    (mode, cycle = 0) => ({
      mode,
      cycle,
      running: false,
      endAt: null,
      total: secondsFor(mode),
      left: secondsFor(mode),
    }),
    [secondsFor],
  )

  const [timer, setTimer] = useState(() => {
    const saved = readJSON(KEY, null)
    if (saved && MODES.some((item) => item.id === saved.mode) && saved.total > 0) {
      return {
        mode: saved.mode,
        cycle: Number(saved.cycle) || 0,
        running: Boolean(saved.running && saved.endAt),
        endAt: saved.endAt ?? null,
        total: saved.total,
        left: Math.min(saved.total, Math.max(0, Number(saved.left) || saved.total)),
      }
    }
    return {
      mode: 'focus',
      cycle: 0,
      running: false,
      endAt: null,
      total: focusMin * 60,
      left: focusMin * 60,
    }
  })

  const timerRef = useRef(timer)
  timerRef.current = timer
  const completingRef = useRef(false)
  const settingsRef = useRef({})
  settingsRef.current = { values, cycles, autoBreak, secondsFor, onComplete }

  useEffect(() => {
    writeJSON(KEY, timer)
  }, [timer])

  // Durasi diubah di Pengaturan saat timer belum jalan: ikut diperbarui.
  useEffect(() => {
    setTimer((cur) =>
      !cur.running && cur.left === cur.total && cur.total !== secondsFor(cur.mode)
        ? { ...cur, total: secondsFor(cur.mode), left: secondsFor(cur.mode) }
        : cur,
    )
  }, [secondsFor])

  const alertUser = useCallback((title, body) => {
    const { values: v } = settingsRef.current
    if (v['suara.silentMode'] !== true) {
      playTone(v['suara.notificationSound'], Number(v['suara.volume']))
      if (v['suara.haptics'] !== false) vibrate(v['suara.vibrationPattern'])
    }
    if (v['notifikasi.desktop'] === true) showNotification(title, body)
  }, [])

  const complete = useCallback(() => {
    const cur = timerRef.current
    if (!cur.running || completingRef.current) return
    completingRef.current = true
    const cfg = settingsRef.current
    if (cur.mode === 'focus') {
      const nextCycle = cur.cycle + 1
      const mode = nextCycle % cfg.cycles === 0 ? 'long' : 'short'
      const total = cfg.secondsFor(mode)
      alertUser(
        'Sesi fokus selesai',
        mode === 'long' ? 'Waktunya istirahat panjang.' : 'Istirahat sebentar dulu.',
      )
      cfg.onComplete?.(Math.round(cur.total / 60))
      setTimer({
        mode,
        cycle: nextCycle,
        running: cfg.autoBreak,
        endAt: cfg.autoBreak ? Date.now() + total * 1000 : null,
        total,
        left: total,
      })
    } else {
      const total = cfg.secondsFor('focus')
      alertUser('Istirahat selesai', 'Siap untuk sesi fokus berikutnya.')
      setTimer({
        mode: 'focus',
        cycle: cur.mode === 'long' ? 0 : cur.cycle,
        running: false,
        endAt: null,
        total,
        left: total,
      })
    }
  }, [alertUser])

  // Izinkan penyelesaian berikutnya setelah status timer berubah.
  useEffect(() => {
    completingRef.current = false
  }, [timer.mode, timer.cycle, timer.running, timer.endAt])

  useEffect(() => {
    if (!timer.running) return undefined
    const tick = () => {
      const cur = timerRef.current
      const left = Math.max(0, Math.round((cur.endAt - Date.now()) / 1000))
      if (left <= 0) complete()
      else setTimer((value) => (value.left === left ? value : { ...value, left }))
    }
    tick()
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [timer.running, timer.endAt, complete])

  // Judul tab menampilkan sisa waktu saat berjalan.
  useEffect(() => {
    if (!timer.running) return undefined
    const original = document.title
    document.title = `${formatClock(timer.left)} · ${timer.mode === 'focus' ? 'Fokus' : 'Istirahat'}`
    return () => {
      document.title = original
    }
  }, [timer.running, timer.left, timer.mode])

  const toggle = () => {
    if (timer.running) {
      setTimer({ ...timer, running: false, endAt: null })
      return
    }
    if (values['notifikasi.desktop'] === true) requestNotificationPermission()
    const left = timer.left > 0 ? timer.left : timer.total
    setTimer({ ...timer, running: true, left, endAt: Date.now() + left * 1000 })
  }

  const reset = () => setTimer(fresh(timer.mode, timer.cycle))
  const pick = (mode) => setTimer(fresh(mode, timer.cycle))
  const skipBreak = () => setTimer(fresh('focus', timer.mode === 'long' ? 0 : timer.cycle))

  const isFocus = timer.mode === 'focus'
  const progress = timer.total ? timer.left / timer.total : 1
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const atStart = !timer.running && timer.left === timer.total
  const inRound = timer.mode === 'long' ? cycles : timer.cycle % cycles

  const status = timer.running
    ? `${isFocus ? 'Sesi fokus' : 'Istirahat'} berjalan, sisa ${formatClock(timer.left)}.`
    : 'Timer dijeda.'

  return (
    <section className="surface focus-banner" aria-labelledby="focus-title">
      <div className="focus-ring">
        <svg viewBox="0 0 78 78" width="78" height="78" aria-hidden="true">
          <circle className="focus-ring-track" cx="39" cy="39" r={RING_RADIUS} />
          <circle
            className="focus-ring-bar"
            cx="39"
            cy="39"
            r={RING_RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="focus-ring-label">{formatClock(timer.left)}</span>
      </div>

      <div className="focus-info">
        <p className="focus-eyebrow">
          <Icon name="flame" size={14} strokeWidth={1.9} />
          {isFocus ? 'Mode fokus' : timer.mode === 'long' ? 'Istirahat panjang' : 'Istirahat'}
        </p>
        <h2 className="focus-title" id="focus-title">
          {isFocus
            ? timer.running
              ? 'Sedang fokus, tetap di jalur'
              : 'Siap untuk sesi fokus?'
            : 'Waktunya istirahat'}
        </h2>
        <p className="focus-desc">
          {isFocus
            ? `Timer ${Math.round(timer.total / 60)} menit tanpa gangguan. Sesi yang selesai tercatat otomatis.`
            : 'Regangkan badan dan minum air. Sesi fokus berikutnya menunggu setelah ini.'}
        </p>
        <div className="focus-modes" role="group" aria-label="Jenis sesi">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="chip chip-sm"
              aria-pressed={timer.mode === item.id}
              disabled={timer.running}
              onClick={() => pick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          className="focus-dots"
          role="img"
          aria-label={`${inRound} dari ${cycles} sesi fokus selesai di siklus ini`}
        >
          {Array.from({ length: cycles }, (_, index) => (
            <span key={index} data-done={index < inRound ? 'true' : undefined} />
          ))}
        </div>
      </div>

      <div className="focus-actions">
        <button type="button" className="btn btn-primary" onClick={toggle}>
          <Icon name={timer.running ? 'pause' : 'play'} size={16} strokeWidth={timer.running ? 2.4 : 1.8} />
          {timer.running ? 'Jeda' : atStart ? (isFocus ? 'Mulai fokus' : 'Mulai istirahat') : 'Lanjutkan'}
        </button>
        {isFocus ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={reset}
            disabled={atStart}
            title="Atur ulang timer"
          >
            <Icon name="reset" size={16} strokeWidth={1.9} />
            Reset
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={skipBreak}>
            Lewati istirahat
          </button>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
