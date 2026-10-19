import { Icon } from './Icon'
import { Link } from '../lib/router'
import { MODE } from '../firebase/config'
import { APP_VERSION_SHORT } from '../version'
import { SETTINGS_COUNT } from '../services/settings'

export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="footer">
      <span className="footer-brand">orbit/studio</span>
      <p className="footer-note">
        {MODE === 'firebase' ? 'Terhubung ke Firebase · real-time' : 'Data demo untuk pratinjau'} · <b>Workbench v{APP_VERSION_SHORT}</b> · {SETTINGS_COUNT} pengaturan
      </p>
      <Link to="/help" className="footer-top">
        Bantuan
      </Link>
      <Link to="/legal/privacy" className="footer-top">
        Privasi
      </Link>
      <Link to="/legal/terms" className="footer-top">
        Syarat
      </Link>
      <Link to="/" className="footer-top">
        Halaman utama
        <Icon name="arrowUpRight" size={14} strokeWidth={1.9} />
      </Link>
      <button type="button" className="footer-top" onClick={toTop}>
        Ke atas
        <Icon name="chevronUp" size={15} strokeWidth={1.9} />
      </button>
    </footer>
  )
}
