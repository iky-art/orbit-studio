import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { useToast } from '../../providers/ToastProvider'
import { formatRelative } from '../../lib/format'
import { Badge } from '../components/Badge'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from '../components/PanelChrome'

const CATEGORIES = ['Fitur', 'Bug', 'Performa', 'Desain', 'Lainnya']
const SENTIMENTS = [
  { id: 'positif', label: 'Positif', icon: 'trendUp' },
  { id: 'netral', label: 'Netral', icon: 'dot' },
  { id: 'negatif', label: 'Negatif', icon: 'trendDown' },
]

export function FeedbackPanel() {
  const { status, rows, patch } = useCollection('feedback')
  const toast = useToast()
  const [category, setCategory] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [sort, setSort] = useState('votes')

  const filtered = useMemo(() => {
    let result = rows
    if (category) result = result.filter((row) => row.category === category)
    if (sentiment) result = result.filter((row) => row.sentiment === sentiment)
    return [...result].sort((a, b) =>
      sort === 'votes' ? b.votes - a.votes : new Date(b.createdAt) - new Date(a.createdAt),
    )
  }, [rows, category, sentiment, sort])

  const stats = useMemo(() => {
    const positive = rows.filter((r) => r.sentiment === 'positif').length
    return [
      { label: 'Total umpan balik', value: rows.length },
      { label: 'Sentimen positif', value: `${Math.round((positive / (rows.length || 1)) * 100)}%` },
      { label: 'Menunggu tindak lanjut', value: rows.filter((r) => r.status === 'baru').length },
      { label: 'Total dukungan', value: rows.reduce((s, r) => s + r.votes, 0), note: 'Suara pengguna' },
    ]
  }, [rows])

  const setStatus = async (row, next, message) => {
    await patch(row.id, { status: next })
    toast.success(message)
  }

  return (
    <>
      <PanelHeader
        eyebrow="Pertumbuhan"
        title="Umpan balik"
        blurb="Kumpulan masukan pengguna beserta sentimen dan dukungannya."
      />

      <StatStrip items={stats} />

      <div className="filter-row">
          <div className="chip-row" role="group" aria-label="Saring sentimen">
            <button type="button" className="chip" aria-pressed={!sentiment} onClick={() => setSentiment('')}>
              Semua sentimen
            </button>
            {SENTIMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={sentiment === item.id}
                onClick={() => setSentiment(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="select-wrap">
            <span className="sr-only">Kategori</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Kategori: semua</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={15} />
          </label>
          <label className="select-wrap">
            <span className="sr-only">Urutkan</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="votes">Terbanyak didukung</option>
              <option value="recent">Terbaru</option>
            </select>
            <Icon name="chevronDown" size={15} />
          </label>
      </div>

      {status === 'loading' ? (
        <LoadingRows rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="sparkles" title="Belum ada umpan balik" message="Masukan pengguna akan muncul di sini." />
      ) : (
        <div className="feedback-grid">
          {filtered.map((item) => (
            <article className="surface feedback-card" key={item.id}>
              <header className="feedback-head">
                <Badge>{item.category}</Badge>
                <span className={`sentiment sentiment-${item.sentiment}`}>
                  <Icon
                    name={item.sentiment === 'positif' ? 'trendUp' : item.sentiment === 'negatif' ? 'trendDown' : 'dot'}
                    size={14}
                  />
                  {item.sentiment}
                </span>
              </header>
              <p className="feedback-message">{item.message}</p>
              <footer className="feedback-foot">
                <span className="feedback-user">
                  <Icon name="userCircle" size={15} />
                  {item.user} · {formatRelative(item.createdAt)}
                </span>
                <span className="feedback-votes">
                  <Icon name="star" size={14} />
                  {item.votes}
                </span>
              </footer>
              <div className="feedback-actions">
                <Badge>{item.status}</Badge>
                {item.status !== 'direncanakan' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setStatus(item, 'direncanakan', 'Masuk daftar rencana.')}
                  >
                    Rencanakan
                  </button>
                ) : null}
                {item.status !== 'selesai' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setStatus(item, 'selesai', 'Ditandai selesai.')}
                  >
                    Tandai selesai
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
