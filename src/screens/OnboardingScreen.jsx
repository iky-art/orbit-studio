import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { LEGAL } from '../legal/config'
import { useAuth } from '../providers/AuthProvider'
import { useSettings } from '../providers/SettingsProvider'
import { useToast } from '../providers/ToastProvider'
import { ACCENT_OPTIONS } from '../services/settings'

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

const TARGETS = [
  { id: 1, label: '1 jam sehari', note: 'Ringan, cocok untuk memulai' },
  { id: 2, label: '2 jam sehari', note: 'Seimbang untuk kebanyakan orang' },
  { id: 3, label: '3 jam sehari', note: 'Serius dan konsisten' },
  { id: 4, label: '4 jam sehari', note: 'Intens, untuk hari-hari padat' },
]

const THEMES = [
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
  { value: 'system', label: 'Sistem' },
]

const TOUR = [
  { icon: 'home', title: 'Beranda', text: 'Catat aktivitas dan jalankan timer fokus (durasinya bisa diatur). Sesi yang selesai tercatat otomatis.' },
  { icon: 'activity', title: 'Aktivitas', text: 'Riwayat semua catatanmu, bisa disaring per jenis.' },
  { icon: 'insights', title: 'Insights', text: 'Rentetan fokus, jam terbaik, dan distribusi waktu dari datamu sendiri.' },
  { icon: 'bell', title: 'Lonceng notifikasi', text: 'Pengumuman dari tim muncul di sini. Pesan penting tampil sebagai banner.' },
  { icon: 'settings', title: 'Pengaturan', text: 'Paket, tim, tampilan, dan bantuan: kirim masukan, buat tiket, atau buka Pusat Bantuan kapan saja.' },
]

const STEPS = ['Perkenalan', 'Tujuan', 'Fokus', 'Target', 'Tampilan', 'Fitur', 'Notifikasi', 'Selesai']
const LAST = STEPS.length - 1

function InstallCard() {
  const { canPrompt, installed, needsManualInstructions, promptInstall } = usePwaInstall()
  if (installed) {
    return (
      <p className="onboard-note">
        <Icon name="check" size={16} />
        Sudah terpasang sebagai aplikasi di perangkat ini.
      </p>
    )
  }
  return (
    <div className="tour-item tour-install">
      <span className="tour-icon" aria-hidden="true">
        <Icon name="smartphone" size={18} />
      </span>
      <div className="tour-body">
        <p className="tour-title">Pasang sebagai aplikasi</p>
        <p className="tour-text">
          {needsManualInstructions
            ? 'Di Safari: ketuk Bagikan, lalu Tambahkan ke Layar Utama.'
            : 'Buka dari layar utama tanpa bilah alamat, dan tetap berjalan saat luring.'}
        </p>
      </div>
      {canPrompt ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={promptInstall}>
          Pasang
        </button>
      ) : null}
    </div>
  )
}

