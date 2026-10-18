import { useEffect, useRef } from 'react'
import { Icon } from '../../components/Icon'
import { formatDateTime, formatRelative } from '../../lib/format'

/** Sel tabel: memilih cara render berdasarkan `column`. */
export function Cell({ column, row }) {
  const value = row[column.key]

  if (column.render) return column.render(row)

  if (column.format === 'relative') {
    return <span title={formatDateTime(value)}>{formatRelative(value)}</span>
  }
  if (column.format === 'datetime') return <>{formatDateTime(value)}</>
  if (column.format === 'number') return <>{new Intl.NumberFormat('id-ID').format(Number(value) || 0)}</>
  if (column.format === 'currency') {
    return <>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0)}</>
  }
  if (column.format === 'percent') return <>{`${value}%`}</>
  if (column.format === 'list') {
    const list = Array.isArray(value) ? value : []
    return (
      <span className="cell-tags">
        {list.slice(0, 3).map((item) => (
          <span className="mini-tag" key={item}>{item}</span>
        ))}
        {list.length > 3 ? <span className="mini-tag">+{list.length - 3}</span> : null}
      </span>
    )
  }
  if (column.format === 'progress') {
    return (
      <span className="cell-progress">
        <span className="cell-progress-track">
          <i style={{ width: `${Math.min(100, Number(value) || 0)}%` }} />
        </span>
        <b>{value}%</b>
      </span>
    )
  }
  return <>{value ?? '—'}</>
}

export function DataTable({
  columns,
  rows,
  rowKey = 'id',
  sort,
  onSort,
  selectable = false,
  selected = [],
  onToggleRow,
  onToggleAll,
  onRowClick,
  activeId,
  emptyLabel = 'Tidak ada data.',
}) {
  const headRef = useRef(null)

  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const box = el.querySelector('input[type="checkbox"]')
    if (!box) return
    box.indeterminate = selected.length > 0 && selected.length < rows.length
  }, [selected, rows])

  const allSelected = rows.length > 0 && selected.length === rows.length

  return (
    <div className="dt-wrap">
      <table className="dt">
        <thead>
          <tr ref={headRef}>
            {selectable ? (
              <th className="dt-check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll?.(!allSelected)}
                  aria-label="Pilih semua baris"
                />
              </th>
            ) : null}
            {columns.map((column) => {
              const sortable = column.sortable !== false && !column.render
              const isActive = sort?.key === column.key
              return (
                <th
                  key={column.key}
                  className={column.className}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={
                    isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      className="dt-sort"
                      onClick={() =>
                        onSort?.({
                          key: column.key,
                          dir: isActive && sort.dir === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      {column.label}
                      <Icon
                        name={isActive && sort.dir === 'desc' ? 'chevronDown' : 'chevronUp'}
                        size={14}
                        strokeWidth={2}
                        className={isActive ? 'dt-sort-icon is-active' : 'dt-sort-icon'}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row[rowKey]
            const isActive = activeId != null && String(activeId) === String(key)
            const isSelected = selected.includes(key)
            return (
              <tr
                key={key}
                className={isActive ? 'is-active' : undefined}
                data-selected={isSelected || undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
              >
                {selectable ? (
                  <td className="dt-check" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow?.(key)}
                      aria-label={`Pilih baris ${key}`}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.label}
                    className={[
                      column.primary ? 'dt-primary' : '',
                      column.muted ? 'dt-muted' : '',
                      column.className ?? '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Cell column={column} row={row} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="dt-empty">{emptyLabel}</p> : null}
    </div>
  )
}
