import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { readJSON, writeJSON } from '../services/storage'

const DISMISS_KEY = 'install-banner-dismissed'

export function InstallBanner() {
  const { canPrompt, installed, needsManualInstructions, promptInstall, platform } = usePwaInstall()
  const [dismissed, setDismissed] = useState(() => readJSON(DISMISS_KEY, false))
  const [iosHelp, setIosHelp] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (installed) setDismissed(true)
  }, [installed])

  if (dismissed || installed) return null
  if (!canPrompt && !needsManualInstructions) return null

  const dismiss = () => {
    setDismissed(true)
    writeJSON(DISMISS_KEY, true)
  }

  const install = async () => {
    if (needsManualInstructions) {
      setIosHelp(true)
      return
    }
    setBusy(true)
    try {
      const outcome = await promptInstall()
      if (outcome === 'accepted') dismiss()
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="install-banner" aria-label="Pasang aplikasi">
      <span className="install-icon" aria-hidden="true">
        <Icon name="smartphone" size={20} />
      </span>
      <div className="install-body">
        <p className="install-title">Pasang Orbit Studio</p>
        <p className="install-desc">
          {platform === 'ios'
            ? 'Tambahkan ke Layar Utama untuk membuka sebagai aplikasi penuh.'
            : 'Buka langsung dari layar utama, tanpa bilah alamat, dan tetap jalan saat luring.'}
        </p>
        {iosHelp ? (
          <p className="install-steps">
            Ketuk <b>Bagikan</b> di Safari, lalu pilih <b>Tambahkan ke Layar Utama</b>.
          </p>
        ) : null}
      </div>
      <div className="install-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={install} disabled={busy}>
          <Icon name="download" size={15} />
          {needsManualInstructions ? 'Cara pasang' : 'Pasang'}
        </button>
        <button type="button" className="icon-btn icon-btn-sm" onClick={dismiss} aria-label="Tutup ajakan pemasangan">
          <Icon name="close" size={16} />
        </button>
      </div>
    </aside>
  )
}
