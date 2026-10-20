/**
 * Cuaca real-time dari Open-Meteo (tanpa API key). Koordinat dikirim langsung
 * dari browser ke Open-Meteo; Orbit Studio tidak menyimpannya di server.
 * Data © Open-Meteo.com (CC BY 4.0).
 */
const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'

const CODES = {
  0: ['Cerah', 'sun'],
  1: ['Cerah berawan', 'cloudSun'],
  2: ['Berawan sebagian', 'cloudSun'],
  3: ['Mendung', 'cloud'],
  45: ['Berkabut', 'cloudFog'],
  48: ['Kabut beku', 'cloudFog'],
  51: ['Gerimis ringan', 'cloudRain'],
  53: ['Gerimis', 'cloudRain'],
  55: ['Gerimis lebat', 'cloudRain'],
  56: ['Gerimis beku', 'cloudRain'],
  57: ['Gerimis beku lebat', 'cloudRain'],
  61: ['Hujan ringan', 'cloudRain'],
  63: ['Hujan sedang', 'cloudRain'],
  65: ['Hujan lebat', 'cloudRain'],
  66: ['Hujan beku', 'cloudRain'],
  67: ['Hujan beku lebat', 'cloudRain'],
  71: ['Salju ringan', 'cloudSnow'],
  73: ['Salju', 'cloudSnow'],
  75: ['Salju lebat', 'cloudSnow'],
  77: ['Butiran salju', 'cloudSnow'],
  80: ['Hujan lokal ringan', 'cloudRain'],
  81: ['Hujan lokal', 'cloudRain'],
  82: ['Hujan lokal lebat', 'cloudRain'],
  85: ['Hujan salju', 'cloudSnow'],
  86: ['Hujan salju lebat', 'cloudSnow'],
  95: ['Badai petir', 'cloudLightning'],
  96: ['Badai petir, hujan es', 'cloudLightning'],
  99: ['Badai petir lebat, hujan es', 'cloudLightning'],
}

export function describeWeather(code, isDay = true) {
  const [label, icon] = CODES[code] ?? ['Cuaca tidak diketahui', 'cloud']
  return { label, icon: code === 0 && !isDay ? 'moon' : icon }
}

const round = (value) => (Number.isFinite(value) ? Math.round(value) : null)

export async function fetchWeather({ lat, lon }, signal) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '2',
    wind_speed_unit: 'kmh',
  })
  const response = await fetch(`${FORECAST}?${params}`, { signal })
  if (!response.ok) throw new Error('Gagal memuat cuaca. Coba lagi sebentar lagi.')
  const data = await response.json()
  const c = data.current ?? {}
  const d = data.daily ?? {}
  const day = (index) => ({
    code: d.weather_code?.[index],
    min: round(d.temperature_2m_min?.[index]),
    max: round(d.temperature_2m_max?.[index]),
    rain: round(d.precipitation_probability_max?.[index]),
  })
  return {
    fetchedAt: Date.now(),
    current: {
      temperature: round(c.temperature_2m),
      apparent: round(c.apparent_temperature),
      humidity: round(c.relative_humidity_2m),
      wind: round(c.wind_speed_10m),
      code: c.weather_code,
      isDay: c.is_day !== 0,
    },
    today: day(0),
    tomorrow: day(1),
  }
}

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({
    name: query.trim(),
    count: '6',
    language: 'id',
    format: 'json',
  })
  const response = await fetch(`${GEOCODE}?${params}`, { signal })
  if (!response.ok) throw new Error('Pencarian lokasi gagal.')
  const data = await response.json()
  return (data.results ?? []).map((item) => ({
    name: [item.name, item.admin1].filter(Boolean).join(', '),
    country: item.country,
    lat: item.latitude,
    lon: item.longitude,
  }))
}
