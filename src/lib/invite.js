import { slugify } from './markdown'

export const PENDING_INVITE_KEY = 'pending-invite'

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

/** Token acak huruf+angka untuk tautan undangan (tanpa karakter yang mudah tertukar). */
export function makeToken(length = 12) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

export const teamSlug = (name) => slugify(name) || 'tim'

/** https://situs/<token>/invite/<slug-tim> */
export function inviteUrl(token, slug) {
  return `${window.location.origin}/${token}/invite/${slug}`
}

/** Cocokkan path `/<token>/invite/<slug>`; kembalikan null bila bukan tautan undangan. */
export function matchInvitePath(path) {
  const match = /^\/([a-z0-9]{8,40})\/invite\/([a-z0-9-]{1,80})\/?$/i.exec(path)
  return match ? { token: match[1].toLowerCase(), slug: match[2].toLowerCase() } : null
}
