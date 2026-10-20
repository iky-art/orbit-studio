import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { useWeather } from '../hooks/useWeather'
import { formatRelative } from '../lib/format'
import { useToast } from '../providers/ToastProvider'
import { describeWeather, searchPlaces } from '../services/weather'

const deg = (value) => (value === null || value === undefined ? '–' : `${value}°`)

function DayRow({ label, day }) {
  const info = describeWeather(day.code)
  return (
    <li className="weather-day">
      <span className="weather-day-icon" aria-hidden="true">
        <Icon name={info.icon} size={22} strokeWidth={1.6} />
      </span>
      <div className="weather-day-body">
        <b>{label}</b>
        <span>
          {info.label}
          {day.rain !== null ? ` · peluang hujan ${day.rain}%` : ''}
        </span>
      </div>
      <span className="weather-day-temp">
        {deg(day.min)} – {deg(day.max)}C
      </span>
    </li>
  )
}

/** Cuaca hari ini (real-time) dan suhu besok, dari Open-Meteo. */
export function WeatherCard() {
  const { location, data, status, error, refresh, setLocation, clearLocation } = useWeather()
  const toast = useToast()
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [, setTick] = useState(0)

  // segarkan label "diperbarui" tiap 30 detik
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30000)
    return () => window.clearInterval(id)
  }, [])

  const choose = (place) => {
    setLocation({ name: place.name, lat: place.lat, lon: place.lon })
    setPicking(false)
    setQuery('')
    setResults([])
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser ini tidak mendukung lokasi. Cari kotamu secara manual.')
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBusy(false)
        choose({
          name: 'Lokasi saat ini',
          lat: Math.round(position.coords.latitude * 100) / 100,
          lon: Math.round(position.coords.longitude * 100) / 100,
        })
      },
      (failure) => {
        setBusy(false)
        toast.error(
          failure.code === 1
            ? 'Izin lokasi ditolak. Cari kotamu secara manual.'
            : 'Lokasi tidak tersedia. Cari kotamu secara manual.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  }

  const search = async (event) => {
    event.preventDefault()
    if (query.trim().length < 2) return
    setBusy(true)
    try {
      const found = await searchPlaces(query)
      setResults(found)
      if (found.length === 0) toast.info('Kota tidak ditemukan. Coba nama lain.')
    } catch (failure) {
      toast.error(failure?.message || 'Pencarian lokasi gagal.')
    } finally {
      setBusy(false)
    }
  }

  const needsSetup = !location || picking
  const now = data ? describeWeather(data.current.code, data.current.isDay) : null

  return (
    <section className="surface weather-card" aria-labelledby="weather-title">
      <div className="section-head">
        <div>
          <h2 className="card-title" id="weather-title">
            Cuaca
          </h2>
          <p className="card-sub weather-place">
            {location ? (
              <>
                <Icon name="mapPin" size={14} />
                {location.name}
              </>
            ) : (
              'Atur lokasi untuk melihat cuaca hari ini dan besok.'
            )}
          </p>
        </div>
        {location ? (
          <div className="weather-tools">
            <button
              type="button"
              className="icon-btn"
              aria-label="Perbarui cuaca"
              onClick={refresh}
              disabled={status === 'loading' || status === 'refreshing'}
            >
              <Icon name="refresh" size={18} />
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPicking((v) => !v)}>
              {picking ? 'Tutup' : 'Ubah lokasi'}
            </button>
          </div>
        ) : null}
      </div>

      {needsSetup ? (
        <div className="support-form">
          <div className="support-actions">
            <button type="button" className="btn btn-primary" onClick={useMyLocation} disabled={busy}>
              <Icon name="mapPin" size={16} />
              Gunakan lokasiku
            </button>
            {location ? (
              <button type="button" className="btn btn-ghost" onClick={clearLocation}>
                Hapus lokasi
              </button>
            ) : null}
          </div>
          <form className="support-actions" onSubmit={search}>
            <input
              className="field-input"
              style={{ maxWidth: 240 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Atau cari kota…"
              aria-label="Cari kota"
            />
            <button type="submit" className="btn btn-ghost" disabled={busy || query.trim().length < 2}>
              Cari
            </button>
          </form>
          {results.length ? (
            <ul className="weather-results">
              {results.map((place) => (
                <li key={`${place.lat},${place.lon}`}>
                  <button type="button" className="weather-result" onClick={() => choose(place)}>
                    <b>{place.name}</b>
                    <span>{place.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="section-note">
            Lokasi tersimpan di perangkat ini dan dikirim ke Open-Meteo hanya untuk mengambil cuaca.
          </p>
        </div>
      ) : data && now ? (
        <>
          <div className="weather-main">
            <span className="weather-icon" aria-hidden="true">
              <Icon name={now.icon} size={46} strokeWidth={1.4} />
            </span>
            <div>
              <p className="weather-temp">
                {deg(data.current.temperature)}
                <small>C</small>
              </p>
              <p className="weather-desc">
                {now.label} · terasa {deg(data.current.apparent)}
              </p>
            </div>
          </div>

          <ul className="weather-facts">
            <li>
              <Icon name="droplet" size={15} /> Lembap {data.current.humidity ?? '–'}%
            </li>
            <li>
              <Icon name="wind" size={15} /> Angin {data.current.wind ?? '–'} km/j
            </li>
          </ul>

          <ul className="weather-days">
            <DayRow label="Hari ini" day={data.today} />
            <DayRow label="Besok" day={data.tomorrow} />
          </ul>

          <p className="weather-foot" role="status">
            {status === 'error'
              ? `${error} Menampilkan data terakhir. `
              : status === 'refreshing'
                ? 'Memperbarui… '
                : `Diperbarui ${formatRelative(new Date(data.fetchedAt).toISOString())}. `}
            Otomatis tiap 10 menit · Data oleh{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
              Open-Meteo.com
            </a>
          </p>
        </>
      ) : status === 'error' ? (
        <p className="field-error" role="alert">
          {error}{' '}
          <button type="button" className="bell-link" onClick={refresh}>
            Coba lagi
          </button>
        </p>
      ) : (
        <p className="section-note">Memuat cuaca…</p>
      )}
    </section>
  )
}
