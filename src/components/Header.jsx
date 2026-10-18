import { BrandMark } from './BrandMark'
import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { NotificationBell } from './NotificationBell'
import { Link, useRouter } from '../lib/router'
import { useAuth } from '../providers/AuthProvider'
import { useSettings } from '../providers/SettingsProvider'
import { INITIALS } from '../lib/user'

export function Header() {
  const { path, navigate } = useRouter()
  const { user, isAdmin, signOut } = useAuth()
  const { resolvedTheme, toggleTheme } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setMenuOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [path])

  return (
    <header className="app-header">
      <Link to="/app" className="brand">
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

      <div className="header-actions">
        <span className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          <span>Sinkron</span>
        </span>

        <NotificationBell />

        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          title={resolvedTheme === 'dark' ? 'Tema terang' : 'Tema gelap'}
        >
          <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={20} />
        </button>

        <div className="avatar-wrap" ref={wrapRef}>
          <button
            type="button"
            className="avatar-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Akun ${user?.name ?? 'pengguna'}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{INITIALS(user?.name)}</span>
          </button>

          {menuOpen ? (
            <div className="account-pop" role="menu" aria-label="Menu akun">
              <p className="account-name">{user?.name}</p>
              <p className="account-role">
                {user?.email} · {user?.plan ?? 'Free'}
              </p>
              <div className="account-sep" />
              <button
                type="button"
                role="menuitem"
                className="account-item"
                onClick={() => navigate('/app/settings')}
              >
                <Icon name="settings" size={18} />
                Pengaturan
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  role="menuitem"
                  className="account-item"
                  onClick={() => navigate('/app/admin')}
                >
                  <Icon name="grid" size={18} />
                  Konsol admin
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="account-item"
                onClick={() => navigate('/')}
              >
                <Icon name="external" size={18} />
                Buka halaman utama
              </button>
              <div className="account-sep" />
              <button type="button" role="menuitem" className="account-item" onClick={signOut}>
                <Icon name="logOut" size={18} />
                Keluar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
