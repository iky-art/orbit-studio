/**
 * Set ikon garis 24×24 (gaya Lucide). Tanpa emoji, satu ketebalan garis,
 * semua memakai `currentColor`.
 */
const P = {
  // ------------------------------------------------ navigasi & inti
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.6v9a1.4 1.4 0 0 0 1.4 1.4h10.2a1.4 1.4 0 0 0 1.4-1.4v-9" />
      <path d="M9.7 20v-5.2h4.6V20" />
    </>
  ),
  activity: <path d="M2.8 12.5h3.9l2.4-7.2 4.1 14 2.4-6.8h5.6" />,
  insights: (
    <>
      <path d="M4.5 20V10.5" />
      <path d="M12 20V4.5" />
      <path d="M19.5 20v-6.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7.5h8.5" />
      <path d="M18.5 7.5H20" />
      <circle cx="15.5" cy="7.5" r="2.2" />
      <path d="M4 16.5h1.5" />
      <path d="M11.5 16.5H20" />
      <circle cx="8.5" cy="16.5" r="2.2" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.7" />
      <ellipse cx="12" cy="12" rx="9.1" ry="4.3" transform="rotate(-30 12 12)" />
      <circle cx="18.6" cy="8.2" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.3M12 19.1v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.4A8.1 8.1 0 0 1 9.6 4a8.1 8.1 0 1 0 10.4 10.4Z" />,
  monitor: (
    <>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.2" />
      <path d="M9 20.5h6M12 17v3.5" />
    </>
  ),
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
      <path d="M11 18.5h2" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  list: (
    <>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" />
      <path d="M4 6.5h.01M4 12h.01M4 17.5h.01" />
    </>
  ),

  // ------------------------------------------------ panel admin
  chart: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M6.8 20.5v-6.2" />
      <path d="M11 20.5V8.4" />
      <path d="M15.2 20.5v-4.2" />
      <path d="M19.4 20.5V5.6" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 18a9 9 0 1 1 16 0" />
      <path d="m12 14 3.5-3.5" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  fileText: (
    <>
      <path d="M6 3.5h7.2L19 9.3v11.2H6Z" />
      <path d="M13.2 3.5V9.3H19" />
      <path d="M9 13h6M9 16.4h4" />
    </>
  ),
  folder: (
    <path d="M3.5 7.2a2 2 0 0 1 2-2h3.3l1.8 2.2h8a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.4" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.6 17.4 4.4-4.3 3.2 3.1 3-2.8 4.2 4" />
    </>
  ),
  tags: (
    <>
      <path d="M11.6 3.5H20v8.4l-8.4 8.4a1.6 1.6 0 0 1-2.3 0l-6.1-6.1a1.6 1.6 0 0 1 0-2.3Z" />
      <circle cx="16.4" cy="7.6" r="1.3" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.6h11.9l-2.2 4 2.2 4H5.5" />
    </>
  ),
  shield: (
    <path d="M12 21.5c4.4-1.8 7-5.3 7-9.4V5.6L12 2.9 5 5.6v6.5c0 4.1 2.6 7.6 7 9.4Z" />
  ),
  shieldCheck: (
    <>
      <path d="M12 21c4.2-1.7 6.6-5 6.6-8.9V6.1L12 3.6 5.4 6.1v6c0 3.9 2.4 7.2 6.6 8.9Z" />
      <path d="m9.2 11.8 2 2 3.6-3.6" />
    </>
  ),
  key: (
    <>
      <circle cx="8.5" cy="15.5" r="3.5" />
      <path d="m11 13 8-8" />
      <path d="m16.5 7.5 2 2" />
      <path d="m14.5 9.5 2 2" />
    </>
  ),
  link: (
    <>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.6 5a3.8 3.8 0 0 1 5.4 5.4L16.4 12" />
      <path d="M13 17.5 11.4 19a3.8 3.8 0 0 1-5.4-5.4L7.6 12" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8.5V6.5h16v2a2.5 2.5 0 0 0 0 7v2H4v-2a2.5 2.5 0 0 0 0-7Z" />
      <path d="M13 6.5v11" strokeDasharray="2 2.5" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10.5v3.4a1.5 1.5 0 0 0 1.5 1.5H8l6.5 3.6V5.4L8 9H5.5A1.5 1.5 0 0 0 4 10.5Z" />
      <path d="M17.5 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  server: (
    <>
      <rect x="3.5" y="4" width="17" height="7" rx="2" />
      <rect x="3.5" y="13" width="17" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  archive: (
    <>
      <rect x="3.5" y="4.5" width="17" height="5" rx="1.6" />
      <path d="M5 9.5v9.4h14V9.5" />
      <path d="M10 13.2h4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </>
  ),
  creditCard: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="M3 10h18" />
      <path d="M7 14.5h3" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </>
  ),
  percent: (
    <>
      <path d="M6.5 17.5 17.5 6.5" />
      <circle cx="7.8" cy="7.8" r="2.3" />
      <circle cx="16.2" cy="16.2" r="2.3" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9Z" />
      <path d="M18.6 16.4 19.3 18.5 21 19.2 19.3 19.9 18.6 22 17.9 19.9 16.2 19.2 17.9 18.5Z" />
    </>
  ),
  box: (
    <>
      <path d="M20.5 7.8v8.4L12 21 3.5 16.2V7.8L12 3Z" />
      <path d="M3.5 7.8 12 12.6l8.5-4.8" />
      <path d="M12 12.6V21" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 2.6 15.4 0 18-2.6-2.6-2.6-15.4 0-18Z" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5M15 3v5" />
      <path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0V8Z" />
      <path d="M12 16.5V21" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    </>
  ),
  building: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.8" />
      <path d="M9 8h1.5M9 12h1.5M13.5 8H15M13.5 12H15" />
      <path d="M10 20.5v-4h4v4" />
    </>
  ),

  // ------------------------------------------------ aksi
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M3.5 5.5h17l-6.6 7.6v6.2l-3.8-2.2v-4Z" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <path d="M16.5 4.6 19.4 7.5 9 17.9l-4 1.1 1.1-4Z" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.8h5V7" />
      <path d="M6.5 7l1 12.2h9L17.5 7" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 20V9" />
      <path d="m7.5 13.5 4.5-4.5 4.5 4.5" />
      <path d="M4.5 4.5h15" />
    </>
  ),
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14v5.5H4.5V6H10" />
    </>
  ),
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 4.5V10h-5.5" />
    </>
  ),
  check: <path d="M20 6.5 9.5 17 4 11.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.1" />
      <path d="M12 7.6V12l3 1.9" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3Z" />
      <path d="M12 10v4" />
      <path d="M12 16.8h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  star: (
    <path d="m12 4 2.4 5.1 5.6.7-4.1 3.9 1 5.6L12 16.6 7.1 19.3l1-5.6L4 9.8l5.6-.7Z" />
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5.5 6.5 9H3.5v6h3L11 18.5V5.5Z" />
      <path d="M15 9.2a4 4 0 0 1 0 5.6" />
      <path d="M17.6 6.6a7.6 7.6 0 0 1 0 10.8" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 1.6-1.2 2.8-2.8 2.8h-1.5a2 2 0 0 0-1.4 3.4 1.9 1.9 0 0 1-1.3 3.3Z" />
      <circle cx="7.6" cy="12" r="1" />
      <circle cx="10" cy="7.6" r="1" />
      <circle cx="14.4" cy="7.6" r="1" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="12" cy="4.6" r="1.7" />
      <path d="M4.6 8.6h14.8" />
      <path d="M12 8.6v5.6" />
      <path d="m8.4 21 3.6-6.8L15.6 21" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  userCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.6 19.2a6 6 0 0 1 10.8 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.4 19.6a5.6 5.6 0 0 1 11.2 0" />
      <path d="M16.2 5.2a3.2 3.2 0 0 1 0 6.1" />
      <path d="M17.2 14.6a5.6 5.6 0 0 1 3.4 5" />
    </>
  ),
  wifi: (
    <>
      <path d="M4.5 9.5a11 11 0 0 1 15 0" />
      <path d="M7.5 12.8a7 7 0 0 1 9 0" />
      <path d="M10.3 16a3 3 0 0 1 3.4 0" />
      <path d="M12 19h.01" />
    </>
  ),
  logOut: (
    <>
      <path d="M9.5 20.5H5.2a1.7 1.7 0 0 1-1.7-1.7V5.2a1.7 1.7 0 0 1 1.7-1.7h4.3" />
      <path d="M15 8.5 18.5 12 15 15.5" />
      <path d="M18.5 12H9.5" />
    </>
  ),

  // ------------------------------------------------ chevron & panah
  chevronUp: <path d="m6 14.2 6-6 6 6" />,
  chevronDown: <path d="m6 9.8 6 6 6-6" />,
  chevronRight: <path d="m9.8 6 6 6-6 6" />,
  arrowRight: (
    <>
      <path d="M4.5 12h13" />
      <path d="m12.5 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19.5 12h-13" />
      <path d="m11.5 6-6 6 6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M6.5 17.5 17.5 6.5" />
      <path d="M8.8 6.5h8.7v8.7" />
    </>
  ),
  trendUp: (
    <>
      <path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" />
      <path d="M15 6.5h5.5V12" />
    </>
  ),
  trendDown: (
    <>
      <path d="M3.5 7.5 9 13l3.5-3.5L20.5 17.5" />
      <path d="M15 17.5h5.5V12" />
    </>
  ),

  // ------------------------------------------------ lain-lain
  play: <path d="M8.6 6.1v11.8L18 12 8.6 6.1Z" />,
  pause: (
    <>
      <path d="M9.4 5.8v12.4" />
      <path d="M14.6 5.8v12.4" />
    </>
  ),
  reset: (
    <>
      <path d="M3.6 4.8v4.9h4.9" />
      <path d="M4.2 9.6A8 8 0 1 0 12 4a8 8 0 0 0-6.7 3.6" />
    </>
  ),
  zap: <path d="M13 2.6 4.6 13.6H11l-1 7.8L18.9 10.4H12.4L13 2.6Z" />,
  layers: (
    <>
      <path d="M12 3.4 3.6 7.9 12 12.4l8.4-4.5L12 3.4Z" />
      <path d="m3.6 12.4 8.4 4.5 8.4-4.5" />
      <path d="m3.6 16.4 8.4 4.5 8.4-4.5" />
    </>
  ),
  send: (
    <>
      <path d="M20.8 3.4 10.6 13.6" />
      <path d="M20.8 3.4 14.3 20.6l-3.7-7L3.6 9.9l17.2-6.5Z" />
    </>
  ),
  code: (
    <>
      <path d="m8.4 8-4 4 4 4" />
      <path d="m15.6 8 4 4-4 4" />
      <path d="m13.4 4.8-2.8 14.4" />
    </>
  ),
  commit: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M2.5 12h6.3M15.2 12h6.3" />
    </>
  ),
  flame: (
    <path d="M12 21c3.6 0 6-2.4 6-5.7 0-3.9-3.4-5.4-3.4-9.3 0-1-.6-2.1-1.4-3-.5 2.1-2.3 3.3-3.4 5.1-.9 1.5-.8 2.9-.8 2.9s-1.2-.7-1.6-2.3c-1 1.4-1.4 3-1.4 4.5C6 18.6 8.4 21 12 21Z" />
  ),
  rocket: (
    <>
      <path d="M12 3.5c3 1.6 4.8 4.6 4.8 8.2L14 15H10L7.2 11.7C7.2 8.1 9 5.1 12 3.5Z" />
      <circle cx="12" cy="9.6" r="1.6" />
      <path d="M9.5 15.5 7 20l3-1.2" />
      <path d="M14.5 15.5 17 20l-3-1.2" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1.4" />
      <path d="M5 12.5v7h14v-7" />
      <path d="M12 8.5v11" />
      <path d="M12 8.5S10.5 4 8.2 4a2.2 2.2 0 0 0 0 4.5Z" />
      <path d="M12 8.5S13.5 4 15.8 4a2.2 2.2 0 0 1 0 4.5Z" />
    </>
  ),
  // ------------------------------------------------ cuaca
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  cloudSun: (
    <>
      <path d="M12 2v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="M20 12h2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M15.95 12.65a4 4 0 0 0-5.93-4.13" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </>
  ),
  cloudRain: (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </>
  ),
  cloudSnow: (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" />
    </>
  ),
  cloudLightning: (
    <>
      <path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97" />
      <path d="m13 12-3 5h4l-3 5" />
    </>
  ),
  cloudFog: (
    <>
      <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
      <path d="M16 17H7" />
      <path d="M17 21H9" />
    </>
  ),
  droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />,
  wind: (
    <>
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3" />,
}

export const ICON_NAMES = Object.keys(P)

export function Icon({ name, size = 20, strokeWidth = 1.7, className }) {
  const content = P[name]
  if (!content) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  )
}
