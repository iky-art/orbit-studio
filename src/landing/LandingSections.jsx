import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Link } from '../lib/router'
import { MODE } from '../firebase/config'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { PANELS_BY_GROUP, PANEL_COUNT } from '../admin/panels'
import { SETTINGS, SETTINGS_BY_GROUP } from '../services/settings'
import { PlanCards } from '../components/PlanCards'
import { usePlans } from '../hooks/usePlans'
import { LEGAL } from '../legal/config'

/* ------------------------------------------------------------------ alur */

const FLOW = [
  {
    icon: 'rocket',
    title: 'Splash singkat',
    text: 'Layar pembuka menandai sesi dimuat. Minimal 1,2 detik agar tidak berkedip.',
  },
  {
    icon: 'lock',
    title: 'Masuk atau daftar',
    text: 'Formulir tunggal dengan validasi, pemulihan kata sandi, dan akun demo siap pakai.',
  },
  {
    icon: 'target',
    title: 'Onboarding 4 langkah',
    text: 'Peran, gaya kerja, tema, dan preferensi notifikasi disimpan ke profilmu.',
  },
  {
    icon: 'grid',
    title: 'Ruang kerja',
    text: 'Dasbor utama hingga konsol admin, semuanya di dalam satu aplikasi terpasang.',
  },
]

