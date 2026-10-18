import { useEffect, useState } from 'react'

/**
 * Pergeseran sangat halus mengikuti pointer.
 * Hanya aktif pada perangkat dengan pointer presisi dan tanpa reduced-motion.
 */
export function usePointerDrift(strength = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    let frame = 0

    const onMove = (event) => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        const nx = event.clientX / window.innerWidth - 0.5
        const ny = event.clientY / window.innerHeight - 0.5
        setOffset({ x: nx * 2 * strength, y: ny * 2 * strength })
        frame = 0
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [strength])

  return offset
}
