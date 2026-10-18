/**
 * Hitung seluruh angka dasbor dari catatan aktivitas milik pengguna.
 * Satu catatan: { id, type, title, project?, minutes?, createdAt (ISO) }.
 */

const DAY = 86400000
const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })

const TYPES = {
  focus: { label: 'Fokus', icon: 'zap', tone: 'lime' },
  design: { label: 'Desain', icon: 'layers', tone: 'plain' },
  deploy: { label: 'Rilis', icon: 'send', tone: 'plain' },
  review: { label: 'Tinjauan', icon: 'code', tone: 'plain' },
  collab: { label: 'Kolaborasi', icon: 'users', tone: 'plain' },
}

export const ACTIVITY_TYPES = Object.entries(TYPES).map(([id, t]) => ({
  id,
  label: t.label,
}))

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const round1 = (n) => Math.round(n * 10) / 10
const pad = (n) => String(n).padStart(2, '0')

function relativeTime(date, today0) {
  const diff = Math.round((today0 - startOfDay(date)) / DAY)
  if (diff <= 0) return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  if (diff === 1) return 'Kemarin'
  if (diff < 7) return `${diff} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function delta(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0
  return round1(((cur - prev) / prev) * 100)
}

export function computeDashboard(rows, now = new Date()) {
  const today0 = startOfDay(now)
  const logs = rows
    .map((row) => ({
      ...row,
      date: new Date(row.createdAt),
      minutes: Number(row.minutes) || 0,
      project: (row.project || '').trim(),
    }))
    .filter((row) => !Number.isNaN(row.date.getTime()))
    .sort((a, b) => b.date - a.date)

  // ember harian: indeks 0 = hari ini ... 13 = 13 hari lalu
  const buckets = Array.from({ length: 14 }, () => ({
    focusMin: 0,
    count: 0,
    projects: new Set(),
  }))
  logs.forEach((log) => {
    const i = Math.round((today0 - startOfDay(log.date)) / DAY)
    if (i < 0 || i > 13) return
    const b = buckets[i]
    b.count += 1
    if (log.project) b.projects.add(log.project)
    if (log.type === 'focus') b.focusMin += log.minutes
  })
  const range = (from, to) => buckets.slice(from, to)
  const thisWeek = range(0, 7)
  const prevWeek = range(7, 14)
  const ordered = thisWeek.slice().reverse() // lama -> hari ini

  const sumFocus = (list) => list.reduce((n, b) => n + b.focusMin, 0) / 60
  const sumCount = (list) => list.reduce((n, b) => n + b.count, 0)
  const uniqueProjects = (list) => {
    const all = new Set()
    list.forEach((b) => b.projects.forEach((x) => all.add(x)))
    return all.size
  }

  const week = ordered.map((b, idx) => {
    const daysAgo = 6 - idx
    const d = new Date(today0.getTime() - daysAgo * DAY)
    return {
      day: WEEKDAYS[d.getDay()],
      value: round1(b.focusMin / 60),
      today: daysAgo === 0,
    }
  })

  const make = (id, label, unit, icon, cur, prev, spark) => {
    const change = delta(cur, prev)
    return {
      id,
      label,
      unit,
      icon,
      value: round1(cur),
      delta: change,
      trend: change >= 0 ? 'up' : 'down',
      spark,
    }
  }
  const metrics = [
    make('projects', 'Proyek aktif', 'proyek', 'layers',
      uniqueProjects(thisWeek), uniqueProjects(prevWeek),
      ordered.map((b) => b.projects.size)),
    make('focus', 'Jam fokus', 'jam', 'zap',
      sumFocus(thisWeek), sumFocus(prevWeek),
      ordered.map((b) => round1(b.focusMin / 60))),
    make('activity', 'Aktivitas', 'catatan', 'check',
      sumCount(thisWeek), sumCount(prevWeek),
      ordered.map((b) => b.count)),
  ]

  // rentetan fokus (hari berturut-turut dengan sesi fokus)
  const focusDays = new Set(
    logs
      .filter((l) => l.type === 'focus')
      .map((l) => Math.round(startOfDay(l.date).getTime() / DAY)),
  )
  const todayN = Math.round(today0.getTime() / DAY)
  let current = 0
  for (let n = focusDays.has(todayN) ? todayN : todayN - 1; focusDays.has(n); n -= 1) {
    current += 1
  }
  let longest = 0
  let run = 0
  let last = null
  Array.from(focusDays).sort((a, b) => a - b).forEach((n) => {
    run = last !== null && n === last + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    last = n
  })

  // rata-rata sesi
  const sessionAvg = (from, to) => {
    const list = logs.filter((l) => {
      const i = Math.round((today0 - startOfDay(l.date)) / DAY)
      return l.type === 'focus' && l.minutes > 0 && i >= from && i < to
    })
    return list.length ? list.reduce((n, l) => n + l.minutes, 0) / list.length : 0
  }
  const avgNow = sessionAvg(0, 7)
  const avgPrev = sessionAvg(7, 14)
  let avgNote = 'Catat sesi fokus dengan durasi untuk melihat rata-rata.'
  if (avgNow && avgPrev) {
    const diff = Math.round(avgNow - avgPrev)
    avgNote = diff === 0
      ? 'Sama dengan minggu lalu'
      : `${diff > 0 ? 'Naik' : 'Turun'} ${Math.abs(diff)} menit dari minggu lalu`
  } else if (avgNow) {
    avgNote = 'Belum ada pembanding dari minggu lalu'
  }

  // jam terbaik (jendela 2 jam dengan fokus terbanyak)
  const hours = new Array(12).fill(0)
  logs.filter((l) => l.type === 'focus').forEach((l) => {
    hours[Math.floor(l.date.getHours() / 2)] += l.minutes || 1
  })
  const bestIdx = hours.some(Boolean) ? hours.indexOf(Math.max(...hours)) : -1

  const weekCount = sumCount(thisWeek)
  const tiles = [
    {
      id: 'streak',
      label: 'Rentetan fokus',
      value: `${current} hari`,
      note: longest ? `Rekor pribadi: ${longest} hari` : 'Selesaikan sesi fokus pertamamu',
    },
    {
      id: 'avg',
      label: 'Rata-rata sesi',
      value: avgNow ? `${Math.round(avgNow)} mnt` : '—',
      note: avgNote,
    },
    {
      id: 'best',
      label: 'Jam terbaik',
      value: bestIdx >= 0 ? `${pad(bestIdx * 2)}–${pad(bestIdx * 2 + 2)}` : '—',
      note: bestIdx >= 0 ? 'Waktu dengan fokus terbanyak' : 'Belum ada data fokus',
    },
    {
      id: 'tasks',
      label: 'Aktivitas minggu ini',
      value: String(weekCount),
      note: `Total ${logs.length} catatan sejak mulai`,
    },
  ]

  // distribusi per jenis (7 hari terakhir)
  const perType = {}
  logs.forEach((l) => {
    const i = Math.round((today0 - startOfDay(l.date)) / DAY)
    if (i >= 0 && i < 7) perType[l.type] = (perType[l.type] || 0) + 1
  })
  const breakdown = Object.entries(perType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      id: type,
      label: TYPES[type]?.label ?? type,
      value: Math.round((count / (weekCount || 1)) * 100),
    }))

  const items = logs.map((l) => {
    const info = TYPES[l.type] ?? TYPES.focus
    const meta = [l.project, l.minutes ? `${l.minutes} menit` : '']
      .filter(Boolean)
      .join(' — ')
    return {
      id: l.id,
      type: l.type,
      title: l.title,
      meta: meta || info.label,
      time: relativeTime(l.date, today0),
      icon: info.icon,
      tone: info.tone,
    }
  })

  const hoursNow = round1(sumFocus(thisWeek))
  const summary = logs.length
    ? `Minggu ini: ${nf.format(hoursNow)} jam fokus dari ${weekCount} aktivitas.`
    : 'Belum ada aktivitas. Mulai sesi fokus atau catat aktivitas pertamamu.'

  return { items, metrics, week, insights: { tiles, breakdown }, summary, total: logs.length }
}
