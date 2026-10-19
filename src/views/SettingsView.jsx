import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { APP_VERSION } from '../version'
import { PlanSection } from '../components/PlanSection'
import { SupportSection } from '../components/SupportSection'
import { ViewHeader } from '../components/ViewHeader'
import { useAuth } from '../providers/AuthProvider'
import { useSettings } from '../providers/SettingsProvider'
import { useToast } from '../providers/ToastProvider'
import { resetDemoData } from '../services/db'
import { listKeys } from '../services/storage'
import {
  ACCENT_OPTIONS,
  SETTINGS,
  SETTINGS_BY_GROUP,
} from '../services/settings'


function estimateStorage() {
  const keys = listKeys()
  let bytes = 0
  keys.forEach((key) => {
    try {
      bytes += (window.localStorage.getItem(`orbit:${key}`) ?? '').length
    } catch {
      /* ignore */
    }
  })
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

function SettingRow({ setting }) {
  const { values, setValue } = useSettings()
  const toast = useToast()
  const { user, updateProfile } = useAuth()
  const value = values[setting.id]

  const runAction = async () => {
    switch (setting.action) {
      case 'clearCache':
        listKeys()
          .filter((key) => key.startsWith('db:'))
          .forEach((key) => window.localStorage.removeItem(`orbit:${key}`))
        toast.success('Cache dibersihkan. Data dimuat ulang saat dibuka.')
        break
      case 'exportData': {
        const payload = {}
        listKeys().forEach((key) => {
          try {
            payload[key] = JSON.parse(window.localStorage.getItem(`orbit:${key}`))
          } catch {
            /* ignore */
          }
        })
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
        )
        const link = document.createElement('a')
        link.href = url
        link.download = `orbit-data-${new Date().toISOString().slice(0, 10)}.json`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Data diekspor sebagai JSON.')
        break
      }
      case 'importData': {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = () => toast.info('Berkas dipilih. Impor akan menimpa data lokal.')
        input.click()
        break
      }
      case 'resetDemo':
        resetDemoData()
        toast.success('Data demo dikembalikan ke kondisi awal.')
        break
      case 'openApiKeys':
        toast.info('Kunci API dikelola di Admin → Kunci API.')
        break
      case 'about':
        toast.info(`Orbit Studio Workbench v${APP_VERSION}`)
        break
      case 'licenses':
        toast.info('React, Vite, Firebase — lisensi MIT/Apache 2.0.')
        break
      case 'terms':
      case 'privacy':
        toast.info('Dokumen legal akan tersedia pada halaman publik.')
        break
      default:
        toast.info('Aksi dijalankan.')
    }
  }

  return (
    <div className="setting-row">
      <div className="setting-body">
        <p className="setting-title">{setting.label}</p>
        {setting.desc ? <p className="setting-desc">{setting.desc}</p> : null}
      </div>

      {setting.type === 'toggle' ? (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          aria-label={setting.label}
          className="switch"
          onClick={() => setValue(setting.id, !value)}
        />
      ) : null}

      {setting.type === 'segment' ? (
        <div className="seg" role="group" aria-label={setting.label}>
          {setting.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="seg-btn"
              aria-pressed={value === option.value}
              onClick={() => setValue(setting.id, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {setting.type === 'select' ? (
        <span className="select-wrap">
          <select
            value={value}
            aria-label={setting.label}
            onChange={(event) => setValue(setting.id, event.target.value)}
          >
            {setting.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={15} />
        </span>
      ) : null}

      {setting.type === 'slider' ? (
        <div className="slider-wrap">
          <input
            type="range"
            min={setting.min}
            max={setting.max}
            step={setting.step}
            value={value}
            aria-label={setting.label}
            onChange={(event) => setValue(setting.id, Number(event.target.value))}
          />
          <output className="slider-value">
            {value}
            {setting.unit}
          </output>
        </div>
      ) : null}

      {setting.type === 'accent' ? (
        <div className="accent-picker" role="radiogroup" aria-label={setting.label}>
          {ACCENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              aria-label={option.label}
              className="accent-swatch"
              style={{ '--swatch': option.value }}
              onClick={() => setValue(setting.id, option.value)}
            />
          ))}
        </div>
      ) : null}

      {setting.type === 'text' ? (
        <span className="field-inline">
          {setting.prefix ? <span className="field-prefix">{setting.prefix}</span> : null}
          <input
            className="field-input field-input-sm"
            type={setting.inputType ?? 'text'}
            value={value ?? ''}
            placeholder={setting.placeholder}
            aria-label={setting.label}
            onChange={(event) => setValue(setting.id, event.target.value)}
            onBlur={(event) => {
              if (setting.id === 'akun.name' && event.target.value.trim()) {
                updateProfile({ name: event.target.value.trim() })
              }
            }}
          />
        </span>
      ) : null}

      {setting.type === 'textarea' ? (
        <textarea
          className="field-input field-input-sm field-textarea"
          rows={2}
          maxLength={setting.maxLength}
          value={value ?? ''}
          placeholder={setting.placeholder}
          aria-label={setting.label}
          onChange={(event) => setValue(setting.id, event.target.value)}
        />
      ) : null}

      {setting.type === 'action' ? (
        <button
          type="button"
          className={setting.tone === 'danger' ? 'btn btn-danger btn-sm' : 'btn btn-ghost btn-sm'}
          onClick={runAction}
        >
          {setting.button}
        </button>
      ) : null}

      {setting.type === 'info' ? (
        <span className="info-value">
          {setting.action === 'storageUsage'
            ? estimateStorage()
            : setting.action === 'about'
              ? `v${APP_VERSION}`
              : String(value ?? '—')}
        </span>
      ) : null}
    </div>
  )
}

export function SettingsView() {
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState('')

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return SETTINGS_BY_GROUP
    return SETTINGS_BY_GROUP.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label} ${item.desc ?? ''}`.toLowerCase().includes(needle),
      ),
    })).filter((group) => group.items.length > 0)
  }, [query])

  const visibleCount = results.reduce((sum, group) => sum + group.items.length, 0)

  useEffect(() => {
    if (!activeGroup) return
    const node = document.getElementById(`grup-${activeGroup}`)
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeGroup])

  return (
    <>
      <ViewHeader
        eyebrow="Preferensi"
        title="Pengaturan"
        sub={`${SETTINGS.length} pengaturan dalam ${SETTINGS_BY_GROUP.length} grup. Tersimpan di perangkat ini dan siap disinkronkan ke Firestore.`}
      />

      <div className="section">
        <PlanSection />
      </div>

      <div className="section">
        <SupportSection />
      </div>

      <div className="settings-search">
        <label className="search-box">
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari pengaturan…"
            aria-label="Cari pengaturan"
          />
        </label>
        <span className="settings-count">{visibleCount} hasil</span>
      </div>

      <div className="group-nav" role="navigation" aria-label="Lompat ke grup">
        {SETTINGS_BY_GROUP.map((group) => (
          <button
            key={group.id}
            type="button"
            className="chip chip-sm"
            onClick={() => setActiveGroup(group.id)}
          >
            <Icon name={group.icon} size={14} />
            {group.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="surface settings-group">
          <p className="activity-empty">
            Tidak ada pengaturan yang cocok dengan “{query}”.
          </p>
        </div>
      ) : (
        results.map((group) => (
          <section className="surface settings-group" id={`grup-${group.id}`} key={group.id}>
            <header className="settings-group-head">
              <span className="settings-group-icon" aria-hidden="true">
                <Icon name={group.icon} size={18} />
              </span>
              <div>
                <h2 className="group-title">{group.label}</h2>
                <p className="group-desc">{group.desc}</p>
              </div>
              <span className="group-count">{group.items.length}</span>
            </header>
            {group.items.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))}
          </section>
        ))
      )}
    </>
  )
}
