import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { useAuth } from '../providers/AuthProvider'
import { useSettings } from '../providers/SettingsProvider'
import { useToast } from '../providers/ToastProvider'

const GOALS = [
  { id: 'desain', label: 'Desain produk', icon: 'layers', note: 'Alur, komponen, sistem desain' },
  { id: 'riset', label: 'Riset & wawasan', icon: 'search', note: 'Wawancara, data, laporan' },
  { id: 'tim', label: 'Manajemen tim', icon: 'users', note: 'Peran, izin, dan koordinasi' },
  { id: 'bisnis', label: 'Operasi & bisnis', icon: 'chart', note: 'Tagihan, langganan, laporan' },
  { id: 'lain', label: 'Sekadar mencoba', icon: 'sparkles', note: 'Jelajahi semua panel' },
]

const FOCUS = [
  'Fokus mendalam',
  'Kolaborasi tim',
  'Pelaporan berkala',
  'Otomasi alur kerja',
  'Kontrol admin',
  'Pemantauan performa',
]

const STEPS = ['Perkenalan', 'Tujuan', 'Fokus', 'Preferensi']

export function OnboardingScreen() {
  const { session, updateProfile } = useAuth()
  const { setValue } = useSettings()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState(session?.name ?? '')
  const [jobTitle, setJobTitle] = useState('')
  const [goal, setGoal] = useState('desain')
  const [focus, setFocus] = useState(['Fokus mendalam'])
  const [prefs, setPrefs] = useState({ email: true, push: true, daily: true })

  const toggleFocus = (item) =>
    setFocus((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    )

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length >= 2
    if (step === 1) return Boolean(goal)
    if (step === 2) return focus.length > 0
    return true
  }, [step, name, goal, focus])

  const finish = async () => {
    setBusy(true)
    try {
      await updateProfile({
        onboarded: true,
        name: name.trim() || session?.name,
        jobTitle,
        goal,
        focus,
      })
      setValue('notifikasi.email', prefs.email)
      setValue('notifikasi.push', prefs.push)
      setValue('notifikasi.digest', prefs.daily ? 'harian' : 'mati')
      setValue('akun.name', name.trim() || session?.name || '')
      if (jobTitle.trim()) setValue('akun.jobTitle', jobTitle.trim())
      toast.success('Ruang kerja siap. Selamat bekerja.')
    } finally {
      setBusy(false)
    }
  }

  const skip = async () => {
    setBusy(true)
    try {
      await updateProfile({ onboarded: true })
      toast.info('Onboarding dilewati. Kamu bisa mengubahnya di Pengaturan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="onboard" id="main">
      <div className="onboard-panel">
        <header className="onboard-head">
          <div className="onboard-steps" aria-hidden="true">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className="onboard-step"
                data-state={index === step ? 'active' : index < step ? 'done' : 'todo'}
              />
            ))}
          </div>
          <p className="onboard-count">
            Langkah {step + 1} dari {STEPS.length} · {STEPS[step]}
          </p>
        </header>

        <div className="onboard-body">
          {step === 0 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Selamat datang di Orbit</h1>
              <p className="onboard-sub">
                Lengkapi beberapa hal kecil agar ruang kerja terasa seperti milikmu.
              </p>
              <label className="field">
                <span className="field-label">Nama tampilan</span>
                <input
                  className="field-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nama lengkap"
                  autoComplete="name"
                />
              </label>
              <label className="field">
                <span className="field-label">
                  Jabatan <span className="field-optional">(opsional)</span>
                </span>
                <input
                  className="field-input"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="Product Designer"
                />
              </label>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Apa tujuan utamamu?</h1>
              <p className="onboard-sub">
                Kami akan mengurutkan panel dan pintasan yang paling relevan.
              </p>
              <div className="choice-list" role="radiogroup" aria-label="Tujuan utama">
                {GOALS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={goal === item.id}
                    className="choice"
                    onClick={() => setGoal(item.id)}
                  >
                    <span className="choice-icon">
                      <Icon name={item.icon} size={19} />
                    </span>
                    <span className="choice-body">
                      <span className="choice-label">{item.label}</span>
                      <span className="choice-note">{item.note}</span>
                    </span>
                    <span className="choice-check" aria-hidden="true">
                      {goal === item.id ? <Icon name="check" size={16} strokeWidth={2.2} /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Pilih fokus kerjamu</h1>
              <p className="onboard-sub">Pilih sebanyak yang kamu mau, minimal satu.</p>
              <div className="chip-row">
                {FOCUS.map((item) => {
                  const active = focus.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      className="chip"
                      aria-pressed={active}
                      onClick={() => toggleFocus(item)}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Atur notifikasi</h1>
              <p className="onboard-sub">
                Bisa diubah kapan saja di Pengaturan → Notifikasi.
              </p>
              <div className="surface settings-group">
                {[
                  { id: 'email', label: 'Ringkasan email', desc: 'Kabar penting ke kotak masuk.' },
                  { id: 'push', label: 'Notifikasi push', desc: 'Pemberitahuan ke perangkat ini.' },
                  { id: 'daily', label: 'Ringkasan harian', desc: 'Rekap aktivitas setiap pagi.' },
                ].map((row) => (
                  <div className="setting-row" key={row.id}>
                    <div className="setting-body">
                      <p className="setting-title">{row.label}</p>
                      <p className="setting-desc">{row.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[row.id]}
                      aria-label={row.label}
                      className="switch"
                      onClick={() =>
                        setPrefs((current) => ({ ...current, [row.id]: !current[row.id] }))
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="onboard-note">
                <Icon name="shieldCheck" size={16} />
                Kami tidak membagikan datamu. Semua pengaturan tersimpan di akunmu.
              </p>
            </section>
          ) : null}
        </div>

        <footer className="onboard-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => (step === 0 ? skip() : setStep((value) => value - 1))}
            disabled={busy}
          >
            <Icon name="arrowLeft" size={17} />
            {step === 0 ? 'Lewati' : 'Kembali'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep((value) => value + 1)}
              disabled={!canContinue}
            >
              Lanjut
              <Icon name="arrowRight" size={17} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finish} disabled={busy}>
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Icon name="check" size={18} strokeWidth={2.1} />}
              Mulai bekerja
            </button>
          )}
        </footer>
      </div>
    </main>
  )
}
