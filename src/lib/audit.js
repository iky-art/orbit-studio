import { create } from '../services/db'

/** Catat tindakan admin ke koleksi `auditLog` (tidak pernah melempar galat). */
export function logAudit({ actor, action, target, result = 'berhasil', severity = 'info' }) {
  return create('auditLog', {
    actor: actor || 'Admin',
    action,
    target: String(target ?? ''),
    ip: '—',
    result,
    severity,
    at: new Date().toISOString(),
  }).catch(() => {})
}
