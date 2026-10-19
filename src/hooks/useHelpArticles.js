import { useEffect, useMemo, useState } from 'react'
import { plainExcerpt, slugify } from '../lib/markdown'
import { DEMO_MODE, subscribe, subscribeWhere } from '../services/db'

/** Artikel Pusat Bantuan: konten berstatus "terbit" yang punya isi (real-time). */
export function useHelpArticles() {
  const [state, setState] = useState({ status: 'loading', rows: [] })

  useEffect(() => {
    const onData = (rows) => setState({ status: 'ready', rows })
    const onError = () => setState({ status: 'error', rows: [] })
    return DEMO_MODE
      ? subscribe('content', onData, onError)
      : subscribeWhere('content', 'status', 'terbit', onData, onError)
  }, [])

  const articles = useMemo(
    () =>
      state.rows
        .filter((row) => row.status === 'terbit' && String(row.body ?? '').trim())
        .map((row) => ({
          id: row.id,
          title: row.title,
          slug: String(row.slug ?? '').trim() || slugify(row.title),
          category: String(row.category ?? '').trim() || 'Umum',
          excerpt: String(row.excerpt ?? '').trim() || plainExcerpt(row.body),
          body: row.body,
          author: row.author,
          updatedAt: row.updatedAt ?? row.createdAt,
        }))
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
    [state.rows],
  )

  return { status: state.status, articles }
}
