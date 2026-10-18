import { BrandMark } from '../components/BrandMark'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Link, useRouter } from '../lib/router'
import { useAuth } from '../providers/AuthProvider'
import { useSettings } from '../providers/SettingsProvider'
import { MODE } from '../firebase/config'
import { ADMIN_PANELS, PANELS_BY_GROUP, PANEL_COUNT } from './panels'

export function AdminLayout({ panel, children }) {
  const { path, navigate } = useRouter()
  const { user, isAdmin, signOut } = useAuth()
  const { resolvedTheme, toggleTheme } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [path])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return ADMIN_PANELS.slice(0, 8)
    return ADMIN_PANELS.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.blurb.toLowerCase().includes(needle) ||
        item.id.includes(needle),
    ).slice(0, 10)
  }, [search])

  const groupLabel =
    PANELS_BY_GROUP.find((group) => group.panels.some((item) => item.id === panel?.id))?.label ?? ''

  return (
    <div className="admin" data-nav={menuOpen ? 'open' : 'closed'}>
      <button
        type="button"
        className="admin-scrim"
        aria-label="Tutup menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <aside className="admin-side" aria-label="Navigasi panel admin">
        <div className="admin-side-head">
          <Link to="/app" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <BrandMark size={26} />
            </span>
            <span className="brand-text">
              <span className="brand-name">
                orbit<span className="slash">/</span>studio
              </span>
              <span className="brand-sub">Konsol Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="icon-btn icon-btn-sm admin-side-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup navigasi"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        <nav className="admin-nav">
          {PANELS_BY_GROUP.map((group) => (
            <div className="admin-nav-group" key={group.id}>
              <p className="admin-nav-label">{group.label}</p>
              <ul>
                {group.panels.map((item) => {
                  const active = panel?.id === item.id
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/app/admin/${item.id}`}
                        className="admin-nav-link"
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon name={item.icon} size={17} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-side-foot">
          <div className="admin-side-user">
            <span className="admin-avatar" aria-hidden="true">
              {(user?.name ?? '?').slice(0, 2).toUpperCase()}
            </span>
            <span className="admin-side-user-body">
              <span className="admin-side-user-name">{user?.name}</span>
              <span className="admin-side-user-role">{user?.role}</span>
            </span>
          </div>
          <Link to="/app" className="btn btn-ghost btn-sm admin-side-back">
            <Icon name="arrowLeft" size={15} />
            Kembali ke aplikasi
          </Link>
          <button type="button" className="btn btn-ghost btn-sm admin-side-back" onClick={signOut}>
            <Icon name="logOut" size={15} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <button
            type="button"
            className="icon-btn icon-btn-sm admin-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Buka navigasi panel"
            aria-expanded={menuOpen}
          >
            <Icon name="list" size={18} />
          </button>

          <div className="admin-crumbs">
            <span className="admin-crumb-root">Admin</span>
            {groupLabel && groupLabel !== panel?.label ? (
              <>
                <Icon name="chevronRight" size={14} />
                <span className="admin-crumb-group">{groupLabel}</span>
              </>
            ) : null}
            <Icon name="chevronRight" size={14} />
            <span className="admin-crumb-current">{panel?.label}</span>
          </div>

          <div className="admin-search" ref={searchRef}>
            <label className="search-box search-box-sm">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                placeholder={`Cari dari ${PANEL_COUNT} panel…`}
                aria-label="Cari panel admin"
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSearchOpen(true)
                }}
              />
            </label>
            {searchOpen ? (
              <div className="panel-picker" role="listbox" aria-label="Hasil pencarian panel">
                {results.length === 0 ? (
                  <p className="panel-picker-empty">Panel tidak ditemukan.</p>
                ) : (
                  results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={item.id === panel?.id}
                      className="panel-picker-item"
                      onClick={() => {
                        navigate(`/app/admin/${item.id}`)
                        setSearch('')
                        setSearchOpen(false)
                      }}
                    >
                      <span className="panel-picker-icon">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <span className="panel-picker-body">
                        <span className="panel-picker-label">{item.label}</span>
                        <span className="panel-picker-blurb">{item.blurb}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>

          <div className="admin-top-actions">
            {MODE === 'demo' ? <span className="mode-badge">Demo</span> : null}
            {isAdmin ? <span className="mode-badge mode-badge-admin">Admin</span> : null}
            <button
              type="button"
              className="icon-btn icon-btn-sm"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            >
              <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
          </div>
        </header>

        <main className="admin-content" id="main">
          {children}
        </main>
      </div>
    </div>
  )
}
