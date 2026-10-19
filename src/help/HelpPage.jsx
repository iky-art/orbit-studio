import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { useHelpArticles } from '../hooks/useHelpArticles'
import { formatRelative } from '../lib/format'
import { Link } from '../lib/router'
import { Markdown } from '../lib/markdown'
import { LegalFooter, LegalHeader } from '../legal/LegalPage'

export function HelpPage({ path }) {
  const slug = decodeURIComponent(path.split('/')[2] ?? '')
  const { status, articles } = useHelpArticles()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const article = slug ? articles.find((item) => item.slug === slug) : null

  useEffect(() => {
    document.title = article
      ? `${article.title} — Pusat Bantuan Orbit Studio`
      : 'Pusat Bantuan — Orbit Studio'
  }, [article, slug])

  const categories = useMemo(
    () => Array.from(new Set(articles.map((item) => item.category))).sort((a, b) => a.localeCompare(b, 'id')),
    [articles],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter(
      (item) =>
        (!category || item.category === category) &&
        (!needle || `${item.title} ${item.excerpt} ${item.category}`.toLowerCase().includes(needle)),
    )
  }, [articles, query, category])

  return (
    <div className="legal-shell">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <LegalHeader sub="Bantuan" />

      <main id="main" className="legal-main">
        {slug ? (
          status === 'loading' ? (
            <p className="legal-lead">Memuat artikel…</p>
          ) : !article ? (
            <>
              <h1 className="legal-title">Artikel tidak ditemukan</h1>
              <p className="legal-lead">
                Artikel ini mungkin sudah dipindahkan atau belum terbit.{' '}
                <Link to="/help">Kembali ke Pusat Bantuan</Link>.
              </p>
            </>
          ) : (
            <article>
              <p className="legal-eyebrow">
                <Link to="/help">Pusat Bantuan</Link> · {article.category}
              </p>
              <h1 className="legal-title">{article.title}</h1>
              <p className="legal-lead">
                {article.author ? `${article.author} · ` : ''}
                Diperbarui {formatRelative(article.updatedAt)}
              </p>
              <div className="legal-section help-body">
                <Markdown source={article.body} />
              </div>
              <aside className="surface legal-highlights">
                <b>Belum terjawab?</b>
                <p className="help-cta">
                  Buat tiket dari <Link to="/app/settings">Pengaturan → Bantuan & masukan</Link> dan
                  tim akan membalas di sana.
                </p>
              </aside>
            </article>
          )
        ) : (
          <>
            <p className="legal-eyebrow">Pusat Bantuan</p>
            <h1 className="legal-title">Ada yang bisa kami bantu?</h1>
            <p className="legal-lead">
              Panduan memakai Orbit Studio, dari memulai sampai mengatur tim.
            </p>

            <label className="field help-search">
              <span className="sr-only">Cari artikel</span>
              <input
                className="field-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari artikel…"
              />
            </label>

            {categories.length > 1 ? (
              <div className="chip-row" role="group" aria-label="Kategori">
                <button
                  type="button"
                  className="chip"
                  aria-pressed={!category}
                  onClick={() => setCategory('')}
                >
                  Semua
                </button>
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}

            {status === 'loading' ? (
              <p className="legal-lead">Memuat artikel…</p>
            ) : filtered.length === 0 ? (
              <p className="legal-lead">
                {articles.length === 0
                  ? 'Belum ada artikel yang diterbitkan.'
                  : 'Tidak ada artikel yang cocok.'}
              </p>
            ) : (
              <div className="legal-cards help-list">
                {filtered.map((item) => (
                  <Link key={item.id} to={`/help/${item.slug}`} className="surface legal-card">
                    <b>{item.title}</b>
                    <span>{item.excerpt}</span>
                    <em>
                      {item.category} · Baca
                      <Icon name="arrowRight" size={15} />
                    </em>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <LegalFooter />
    </div>
  )
}
