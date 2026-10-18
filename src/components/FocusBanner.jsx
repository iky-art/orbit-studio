import { useEffect, useState } from 'react'
import { Icon } from './Icon'

const DURATION = 25 * 60
const RING_RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function FocusBanner({ onComplete }) {
  const [remaining, setRemaining] = useState(DURATION)
  const [running, setRunning] = useState(false)
  const finished = remaining === 0

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (finished && running) {
      setRunning(false)
      onComplete?.(DURATION / 60)
    }
  }, [finished, running, onComplete])

  const elapsed = DURATION - remaining
  const progress = remaining / DURATION
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const primaryLabel = finished
    ? 'Mulai lagi'
    : running
      ? 'Jeda'
      : 'Mulai fokus'

  const onPrimary = () => {
    if (finished) {
      setRemaining(DURATION)
      setRunning(true)
      return
    }
    setRunning((value) => !value)
  }

  const onReset = () => {
    setRunning(false)
    setRemaining(DURATION)
  }

  const status = finished
    ? 'Sesi fokus selesai. Waktunya istirahat.'
    : running
      ? `Sesi fokus berjalan, sisa ${formatClock(remaining)}.`
      : 'Sesi fokus dijeda.'

  return (
    <section className="surface focus-banner" aria-labelledby="focus-title">
      <div className="focus-ring">
        <svg viewBox="0 0 78 78" width="78" height="78" aria-hidden="true">
          <circle
            className="focus-ring-track"
            cx="39"
            cy="39"
            r={RING_RADIUS}
          />
          <circle
            className="focus-ring-bar"
            cx="39"
            cy="39"
            r={RING_RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="focus-ring-label">{formatClock(remaining)}</span>
      </div>

      <div className="focus-info">
        <p className="focus-eyebrow">
          <Icon name="flame" size={14} strokeWidth={1.9} />
          Mode fokus
        </p>
        <h2 className="focus-title" id="focus-title">
          {finished
            ? 'Sesi selesai — kerja bagus'
            : running
              ? 'Sedang fokus, tetap di jalur'
              : 'Siap untuk sesi fokus?'}
        </h2>
        <p className="focus-desc">
          {finished
            ? 'Istirahat 5 menit, lalu lanjut ke tugas berikutnya.'
            : 'Timer 25 menit tanpa gangguan untuk merapikan desain terakhir.'}
        </p>
      </div>

      <div className="focus-actions">
        <button type="button" className="btn btn-primary" onClick={onPrimary}>
          <Icon
            name={running ? 'pause' : 'play'}
            size={16}
            strokeWidth={running ? 2.4 : 1.8}
          />
          {primaryLabel}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onReset}
          disabled={!running && remaining === DURATION}
          title="Atur ulang timer"
        >
          <Icon name="reset" size={16} strokeWidth={1.9} />
          Reset
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
      <span className="sr-only">
        Waktu berjalan: {formatClock(elapsed)} dari {formatClock(DURATION)}
      </span>
    </section>
  )
}
