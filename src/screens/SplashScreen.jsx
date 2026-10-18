import { BrandMark } from '../components/BrandMark'

export function SplashScreen({ label = 'Menyiapkan ruang kerja' }) {
  return (
    <main className="splash" id="main" aria-busy="true">
      <div className="splash-inner" role="status" aria-live="polite">
        <span className="splash-mark">
          <BrandMark size={64} />
        </span>
        <p className="splash-brand">
          orbit<span>/</span>studio
        </p>
        <div className="splash-bar" aria-hidden="true">
          <i />
        </div>
        <p className="splash-label">{label}</p>
      </div>
      <p className="splash-foot">Workbench · PWA</p>
    </main>
  )
}
