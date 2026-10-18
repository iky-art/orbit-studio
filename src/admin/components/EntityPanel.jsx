import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useCollection } from '../../hooks/useCollection'
import { authService } from '../../services/auth'
import { useToast } from '../../providers/ToastProvider'
import { formatDateTime, formatRelative } from '../../lib/format'
import { uid } from '../../lib/id'
import { Badge } from './Badge'
import { DataTable } from './DataTable'
import { ConfirmDialog, Drawer } from './Overlays'
import { EmptyState, LoadingRows, PanelHeader, StatStrip } from './PanelChrome'

const PAGE_SIZE = 8

function matches(row, search, keys) {
  if (!search) return true
  const needle = search.trim().toLowerCase()
  return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle))
}

function toCsv(columns, rows) {
  const head = columns.map((column) => `"${column.label}"`).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const raw = Array.isArray(row[column.key]) ? row[column.key].join(' | ') : row[column.key]
          return `"${String(raw ?? '').replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\n')
  return `${head}\n${body}`
}

export function EntityPanel({ schema }) {
  const { status, rows, error, refresh, patch, destroy, insert } = useCollection(schema.collection)
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [sort, setSort] = useState({ key: schema.defaultSort ?? schema.columns[0]?.key, dir: 'asc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [active, setActive] = useState(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({})
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState(false)

  const searchKeys = schema.searchKeys ?? schema.columns.map((column) => column.key)

  const filtered = useMemo(() => {
    let result = rows.filter((row) => matches(row, search, searchKeys))
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value) return
      result = result.filter((row) => String(row[key]) === String(value))
    })
    const { key, dir } = sort
    result = [...result].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
      return dir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''), 'id')
        : String(bv ?? '').localeCompare(String(av ?? ''), 'id')
    })
    return result
  }, [rows, search, searchKeys, filterValues, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const stats = useMemo(() => (schema.stats ? schema.stats(rows) : []), [schema, rows])

  const runAction = async () => {
    if (!pending) return
    const { action, row } = pending
    setBusy(true)
    try {
      if (action.effect === 'delete') {
        await destroy(row.id)
        toast.success(`${row[ schema.primaryKey ?? 'id' ] ?? 'Data'} dihapus.`)
        if (active && active.id === row.id) setActive(null)
      } else if (action.id === 'reset') {
        await authService.resetPassword(row.email)
        toast.success(`Tautan atur ulang sandi dikirim ke ${row.email}.`)
      } else if (action.patch) {
        await patch(row.id, action.patch)
        toast.success(action.success ?? `${action.label} berhasil.`)
        if (active?.id === row.id) setActive({ ...active, ...action.patch })
      } else {
        toast.info(`${action.label} dijalankan untuk data ini.`)
      }
    } catch (error) {
      toast.error(error?.message || 'Aksi gagal dijalankan.')
    } finally {
      setBusy(false)
      setPending(null)
      setSelected([])
    }
  }

  const exportCsv = () => {
    const csv = toCsv(schema.columns, filtered)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${schema.collection}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`${filtered.length} baris diekspor ke CSV.`)
  }

  const submitCreate = async () => {
    const required = (schema.createFields ?? []).filter((field) => field.required)
    const missing = required.find((field) => !String(draft[field.key] ?? '').trim())
    if (missing) {
      toast.error(`${missing.label} wajib diisi.`)
      return
    }
    setBusy(true)
    try {
      const record = {
        id: uid(schema.collection.slice(0, 3)),
        createdAt: new Date().toISOString(),
        ...(schema.createDefaults ?? {}),
      }
      ;(schema.createFields ?? []).forEach((field) => {
        const raw = draft[field.key] ?? field.default ?? ''
        record[field.key] = field.parse
          ? field.parse(raw)
          : field.type === 'number'
            ? Number(raw) || 0
            : raw
      })
      await insert(record)
      toast.success('Data baru ditambahkan.')
      setCreating(false)
      setDraft({})
      setPage(1)
    } finally {
      setBusy(false)
    }
  }

  const primaryKey = schema.primaryKey ?? schema.columns[0]?.key

  return (
    <>
      <PanelHeader
        eyebrow={schema.eyebrow}
        title={schema.title}
        blurb={schema.blurb}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={refresh} disabled={status === 'loading'}>
              <Icon name="refresh" size={16} />
              Segarkan
            </button>
            <button type="button" className="btn btn-ghost" onClick={exportCsv}>
              <Icon name="download" size={16} />
              Ekspor CSV
            </button>
            {schema.createFields ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setDraft({})
                  setCreating(true)
                }}
              >
                <Icon name="plus" size={17} strokeWidth={2.1} />
                {schema.createLabel ?? 'Tambah'}
              </button>
            ) : null}
          </>
        }
      />

      <StatStrip items={stats} />

      <section className="surface panel-table-card">
        <div className="toolbar">
          <label className="search-box">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={schema.searchPlaceholder ?? 'Cari…'}
              aria-label="Cari data"
            />
          </label>

          <div className="toolbar-filters">
            {(schema.filters ?? []).map((filter) => (
              <label className="select-wrap" key={filter.key}>
                <span className="sr-only">{filter.label}</span>
                <select
                  value={filterValues[filter.key] ?? ''}
                  onChange={(event) => {
                    setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                    setPage(1)
                  }}
                >
                  <option value="">{filter.label}: semua</option>
                  {filter.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" size={15} />
              </label>
            ))}
          </div>

          <span className="toolbar-count">
            {filtered.length} dari {rows.length}
          </span>
        </div>

        {selected.length > 0 ? (
          <div className="bulk-bar" role="region" aria-label="Aksi massal">
            <span className="bulk-count">{selected.length} dipilih</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                selected.forEach((id) => {
                  const row = rows.find((item) => item.id === id)
                  if (row) patch(id, { status: 'nonaktif' })
                })
                toast.success(`${selected.length} data dinonaktifkan.`)
                setSelected([])
              }}
            >
              <Icon name="pause" size={15} />
              Nonaktifkan
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                toast.success(`${selected.length} data diekspor.`)
                setSelected([])
              }}
            >
              <Icon name="download" size={15} />
              Ekspor pilihan
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>
              Bersihkan
            </button>
          </div>
        ) : null}

        {status === 'loading' ? (
          <LoadingRows rows={7} />
        ) : status === 'error' ? (
          <EmptyState
            icon="alert"
            title="Gagal memuat data"
            message={error?.message ?? 'Terjadi kesalahan saat mengambil data.'}
            action={
              <button type="button" className="btn btn-primary" onClick={refresh}>
                Coba lagi
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Tidak ada hasil"
            message={
              search || Object.values(filterValues).some(Boolean)
                ? 'Ubah kata kunci atau saringan untuk melihat data lain.'
                : 'Belum ada data pada panel ini.'
            }
            action={
              search ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSearch('')
                    setFilterValues({})
                  }}
                >
                  Bersihkan saringan
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <DataTable
              columns={schema.columns}
              rows={pageRows}
              sort={sort}
              onSort={setSort}
              selectable={schema.selectable !== false}
              selected={selected.filter((id) => pageRows.some((row) => row.id === id))}
              onToggleRow={(id) =>
                setSelected((current) =>
                  current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
                )
              }
              onToggleAll={(checked) =>
                setSelected(checked ? pageRows.map((row) => row.id) : [])
              }
              onRowClick={(row) => setActive(row)}
              activeId={active?.id}
            />
            <div className="pager">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
              >
                <Icon name="arrowLeft" size={15} />
                Sebelumnya
              </button>
              <span className="pager-info">
                Halaman {page} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
              >
                Berikutnya
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </>
        )}
      </section>

      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? String(active[primaryKey] ?? 'Detail') : ''}
        subtitle={schema.detailSubtitle?.(active ?? {})}
        footer={
          active ? (
            <div className="drawer-actions">
              {(schema.rowActions ?? []).map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={action.tone === 'danger' ? 'btn btn-danger btn-sm' : 'btn btn-ghost btn-sm'}
                  onClick={() => setPending({ action, row: active })}
                >
                  {action.icon ? <Icon name={action.icon} size={15} /> : null}
                  {action.label}
                </button>
              ))}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setActive(null)}>
                Selesai
              </button>
            </div>
          ) : null
        }
      >
        {active ? (
          <div className="drawer-content">
            {schema.detailRender ? schema.detailRender(active) : null}
            {(schema.detailFields ?? []).map((field) => (
              <div className="detail-row" key={field.key}>
                <span className="detail-label">{field.label}</span>
                <span className="detail-value">
                  {field.badge ? (
                    <Badge>{active[field.key]}</Badge>
                  ) : field.format === 'relative' ? (
                    formatRelative(active[field.key])
                  ) : field.format === 'datetime' ? (
                    formatDateTime(active[field.key])
                  ) : field.format === 'currency' ? (
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(Number(active[field.key]) || 0)
                  ) : Array.isArray(active[field.key]) ? (
                    active[field.key].join(', ')
                  ) : (
                    String(active[field.key] ?? '—')
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title={schema.createLabel ?? 'Tambah data'}
        subtitle="Isi kolom bertanda wajib, lalu simpan."
        footer={
          <div className="drawer-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreating(false)}>
              Batal
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={submitCreate} disabled={busy}>
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : <Icon name="check" size={16} strokeWidth={2.1} />}
              Simpan
            </button>
          </div>
        }
      >
        <div className="form-grid">
          {(schema.createFields ?? []).map((field) => (
            <label className="field" key={field.key}>
              <span className="field-label">
                {field.label}
                {field.required ? <span className="field-required">*</span> : null}
              </span>
              {field.type === 'select' ? (
                <span className="select-wrap select-block">
                  <select
                    value={draft[field.key] ?? field.options[0]}
                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <Icon name="chevronDown" size={15} />
                </span>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="field-input"
                  rows={3}
                  value={draft[field.key] ?? ''}
                  onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  className="field-input"
                  type={field.type ?? 'text'}
                  value={draft[field.key] ?? ''}
                  onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(pending)}
        tone={pending?.action?.tone === 'danger' ? 'danger' : 'default'}
        title={pending ? `${pending.action.label}?` : ''}
        message={
          pending
            ? `${pending.action.label} pada "${pending.row[primaryKey]}". Tindakan ini tercatat di jejak audit.`
            : ''
        }
        confirmLabel={pending?.action?.label ?? 'Lanjutkan'}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
