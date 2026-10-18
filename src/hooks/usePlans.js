import { useEffect, useState } from 'react'
import { subscribe } from '../services/db'

const ORDER = { free: 0, paid: 1, contact: 2 }

/** Rapikan baris `plans` dari Firestore/seed menjadi data siap tampil. */
export function normalizePlans(rows) {
  return rows
    .filter((row) => row.active !== false && row.name)
    .map((row) => {
      const priceMonthly = Number(row.priceMonthly) || 0
      const priceYearly = Number(row.priceYearly) || 0
      const isFree = priceMonthly === 0 && /^(free|gratis)$/i.test(String(row.name).trim())
      return {
        id: row.id ?? row.name,
        name: String(row.name),
        priceMonthly,
        priceYearly,
        seats: Number(row.seats) || 0,
        features: Array.isArray(row.features) ? row.features.filter(Boolean) : [],
        popular: row.popular === true || row.popular === 'true',
        kind: isFree ? 'free' : priceMonthly === 0 ? 'contact' : 'paid',
      }
    })
    .sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.priceMonthly - b.priceMonthly)
}

/** Paket aktif dari konsol admin (real-time di mode Firebase). */
export function usePlans() {
  const [state, setState] = useState({ status: 'loading', plans: [] })

  useEffect(
    () =>
      subscribe(
        'plans',
        (rows) => setState({ status: 'ready', plans: normalizePlans(rows) }),
        () => setState({ status: 'error', plans: [] }),
      ),
    [],
  )

  return state
}
