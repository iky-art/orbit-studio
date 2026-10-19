import { create, remove, update } from './db'

const DAY = 86400000
export const TEAM_ROLES = { owner: 'Pemilik', admin: 'Admin', member: 'Anggota' }

export const membershipId = (teamId, uid) => `${teamId}_${uid}`
export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase()
const iso = (ms) => new Date(ms).toISOString()

/** Buat tim baru; pembuatnya otomatis menjadi pemilik. */
export async function createTeam(name, user) {
  const now = iso(Date.now())
  const team = await create('teams', {
    name: name.trim(),
    ownerUid: user.uid,
    lead: user.name,
    visibility: 'privat',
    createdAt: now,
  })
  await create('memberships', {
    id: membershipId(team.id, user.uid),
    teamId: team.id,
    teamName: team.name,
    uid: user.uid,
    name: user.name,
    email: normalizeEmail(user.email),
    role: 'owner',
    joinedAt: now,
  })
  return team
}

/** Undang lewat email. Undangan tampil di lonceng penerima saat ia masuk dengan email itu. */
export function inviteMember(membership, { email, role }, user) {
  const now = Date.now()
  return create('invitations', {
    teamId: membership.teamId,
    teamName: membership.teamName,
    email: normalizeEmail(email),
    role,
    status: 'tertunda',
    invitedByUid: user.uid,
    invitedBy: user.name,
    sentAt: iso(now),
    expiresAt: iso(now + 7 * DAY),
    createdAt: iso(now),
  })
}

export async function acceptInvitation(invitation, user) {
  const now = iso(Date.now())
  await create('memberships', {
    id: membershipId(invitation.teamId, user.uid),
    teamId: invitation.teamId,
    teamName: invitation.teamName,
    uid: user.uid,
    name: user.name,
    email: normalizeEmail(user.email),
    role: invitation.role,
    inviteId: invitation.id,
    joinedAt: now,
  })
  await update('invitations', invitation.id, { status: 'diterima', respondedAt: now })
}

export const declineInvitation = (invitation) =>
  update('invitations', invitation.id, { status: 'ditolak', respondedAt: iso(Date.now()) })

export const cancelInvitation = (invitation) => remove('invitations', invitation.id)
export const removeMember = (member) => remove('memberships', member.id)
export const setMemberRole = (member, role) => update('memberships', member.id, { role })

/** Hapus tim beserta keanggotaan dan undangannya (hanya pemilik). */
export async function deleteTeam(membership, members, invitations) {
  await Promise.all(
    members.filter((item) => item.id !== membership.id).map((item) => remove('memberships', item.id)),
  )
  await Promise.all(invitations.map((item) => remove('invitations', item.id)))
  await remove('teams', membership.teamId)
  await remove('memberships', membership.id)
}