export function FlowSteps() {
  return (
    <section className="land-section" id="alur" aria-labelledby="alur-title">
      <header className="land-head">
        <p className="land-eyebrow">Alur aplikasi</p>
        <h2 className="land-title" id="alur-title">
          Empat langkah dari ikon ke ruang kerja
        </h2>
        <p className="land-lede">
          Tidak ada halaman tersembunyi atau lompatan konteks. Setiap langkah punya
          satu tujuan, dan semuanya dapat dilewati dengan jelas.
        </p>
      </header>

      <ol className="flow">
        {FLOW.map((step, index) => (
          <li className="flow-step" key={step.title}>
            <span className="flow-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flow-icon" aria-hidden="true">
              <Icon name={step.icon} size={19} />
            </span>
            <div className="flow-body">
              <h3 className="flow-title">{step.title}</h3>
              <p className="flow-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ------------------------------------------------------------ kemampuan */

const CAPABILITIES = [
  {
    icon: 'gauge',
    title: 'Dasbor yang berbicara angka nyata',
    text: 'Metrik sesi fokus, ringkasan aktivitas, dan wawasan terhitung dari data yang benar-benar ada di ruang kerjamu — bukan angka hiasan.',
  },
  {
    icon: 'layers',
    title: 'Sembilan grup konsol admin',
    text: 'Dari ikhtisar, pengguna, konten, komersial, pertumbuhan, keamanan, dukungan, hingga sistem. Tabel, penyaring, dan aksi massal di setiap panel.',
  },
  {
    icon: 'palette',
    title: 'Pengaturan yang mengubah tampilan',
    text: 'Aksen, skala teks, radius, intensitas kaca, kepadatan, kontras, hingga palet aman buta warna — semuanya diterapkan langsung ke token CSS.',
  },
  {
    icon: 'smartphone',
    title: 'Terpasang seperti aplikasi biasa',
    text: 'Web App Manifest, service worker, ikon maskable, dan layar luring. Siap dibungkus menjadi APK Android lewat Bubblewrap.',
  },
]

export function Capabilities() {
  return (
    <section className="land-section" id="kemampuan" aria-labelledby="kemampuan-title">
      <header className="land-head">
        <p className="land-eyebrow">Isi aplikasi</p>
        <h2 className="land-title" id="kemampuan-title">
          Dibangun untuk dipakai, bukan dipamerkan
        </h2>
      </header>

      <div className="cap-grid">
        {CAPABILITIES.map((item) => (
          <article className="cap-card surface" key={item.title}>
            <span className="cap-icon" aria-hidden="true">
              <Icon name={item.icon} size={19} />
            </span>
            <h3 className="cap-title">{item.title}</h3>
            <p className="cap-text">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------- indeks 32 panel */

export function PanelIndex() {
  return (
    <section className="land-section" id="panel" aria-labelledby="panel-title">
      <header className="land-head land-head-row">
        <div>
          <p className="land-eyebrow">Konsol admin</p>
          <h2 className="land-title" id="panel-title">
            {PANEL_COUNT} panel, terkelompok dan bisa dicari
          </h2>
          <p className="land-lede">
            Tekan <kbd>⌘K</kbd> di konsol — atau pakai kolom pencarian — untuk
            berpindah panel. Ini daftar lengkapnya.
          </p>
        </div>
        <Link to="/app/admin" className="btn btn-ghost">
          <Icon name="arrowRight" size={16} />
          Buka konsol
        </Link>
      </header>

      <div className="index-grid">
        {PANELS_BY_GROUP.map((group) => (
          <div className="index-col" key={group.id}>
            <p className="index-col-label">
              {group.label}
              <span>{group.panels.length}</span>
            </p>
            <ul className="index-list">
              {group.panels.map((panel) => (
                <li key={panel.id}>
                  <Link to={`/app/admin/${panel.id}`} className="index-item">
                    <Icon name={panel.icon} size={15} />
                    <span>{panel.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------- kedalaman pengaturan */

export function SettingsDepth() {
  return (
    <section className="land-section" id="pengaturan" aria-labelledby="pengaturan-title">
      <header className="land-head">
        <p className="land-eyebrow">Preferensi</p>
        <h2 className="land-title" id="pengaturan-title">
          {SETTINGS.length} pengaturan di {SETTINGS_BY_GROUP.length} grup
        </h2>
        <p className="land-lede">
          Setiap sakelar mengubah perilaku aplikasi — bukan sekadar tersimpan dan
          terlupakan.
        </p>
      </header>

      <ul className="group-list">
        {SETTINGS_BY_GROUP.map((group) => (
          <li className="group-item" key={group.id}>
            <span className="group-item-icon" aria-hidden="true">
              <Icon name={group.icon} size={17} />
            </span>
            <div className="group-item-body">
              <p className="group-item-title">{group.label}</p>
              <p className="group-item-desc">{group.desc}</p>
            </div>
            <span className="group-item-count">{group.items.length}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------- panduan pemasangan */

const INSTALL_STEPS = {
  android: [
    'Buka situs ini di Chrome for Android.',
    'Ketuk tombol "Pasang aplikasi" di bawah, atau menu ⋮ → "Tambahkan ke layar utama".',
    'Konfirmasi. Ikon Orbit Studio muncul di laci aplikasi dan berjalan layar penuh.',
  ],
  ios: [
    'Buka situs ini di Safari (bukan peramban dalam aplikasi).',
    'Ketuk tombol Bagikan.',
    'Pilih "Tambahkan ke Layar Utama", lalu ketuk Tambah.',
  ],
  desktop: [
    'Buka situs ini di Chrome atau Edge.',
    'Klik ikon pasang di bilah alamat, atau menu → "Pasang Orbit Studio".',
    'Aplikasi terbuka di jendela sendiri tanpa bilah alamat.',
  ],
}

export function InstallGuide() {
  const { canPrompt, installed, promptInstall, platform, needsManualInstructions } =
    usePwaInstall()
  const initial = INSTALL_STEPS[platform] ? platform : 'desktop'
  const [tab, setTab] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const install = async () => {
    setBusy(true)
    try {
      const outcome = await promptInstall()
      if (outcome === 'accepted') setMessage('Pemasangan dimulai. Cek laci aplikasi.')
      else if (outcome === 'unavailable')
        setMessage('Peramban ini belum menawarkan pemasangan otomatis — ikuti langkah di samping.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="land-section" id="pasang" aria-labelledby="pasang-title">
      <header className="land-head">
        <p className="land-eyebrow">Pemasangan</p>
        <h2 className="land-title" id="pasang-title">
          Pasang sebagai aplikasi
        </h2>
        <p className="land-lede">
          Orbit Studio adalah Progressive Web App. Setelah dipasang, ia berjalan
          layar penuh, punya ikon sendiri, dan tetap membuka kerangka aplikasi saat
          koneksi putus.
        </p>
      </header>

      <div className="install-panel surface">
        <div className="install-main">
          <span className="install-mark" aria-hidden="true">
            <Icon name="smartphone" size={22} />
          </span>
          <div>
            <p className="install-title">
              {installed ? 'Sudah terpasang di perangkat ini' : 'Orbit Studio Workbench'}
            </p>
            <p className="install-note">
              {installed
                ? 'Kamu sedang membuka versi terpasang. Semua fitur sama dengan versi web.'
                : needsManualInstructions
                  ? 'Peramban saat ini perlu langkah manual — lihat panduan per platform.'
                  : 'Ukuran pemasangan kecil karena aset diambil dari cache setelah kunjungan pertama.'}
            </p>
            {message ? <p className="install-msg">{message}</p> : null}
          </div>
          {!installed ? (
            <button
              type="button"
              className="btn btn-primary install-cta"
              onClick={install}
              disabled={busy || !canPrompt}
            >
              <Icon name="download" size={16} />
              {canPrompt ? 'Pasang aplikasi' : 'Ikuti panduan'}
            </button>
          ) : null}
        </div>

        <div className="install-tabs" role="tablist" aria-label="Platform pemasangan">
          {[
            { id: 'android', label: 'Android' },
            { id: 'ios', label: 'iOS / iPadOS' },
            { id: 'desktop', label: 'Desktop' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`install-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`install-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className="install-tab"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`install-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`install-tab-${tab}`}
        >
          <ol className="install-steps-list">
            {INSTALL_STEPS[tab].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <p className="install-foot">
          <Icon name="code" size={15} />
          Untuk APK Android, bungkus dengan Bubblewrap — panduan ada di{' '}
          <code>ANDROID.md</code>.
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- catatan jujur */

export function HonestNote() {
  return (
    <section className="land-section" id="backend" aria-labelledby="backend-title">
      <div className="note surface">
        <div className="note-head">
          <span className="note-icon" aria-hidden="true">
            <Icon name="database" size={20} />
          </span>
          <div>
            <h2 className="note-title" id="backend-title">
              Soal data: apa adanya
            </h2>
            <p className="note-badge">
              Mode aktif: <b>{MODE === 'demo' ? 'demo lokal' : 'Firebase'}</b>
            </p>
          </div>
        </div>

        <div className="note-cols">
          <div>
            <h3 className="note-sub">Mode demo (bawaan)</h3>
            <p className="note-text">
              Semua koleksi contoh dibuat lokal di perangkat ini dan bisa direset
              kapan saja dari Pengaturan → Data. Tidak ada permintaan ke server, jadi
              aplikasi berjalan penuh tanpa konfigurasi apa pun. Data ini contoh —
              bukan data pelanggan sungguhan.
            </p>
          </div>
          <div>
            <h3 className="note-sub">Menuju Firebase</h3>
            <p className="note-text">
              Lapisan data sudah punya adapter: isi kunci proyek pada berkas{' '}
              <code>.env</code> (lihat <code>.env.example</code>), lalu aplikasi
              otomatis memakai Authentication dan Firestore. Tidak ada kode yang
              perlu ditulis ulang.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- FAQ */

const FAQ = [
  {
    q: 'Apakah aplikasi ini butuh server?',
    a: 'Tidak untuk mencoba. Mode demo menyimpan semuanya di perangkat. Untuk produksi, sambungkan proyek Firebase-mu lewat berkas .env — adapter Firestore sudah tersedia.',
  },
  {
    q: 'Bagaimana kalau perangkat sedang luring?',
    a: 'Service worker menyimpan kerangka aplikasi, ikon, dan font. Halaman navigasi memakai strategi network-first dengan fallback ke cache, dan ada halaman offline khusus.',
  },
  {
    q: 'Apakah bisa jadi APK Android?',
    a: 'Bisa. Karena sudah memenuhi syarat PWA (manifest, ikon maskable, service worker, HTTPS), proyek ini dapat dibungkus memakai Bubblewrap atau PWABuilder menjadi Trusted Web Activity.',
  },
  {
    q: 'Apakah pengaturan benar-benar berpengaruh?',
    a: 'Ya. Perubahan aksen, ukuran teks, radius, kepadatan, kontras, transparansi, dan mode buta warna diterapkan sebagai token CSS pada dokumen, sehingga seluruh antarmuka ikut berubah saat itu juga.',
  },
  {
    q: 'Siapa yang bisa membuka konsol admin?',
    a: 'Hanya akun dengan peran owner atau admin. Akun demo admin@orbit.studio sudah memiliki akses; peran lain akan melihat halaman akses ditolak.',
  },
]

export function Faq() {
  return (
    <section className="land-section" id="faq" aria-labelledby="faq-title">
      <header className="land-head">
        <p className="land-eyebrow">Pertanyaan</p>
        <h2 className="land-title" id="faq-title">
          Hal yang sering ditanyakan
        </h2>
      </header>

      <div className="faq">
        {FAQ.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary className="faq-q">
              <span>{item.q}</span>
              <Icon name="chevronDown" size={17} />
            </summary>
            <p className="faq-a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- harga */

export function Pricing() {
  const { status, plans } = usePlans()

  return (
    <section className="land-section" id="harga" aria-labelledby="harga-title">
      <header className="land-head">
        <p className="land-eyebrow">Harga</p>
        <h2 className="land-title" id="harga-title">
          Pilih paket yang pas
        </h2>
        <p className="land-lede">
          Mulai gratis dan naik paket saat dibutuhkan. Daftar di bawah dikelola dari
          konsol admin, jadi selalu yang terbaru.
        </p>
      </header>

      {status === 'loading' ? (
        <p className="land-note">Memuat paket…</p>
      ) : plans.length === 0 ? (
        <p className="land-note">Daftar paket akan segera diumumkan.</p>
      ) : (
        <>
          <PlanCards
            plans={plans}
            renderAction={(plan) =>
              plan.kind === 'contact' ? (
                LEGAL.email ? (
                  <a className="btn btn-ghost btn-block" href={`mailto:${LEGAL.email}`}>
                    Hubungi kami
                  </a>
                ) : null
              ) : (
                <Link
                  to="/app"
                  className={`btn btn-block ${plan.popular ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {plan.kind === 'free' ? 'Mulai gratis' : 'Mulai sekarang'}
                </Link>
              )
            }
          />
          <p className="land-note">
            Pembayaran online belum tersedia. Paket berbayar diaktifkan oleh admin
            setelah kamu menghubungi kami.
          </p>
        </>
      )}
    </section>
  )
}
