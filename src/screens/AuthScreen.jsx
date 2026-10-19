import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { BrandMark } from '../components/BrandMark'
import { BroadcastItem } from '../components/BroadcastBanner'
import { useAppStatus } from '../hooks/useAppStatus'
import { useAuth } from '../providers/AuthProvider'
import { useToast } from '../providers/ToastProvider'
import { MODE } from '../firebase/config'
import { demoAccounts } from '../services/seed'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MODES = [
  { id: 'login', label: 'Masuk' },
  { id: 'register', label: 'Daftar' },
]

function fieldError(name, value, extra = {}) {
  if (name === 'name' && value.trim().length < 2) return 'Nama minimal 2 karakter.'
  if (name === 'email' && !EMAIL_RE.test(value.trim())) return 'Format email belum benar.'
  if (name === 'password' && value.length < 8) return 'Kata sandi minimal 8 karakter.'
  if (name === 'confirm' && value !== extra.password) return 'Kata sandi tidak sama.'
  return null
}

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const { maintenance, signupClosed } = useAppStatus()
  const toast = useToast()

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgot, setForgot] = useState(false)

  useEffect(() => {
    if (signupClosed && mode === 'register') setMode('login')
  }, [signupClosed, mode])

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: null }))
  }

  const validate = () => {
    const keys = mode === 'register' ? ['name', 'email', 'password', 'confirm'] : ['email', 'password']
    const next = {}
    keys.forEach((key) => {
      const message = fieldError(key, form[key], form)
      if (message) next[key] = message
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onGoogle = async () => {
    if (busy) return
    setBusy(true)
    setErrors({})
    try {
      const next = await signInWithGoogle()
      toast.success(`Selamat datang, ${next.name.split(' ')[0]}.`)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setBusy(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    if (mode === 'register') {
      if (!validate()) return
      setBusy(true)
      try {
        await signUp({ name: form.name, email: form.email, password: form.password })
        toast.success('Akun dibuat. Mari siapkan ruang kerjamu.')
      } catch (error) {
        setErrors({ form: error.message })
      } finally {
        setBusy(false)
      }
      return
    }

    if (!validate()) return
    setBusy(true)
    try {
      const session = await signIn(form.email, form.password)
      toast.success(`Selamat datang kembali, ${session.name.split(' ')[0]}.`)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setBusy(false)
    }
  }

  const handleForgot = async (event) => {
    event.preventDefault()
    if (!EMAIL_RE.test(form.email.trim())) {
      setErrors({ email: 'Masukkan email yang terdaftar.' })
      return
    }
    setBusy(true)
    try {
      await resetPassword(form.email)
      toast.success('Tautan atur ulang dikirim. Periksa kotak masukmu.')
      setForgot(false)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setBusy(false)
    }
  }

  const fillDemo = (account) => {
    setMode('login')
    setForgot(false)
    setErrors({})
    setForm({ name: '', email: account.email, password: account.password, confirm: '' })
  }

  return (
    <main className="auth" id="main">
      <div className="auth-panel">
        <header className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <BrandMark size={36} />
          </span>
          <h1 className="auth-title">
            {forgot ? 'Atur ulang sandi' : mode === 'login' ? 'Masuk ke workbench' : 'Buat akun baru'}
          </h1>
          <p className="auth-sub">
            {forgot
              ? 'Kami akan mengirim tautan pemulihan ke emailmu.'
              : mode === 'login'
                ? 'Lanjutkan ruang kerja, sesi fokus, dan panel adminmu.'
                : 'Satu akun untuk semua perangkat. Gratis untuk mulai.'}
          </p>
        </header>

        {maintenance ? (
          <BroadcastItem
            tone="warning"
            title="Sedang pemeliharaan"
            body="Hanya admin yang dapat masuk saat ini."
          />
        ) : null}

        {mode === 'register' && !forgot ? (
          <div className="auth-tabs" role="tablist" aria-label="Pilih mode">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mode === item.id}
                className="auth-tab"
                onClick={() => {
                  setMode(item.id)
                  setErrors({})
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={forgot ? handleForgot : submit} noValidate>
          {mode === 'register' && !forgot ? (
            <label className="field">
              <span className="field-label">Nama lengkap</span>
              <input
                type="text"
                className="field-input"
                value={form.name}
                onChange={update('name')}
                placeholder="Aria Rahman"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'err-name' : undefined}
              />
              {errors.name ? (
                <span className="field-error" id="err-name">{errors.name}</span>
              ) : null}
            </label>
          ) : null}

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              className="field-input"
              value={form.email}
              onChange={update('email')}
              placeholder="nama@contoh.id"
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'err-email' : undefined}
            />
            {errors.email ? (
              <span className="field-error" id="err-email">{errors.email}</span>
            ) : null}
          </label>

          {!forgot ? (
            <>
              <label className="field">
                <span className="field-label">Kata sandi</span>
                <span className="field-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input"
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Minimal 8 karakter"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'err-password' : undefined}
                  />
                  <button
                    type="button"
                    className="field-reveal"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon name={showPassword ? 'lock' : 'eye'} size={18} />
                  </button>
                </span>
                {errors.password ? (
                  <span className="field-error" id="err-password">{errors.password}</span>
                ) : null}
              </label>

              {mode === 'register' ? (
                <label className="field">
                  <span className="field-label">Ulangi kata sandi</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="field-input"
                    value={form.confirm}
                    onChange={update('confirm')}
                    placeholder="Ketik ulang sandi"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirm)}
                    aria-describedby={errors.confirm ? 'err-confirm' : undefined}
                  />
                  {errors.confirm ? (
                    <span className="field-error" id="err-confirm">{errors.confirm}</span>
                  ) : null}
                </label>
              ) : (
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setForgot(true)
                    setErrors({})
                  }}
                >
                  Lupa kata sandi?
                </button>
              )}
            </>
          ) : null}

          {errors.form ? (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={16} strokeWidth={1.9} />
              {errors.form}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? (
              <span className="btn-spinner" aria-hidden="true" />
            ) : (
              <Icon name={mode === 'login' ? 'logOut' : 'sparkles'} size={18} />
            )}
            {busy
              ? 'Memproses…'
              : forgot
                ? 'Kirim tautan pemulihan'
                : mode === 'login'
                  ? 'Masuk'
                  : 'Buat akun'}
          </button>

          {MODE === 'firebase' && !forgot && !signupClosed ? (
            <>
              <div className="auth-or" aria-hidden="true">
                <span>atau</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={onGoogle}
                disabled={busy}
              >
                <Icon name="globe" size={18} />
                Lanjut dengan Google
              </button>
            </>
          ) : null}

          {mode !== 'login' && !forgot ? (
            <p className="auth-legal">
              Dengan membuat akun, kamu menyetujui{' '}
              <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
                Syarat & Ketentuan
              </a>{' '}
              dan{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                Kebijakan Privasi
              </a>
              .
            </p>
          ) : null}

          {forgot ? (
            <button
              type="button"
              className="auth-link auth-link-center"
              onClick={() => {
                setForgot(false)
                setErrors({})
              }}
            >
              Kembali ke halaman masuk
            </button>
          ) : signupClosed && mode === 'login' ? (
            <p className="auth-switch">Pendaftaran akun baru sedang ditutup.</p>
          ) : (
            <p className="auth-switch">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setErrors({})
                }}
              >
                {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
              </button>
            </p>
          )}
        </form>

        {MODE === 'demo' && !forgot ? (
          <aside className="demo-card">
            <p className="demo-title">
              <Icon name="info" size={15} strokeWidth={1.9} />
              Mode demo — tanpa Firebase
            </p>
            <p className="demo-desc">
              Data contoh tersimpan lokal. Gunakan akun di bawah untuk mencoba
              peran admin dan anggota.
            </p>
            <div className="demo-accounts">
              {demoAccounts.map((account) => (
                <button
                  key={account.uid}
                  type="button"
                  className="demo-account"
                  onClick={() => fillDemo(account)}
                >
                  <span className="demo-account-role">
                    {account.role === 'member' ? 'Anggota' : 'Admin / Owner'}
                  </span>
                  <span className="demo-account-mail">{account.email}</span>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  )
}
