import { EntityPanel } from '../components/EntityPanel'
import { SCHEMAS } from '../schemas'
import { OverviewPanel } from './OverviewPanel'
import { AnalyticsPanel } from './AnalyticsPanel'
import { ModerationPanel } from './ModerationPanel'
import { FeedbackPanel } from './FeedbackPanel'
import { AuditPanel } from './AuditPanel'
import { SecurityPanel } from './SecurityPanel'
import { TicketsPanel } from './TicketsPanel'
import { SystemPanel } from './SystemPanel'
import { AnnouncementsPanel } from './AnnouncementsPanel'
import { BroadcastPanel } from './BroadcastPanel'

export const ADMIN_GROUPS = [
  { id: 'ikhtisar', label: 'Ikhtisar' },
  { id: 'pengguna', label: 'Pengguna' },
  { id: 'konten', label: 'Konten' },
  { id: 'komersial', label: 'Komersial' },
  { id: 'pertumbuhan', label: 'Pertumbuhan' },
  { id: 'keamanan', label: 'Keamanan' },
  { id: 'dukungan', label: 'Dukungan' },
  { id: 'sistem', label: 'Sistem' },
]

const CUSTOM_PANELS = {
  overview: {
    label: 'Ringkasan',
    icon: 'gauge',
    group: 'ikhtisar',
    blurb: 'Kondisi ruang kerja sekilas.',
    Panel: OverviewPanel,
  },
  analytics: {
    label: 'Analitik',
    icon: 'chart',
    group: 'ikhtisar',
    blurb: 'Pertumbuhan dan keterlibatan.',
    Panel: AnalyticsPanel,
  },
  moderation: {
    label: 'Moderasi',
    icon: 'flag',
    group: 'konten',
    blurb: 'Tinjau laporan konten.',
    Panel: ModerationPanel,
  },
  feedback: {
    label: 'Umpan Balik',
    icon: 'sparkles',
    group: 'pertumbuhan',
    blurb: 'Masukan pengguna dan sentimen.',
    Panel: FeedbackPanel,
  },
  broadcast: {
    label: 'Broadcast',
    icon: 'volume',
    group: 'pertumbuhan',
    blurb: 'Kirim pesan langsung ke pengguna secara real-time.',
    Panel: BroadcastPanel,
  },
  'audit-log': {
    label: 'Jejak Audit',
    icon: 'list',
    group: 'keamanan',
    blurb: 'Catatan perubahan sistem.',
    Panel: AuditPanel,
  },
  security: {
    label: 'Keamanan',
    icon: 'shieldCheck',
    group: 'keamanan',
    blurb: 'Peristiwa dan kesiapan keamanan.',
    Panel: SecurityPanel,
  },
  tickets: {
    label: 'Tiket Dukungan',
    icon: 'ticket',
    group: 'dukungan',
    blurb: 'Antrean bantuan pengguna.',
    Panel: TicketsPanel,
  },
  announcements: {
    label: 'Pengumuman',
    icon: 'megaphone',
    group: 'dukungan',
    blurb: 'Kabar dalam aplikasi.',
    Panel: AnnouncementsPanel,
  },
  system: {
    label: 'Status Sistem',
    icon: 'server',
    group: 'sistem',
    blurb: 'Kesehatan layanan dan pemeliharaan.',
    Panel: SystemPanel,
  },
}

export const ADMIN_PANELS = [
  ...Object.entries(CUSTOM_PANELS).map(([id, config]) => ({
    id,
    label: config.label,
    icon: config.icon,
    group: config.group,
    blurb: config.blurb,
    kind: 'custom',
    Panel: config.Panel,
  })),
  ...Object.entries(SCHEMAS).map(([id, schema]) => ({
    id,
    label: schema.label,
    icon: schema.icon,
    group: schema.group,
    blurb: schema.blurb,
    kind: 'entity',
    Panel: () => <EntityPanel schema={schema} />,
  })),
].sort((a, b) => {
  const orderA = ADMIN_GROUPS.findIndex((group) => group.id === a.group)
  const orderB = ADMIN_GROUPS.findIndex((group) => group.id === b.group)
  return orderA - orderB
})

export const PANELS_BY_GROUP = ADMIN_GROUPS.map((group) => ({
  ...group,
  panels: ADMIN_PANELS.filter((panel) => panel.group === group.id),
}))

export function getPanel(id) {
  return ADMIN_PANELS.find((panel) => panel.id === id) ?? null
}

export const DEFAULT_PANEL = 'overview'
export const PANEL_COUNT = ADMIN_PANELS.length