export function OnboardingScreen() {
  const { session, updateProfile } = useAuth()
  const { values, setValue } = useSettings()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState(session?.name ?? '')
  const [jobTitle, setJobTitle] = useState('')
  const [goal, setGoal] = useState('desain')
  const [focus, setFocus] = useState(['Fokus mendalam'])
  const [target, setTarget] = useState(2)
  const [prefs, setPrefs] = useState({ email: true, push: true, daily: true })
  const [agreed, setAgreed] = useState(false)

  const theme = values['tampilan.theme']
  const accent = values['tampilan.accent']

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
    if (!agreed) return
    setBusy(true)
    try {
      const core = {
        onboarded: true,
        name: name.trim() || session?.name,
        jobTitle,
        goal,
        focus,
      }
      const full = {
        ...core,
        dailyTarget: target,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: LEGAL.updated,
      }
      try {
        await updateProfile(full)
      } catch (error) {
        // Rules Firestore lama belum mengizinkan field baru: simpan inti profil saja.
        if (error?.code === 'permission-denied') await updateProfile(core)
        else throw error
      }
      setValue('notifikasi.email', prefs.email)
      setValue('notifikasi.push', prefs.push)
      setValue('notifikasi.digest', prefs.daily ? 'harian' : 'mati')
      setValue('akun.name', name.trim() || session?.name || '')
      if (jobTitle.trim()) setValue('akun.jobTitle', jobTitle.trim())
      toast.success('Ruang kerja siap. Selamat bekerja.')
    } catch (error) {
      toast.error(error?.message || 'Gagal menyimpan. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const skip = async () => {
    setBusy(true)
    try {
      await updateProfile({ onboarded: true })
      toast.info('Onboarding dilewati. Kamu bisa mengulanginya di Pengaturan → Bantuan & masukan.')
    } catch (error) {
      toast.error(error?.message || 'Gagal melewati onboarding.')
    } finally {
      setBusy(false)
    }
  }

  const goalLabel = GOALS.find((item) => item.id === goal)?.label ?? goal
  const themeLabel = THEMES.find((item) => item.value === theme)?.label ?? theme

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
                Delapan langkah singkat agar ruang kerja terasa seperti milikmu.
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
              <h1 className="onboard-title">Target fokus harian</h1>
              <p className="onboard-sub">
                Progresnya tampil di Beranda dan dihitung dari sesi fokus yang kamu catat.
              </p>
              <div className="choice-list" role="radiogroup" aria-label="Target fokus harian">
                {TARGETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={target === item.id}
                    className="choice"
                    onClick={() => setTarget(item.id)}
                  >
                    <span className="choice-icon">
                      <Icon name="zap" size={19} />
                    </span>
                    <span className="choice-body">
                      <span className="choice-label">{item.label}</span>
                      <span className="choice-note">{item.note}</span>
                    </span>
                    <span className="choice-check" aria-hidden="true">
                      {target === item.id ? <Icon name="check" size={16} strokeWidth={2.2} /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Pilih tampilan</h1>
              <p className="onboard-sub">
                Langsung berlaku, dan bisa diubah kapan saja di Pengaturan → Tampilan.
              </p>
              <div className="field">
                <span className="field-label">Mode warna</span>
                <div className="seg" role="group" aria-label="Mode warna">
                  {THEMES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="seg-btn"
                      aria-pressed={theme === item.value}
                      onClick={() => setValue('tampilan.theme', item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <span className="field-label">Warna aksen</span>
                <div className="accent-picker" role="radiogroup" aria-label="Warna aksen">
                  {ACCENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={accent === option.value}
                      aria-label={option.label}
                      className="accent-swatch"
                      style={{ '--swatch': option.value }}
                      onClick={() => setValue('tampilan.accent', option.value)}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Kenali ruang kerjamu</h1>
              <p className="onboard-sub">Lima tempat yang akan paling sering kamu pakai.</p>
              <div className="tour-list">
                {TOUR.map((item) => (
                  <div className="tour-item" key={item.title}>
                    <span className="tour-icon" aria-hidden="true">
                      <Icon name={item.icon} size={18} />
                    </span>
                    <div className="tour-body">
                      <p className="tour-title">{item.title}</p>
                      <p className="tour-text">{item.text}</p>
                    </div>
                  </div>
                ))}
                <InstallCard />
              </div>
            </section>
          ) : null}

          {step === 6 ? (
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
                Kami tidak membagikan datamu. Pengaturan notifikasi tersimpan di perangkat ini.
              </p>
            </section>
          ) : null}

          {step === LAST ? (
            <section className="onboard-section">
              <h1 className="onboard-title">Semua siap</h1>
              <p className="onboard-sub">Periksa ringkasannya, lalu mulai bekerja.</p>
              <dl className="surface onboard-summary">
                <div>
                  <dt>Nama</dt>
                  <dd>{name.trim() || session?.name}</dd>
                </div>
                <div>
                  <dt>Tujuan</dt>
                  <dd>{goalLabel}</dd>
                </div>
                <div>
                  <dt>Fokus</dt>
                  <dd>{focus.join(', ')}</dd>
                </div>
                <div>
                  <dt>Target harian</dt>
                  <dd>{target} jam fokus</dd>
                </div>
                <div>
                  <dt>Tampilan</dt>
                  <dd>{themeLabel}</dd>
                </div>
              </dl>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                />
                <span>
                  Saya menyetujui{' '}
                  <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
                    Syarat & Ketentuan
                  </a>{' '}
                  dan{' '}
                  <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                    Kebijakan Privasi
                  </a>{' '}
                  {LEGAL.company}.
                </span>
              </label>
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
          {step < LAST ? (
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={finish}
              disabled={busy || !agreed}
            >
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Icon name="check" size={18} strokeWidth={2.1} />}
              Mulai bekerja
            </button>
          )}
        </footer>
      </div>
    </main>
  )
}
