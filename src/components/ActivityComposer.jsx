import { useState } from 'react'
import { Icon } from './Icon'
import { ACTIVITY_TYPES } from '../lib/stats'
import { useToast } from '../providers/ToastProvider'

const EMPTY = { type: 'focus', title: '', project: '', minutes: '' }

/** Formulir ringkas untuk mencatat aktivitas baru (mode Firebase). */
export function ActivityComposer({ onAdd }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const set = (key) => (event) => setForm((cur) => ({ ...cur, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (busy || !form.title.trim()) return
    setBusy(true)
    try {
      await onAdd(form)
      toast.success('Aktivitas dicatat.')
      setForm(EMPTY)
      setOpen(false)
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan aktivitas.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <Icon name="sparkles" size={16} strokeWidth={1.9} />
        Catat aktivitas
      </button>
    )
  }

  return (
    <form className="surface composer" onSubmit={submit}>
      <label className="field">
        <span className="field-label">Jenis</span>
        <span className="select-wrap select-block">
          <select value={form.type} onChange={set('type')}>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </span>
      </label>
      <label className="field">
        <span className="field-label">
          Judul<span className="field-required">*</span>
        </span>
        <input
          className="field-input"
          value={form.title}
          onChange={set('title')}
          placeholder="Mis. Desain halaman login"
          maxLength={120}
          required
        />
      </label>
      <div className="composer-row">
        <label className="field">
          <span className="field-label">
            Proyek <span className="field-optional">(opsional)</span>
          </span>
          <input
            className="field-input"
            value={form.project}
            onChange={set('project')}
            placeholder="Nama proyek"
            maxLength={60}
          />
        </label>
        <label className="field">
          <span className="field-label">
            Menit <span className="field-optional">(opsional)</span>
          </span>
          <input
            className="field-input"
            type="number"
            inputMode="numeric"
            min="1"
            max="1440"
            value={form.minutes}
            onChange={set('minutes')}
            placeholder="25"
          />
        </label>
      </div>
      <div className="composer-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Batal
        </button>
      </div>
    </form>
  )
}
