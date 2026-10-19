import { APP_VERSION } from '../version'
import { BrandMark } from '../components/BrandMark'
import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { Link } from '../lib/router'
import { useSettings } from '../providers/SettingsProvider'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { MODE } from '../firebase/config'
import { PANEL_COUNT } from '../admin/panels'
import { SETTINGS_COUNT } from '../services/settings'

const MODE_LABEL = MODE === 'demo' ? 'mode demo' : 'Firebase'
import {
  Capabilities,
  Faq,
  FlowSteps,
  HonestNote,
  InstallGuide,
  PanelIndex,
  SettingsDepth,
  Pricing,
} from './LandingSections'

const NAV_LINKS = [
  { href: '#alur', label: 'Alur' },
  { href: '#kemampuan', label: 'Isi aplikasi' },
  { href: '#panel', label: 'Panel admin' },
  { href: '#pengaturan', label: 'Pengaturan' },
  { href: '#harga', label: 'Harga' },
  { href: '#pasang', label: 'Pasang' },
  { href: '#faq', label: 'FAQ' },
]

function LandingNav() {
  const { resolvedTheme, toggleTheme } = useSettings()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="land-nav">
      <div className="land-nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <BrandMark size={28} />
          </span>
          <span className="brand-text">
            <span className="brand-name">
              orbit<span className="slash">/</span>studio
            </span>
            <span className="brand-sub">Workbench</span>
          </span>
        </Link>

        <nav className="land-links" aria-label="Navigasi halaman">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="land-nav-actions">
          <button
            type="button"
            className="icon-btn icon-btn-sm"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <Link to="/app" className="btn btn-primary btn-sm land-cta">
            Buka aplikasi
            <Icon name="arrowRight" size={15} />
          </Link>
          <button
            type="button"
            className="icon-btn icon-btn-sm land-menu-btn"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="land-mobile-nav"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            <Icon name={open ? 'close' : 'list'} size={18} />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="land-mobile" id="land-mobile-nav" aria-label="Navigasi halaman (seluler)">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link to="/app" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
            Buka aplikasi
          </Link>
        </nav>
      ) : null}
    </header>
  )
}

function Hero() {
  const { canPrompt, installed, needsManualInstructions, promptInstall } = usePwaInstall()
  const [busy, setBusy] = useState(false)

  const install = async () => {
    if (!canPrompt) {
      document.getElementById('pasang')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setBusy(true)
    try {
      await promptInstall()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="land-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <span className="hero-dot" aria-hidden="true" />
          Progressive Web App · {PANEL_COUNT} panel admin · {SETTINGS_COUNT} pengaturan
        </p>

        <h1 className="hero-title" id="hero-title">
          Ruang kerja fokus, dengan konsol admin yang tumbuh bersama timmu.
        </h1>

        <p className="hero-lede">
          Dasbor sesi fokus, catatan aktivitas, dan wawasan yang berhitung dari
          datamu sendiri — ditambah konsol admin lengkap dan {SETTINGS_COUNT}{' '}
          pengaturan yang mengubah antarmuka secara nyata. Berjalan langsung di
          peramban, atau dipasang seperti aplikasi biasa.
        </p>

        <div className="hero-actions">
          <Link to="/app" className="btn btn-primary">
            Masuk ke aplikasi
            <Icon name="arrowRight" size={17} />
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={install}
            disabled={busy || installed}
          >
            <Icon name="download" size={16} />
            {installed ? 'Sudah terpasang' : needsManualInstructions ? 'Cara pasang' : 'Pasang aplikasi'}
          </button>
        </div>

        <p className="hero-meta">
          <Icon name="info" size={15} />
          Sedang berjalan di mode demo. Akun contoh:{' '}
          <b>admin@orbit.studio</b> · kata sandi <b>orbit1234</b>
        </p>
      </div>

      <figure className="hero-device">
        <div className="device-frame">
          <div className="device-top">
            <span className="device-brand">
              <BrandMark size={18} />
              orbit<span className="slash">/</span>studio
            </span>
            <span className="device-status">
              <span className="hero-dot" aria-hidden="true" />
              Sinkron
            </span>
          </div>

          <div className="device-body">
            <p className="preview-label">Ringkasan hari ini</p>
            <div className="preview-tiles">
              {['Sesi fokus', 'Tugas selesai', 'Aktivitas'].map((label) => (
                <div className="preview-tile" key={label}>
                  <span className="preview-tile-label">{label}</span>
                  <span className="preview-skel" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="preview-chart" aria-hidden="true">
              {[42, 58, 36, 74, 52, 88, 64].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <p className="preview-note">Grafik terisi dari datamu setelah masuk.</p>
          </div>

          <div className="device-dock" aria-hidden="true">
            {['home', 'activity', 'insights', 'settings'].map((name, index) => (
              <span className="device-dock-item" key={name} data-active={index === 0 ? 'true' : undefined}>
                <Icon name={name} size={18} strokeWidth={1.8} />
              </span>
            ))}
          </div>
        </div>
        <figcaption className="hero-caption">
          Pratinjau kerangka antarmuka — bukan tangkapan layar berisi angka.
        </figcaption>
      </figure>
    </section>
  )
}

function LandingFooter() {
  const { installed } = usePwaInstall()

  return (
    <footer className="land-foot">
      <div className="land-foot-main">
        <div className="land-foot-brand">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={26} />
            </span>
            <span className="brand-text">
              <span className="brand-name">
                orbit<span className="slash">/</span>studio
              </span>
              <span className="brand-sub">Workbench</span>
            </span>
          </span>
          <p className="land-foot-note">
            Kerangka kerja pribadi dengan konsol admin lengkap. Dibangun memakai
            React dan Vite, tanpa kerangka UI tambahan.
          </p>
          <p className="land-foot-meta">
            {installed ? 'Versi terpasang' : 'Versi web'} · v{APP_VERSION} ·{' '}
            {MODE_LABEL}
          </p>
        </div>

        <nav className="land-foot-cols" aria-label="Tautan kaki halaman">
          <div>
            <p className="land-foot-title">Aplikasi</p>
            <Link to="/app">Dasbor</Link>
            <Link to="/app/activity">Aktivitas</Link>
            <Link to="/app/insights">Insights</Link>
            <Link to="/app/settings">Pengaturan</Link>
          </div>
          <div>
            <p className="land-foot-title">Halaman ini</p>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div>
            <p className="land-foot-title">Konsol</p>
            <Link to="/app/admin">Ringkasan</Link>
            <Link to="/app/admin/analytics">Analitik</Link>
            <Link to="/app/admin/moderation">Moderasi</Link>
            <Link to="/app/admin/system">Status sistem</Link>
          </div>
          <div>
            <p className="land-foot-title">Bantuan</p>
            <Link to="/help">Pusat Bantuan</Link>
            <Link to="/app/settings">Buat tiket</Link>
          </div>
          <div>
            <p className="land-foot-title">Legal</p>
            <Link to="/legal/terms">Syarat & Ketentuan</Link>
            <Link to="/legal/privacy">Kebijakan Privasi</Link>
            <Link to="/legal/cookies">Cookie</Link>
          </div>
        </nav>
      </div>

      <p className="land-foot-bottom">
        <span>© {new Date().getFullYear()} Orbit Studio</span>
        <span>Data contoh dibuat lokal di perangkatmu.</span>
      </p>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <LandingNav />
      <main id="main">
        <Hero />
        <FlowSteps />
        <Capabilities />
        <PanelIndex />
        <SettingsDepth />
        <Pricing />
        <InstallGuide />
        <HonestNote />
        <Faq />
      </main>
      <LandingFooter />
    </div>
  )
}
