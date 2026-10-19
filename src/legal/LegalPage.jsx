import { Icon } from '../components/Icon'
import { BrandMark } from '../components/BrandMark'
import { Link } from '../lib/router'
import { LEGAL } from './config'
import { LEGAL_DOCS, getLegalDoc } from './documents'

function Blocks({ body }) {
  return body.map((block, index) =>
    Array.isArray(block) ? (
      <ul key={index}>
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : (
      <p key={index}>{block}</p>
    ),
  )
}

export function LegalHeader({ sub = 'Legal' }) {
  return (
    <header className="legal-top">
      <Link to="/" className="brand" aria-label="Orbit Studio, halaman utama">
        <span className="brand-mark" aria-hidden="true">
          <BrandMark size={26} />
        </span>
        <span className="brand-text">
          <span className="brand-name">
            orbit<span className="slash">/</span>studio
          </span>
          <span className="brand-sub">{sub}</span>
        </span>
      </Link>
      <Link to="/app" className="btn btn-ghost btn-sm">
        Buka aplikasi
        <Icon name="arrowRight" size={15} />
      </Link>
    </header>
  )
}

export function LegalFooter() {
  return (
    <footer className="legal-foot">
      <span>© {new Date().getFullYear()} {LEGAL.company}</span>
      <nav aria-label="Dokumen legal">
        {LEGAL_DOCS.map((doc) => (
          <Link key={doc.slug} to={`/legal/${doc.slug}`}>
            {doc.title}
          </Link>
        ))}
      </nav>
    </footer>
  )
}

export function LegalPage({ path }) {
  const slug = path.split('/')[2]
  const doc = slug ? getLegalDoc(slug) : null
  const isIndex = !slug

  return (
    <div className="legal-shell">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <LegalHeader />

      <main id="main" className="legal-main">
        {isIndex ? (
          <>
            <p className="legal-eyebrow">Pusat legal</p>
            <h1 className="legal-title">Dokumen legal {LEGAL.company}</h1>
            <p className="legal-lead">
              Aturan pemakaian dan cara kami memperlakukan datamu, ditulis dengan bahasa
              yang sederhana. Terakhir diperbarui {LEGAL.updated}.
            </p>
            <div className="legal-cards">
              {LEGAL_DOCS.map((item) => (
                <Link key={item.slug} to={`/legal/${item.slug}`} className="surface legal-card">
                  <b>{item.title}</b>
                  <span>{item.summary}</span>
                  <em>
                    Baca
                    <Icon name="arrowRight" size={15} />
                  </em>
                </Link>
              ))}
            </div>
          </>
        ) : !doc ? (
          <>
            <h1 className="legal-title">Dokumen tidak ditemukan</h1>
            <p className="legal-lead">
              Dokumen legal <code>{slug}</code> tidak ada.{' '}
              <Link to="/legal">Lihat semua dokumen</Link>.
            </p>
          </>
        ) : (
          <>
            <nav className="legal-tabs" aria-label="Dokumen legal">
              {LEGAL_DOCS.map((item) => (
                <Link
                  key={item.slug}
                  to={`/legal/${item.slug}`}
                  className="chip"
                  aria-current={item.slug === doc.slug ? 'page' : undefined}
                >
                  {item.short}
                </Link>
              ))}
            </nav>

            <article>
              <p className="legal-eyebrow">Terakhir diperbarui {LEGAL.updated}</p>
              <h1 className="legal-title">{doc.title}</h1>
              <p className="legal-lead">{doc.summary}</p>

              {doc.highlights ? (
                <aside className="surface legal-highlights" aria-label="Ringkasan">
                  <b>Ringkasnya</b>
                  <ul>
                    {doc.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </aside>
              ) : null}

              <nav className="surface legal-toc" aria-label="Daftar isi">
                <b>Daftar isi</b>
                <ol>
                  {doc.sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.h.replace(/^\d+\.\s*/, '')}</a>
                    </li>
                  ))}
                </ol>
              </nav>

              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="legal-section">
                  <h2>{section.h}</h2>
                  <Blocks body={section.body} />
                </section>
              ))}
            </article>
          </>
        )}
      </main>

      <LegalFooter />
    </div>
  )
}
