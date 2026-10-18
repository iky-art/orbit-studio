/**
 * Registry pengaturan aplikasi.
 * Setiap entri punya id, grup, label, tipe, dan nilai default.
 * Nilai tersimpan lewat SettingsProvider (localStorage di mode demo,
 * Firestore `settings/{uid}` di mode Firebase).
 */

export const SETTING_GROUPS = [
  { id: 'tampilan', label: 'Tampilan', icon: 'palette', desc: 'Warna, kepadatan, dan nuansa antarmuka.' },
  { id: 'aksesibilitas', label: 'Aksesibilitas', icon: 'accessibility', desc: 'Kontras, ukuran teks, dan bantuan visual.' },
  { id: 'notifikasi', label: 'Notifikasi', icon: 'bell', desc: 'Apa yang memberi tahu dan lewat kanal mana.' },
  { id: 'privasi', label: 'Privasi & Keamanan', icon: 'shield', desc: 'Visibilitas, sesi, dan perlindungan akun.' },
  { id: 'bahasa', label: 'Bahasa & Wilayah', icon: 'globe', desc: 'Format tanggal, angka, mata uang, dan zona waktu.' },
  { id: 'produktivitas', label: 'Fokus & Produktivitas', icon: 'target', desc: 'Sesi fokus, simpan otomatis, dan pintasan.' },
  { id: 'akun', label: 'Akun & Profil', icon: 'userCircle', desc: 'Identitas dan informasi publikmu.' },
  { id: 'data', label: 'Data & Penyimpanan', icon: 'database', desc: 'Mode luring, sinkronisasi, dan ekspor.' },
  { id: 'integrasi', label: 'Integrasi & API', icon: 'plug', desc: 'Hubungkan layanan eksternal dan webhook.' },
  { id: 'suara', label: 'Suara & Getaran', icon: 'volume', desc: 'Nada notifikasi, volume, dan haptik.' },
  { id: 'lainnya', label: 'Bantuan & Tentang', icon: 'info', desc: 'Pembaruan, laporan, dan dokumen legal.' },
]

export const ACCENT_OPTIONS = [
  { value: '#d7f59a', label: 'Lime' },
  { value: '#9ff5d7', label: 'Mint' },
  { value: '#f5d79a', label: 'Amber' },
  { value: '#9ad2f5', label: 'Sky' },
  { value: '#f5a8c4', label: 'Rose' },
  { value: '#c8a8f5', label: 'Lilac' },
]

export const SETTINGS = [
  // ------------------------------------------------------------ tampilan
  { id: 'tampilan.theme', group: 'tampilan', label: 'Mode warna', desc: 'Ikuti tema sistem atau pilih manual.', type: 'segment', default: 'dark', options: [{ value: 'light', label: 'Terang' }, { value: 'dark', label: 'Gelap' }, { value: 'system', label: 'Sistem' }] },
  { id: 'tampilan.accent', group: 'tampilan', label: 'Warna aksen', desc: 'Dipakai untuk tombol utama, grafik, dan sorotan.', type: 'accent', default: '#d7f59a' },
  { id: 'tampilan.density', group: 'tampilan', label: 'Kepadatan', desc: 'Seberapa rapat jarak antar elemen.', type: 'segment', default: 'nyaman', options: [{ value: 'nyaman', label: 'Nyaman' }, { value: 'kompak', label: 'Kompak' }] },
  { id: 'tampilan.fontScale', group: 'tampilan', label: 'Ukuran teks', desc: 'Skala tipografi seluruh antarmuka.', type: 'slider', default: 100, min: 85, max: 130, step: 5, unit: '%' },
  { id: 'tampilan.radius', group: 'tampilan', label: 'Sudut membulat', desc: 'Radius sudut kartu dan tombol.', type: 'slider', default: 20, min: 6, max: 32, step: 2, unit: 'px' },
  { id: 'tampilan.glass', group: 'tampilan', label: 'Intensitas kaca', desc: 'Kekuatan efek liquid glass pada permukaan.', type: 'slider', default: 70, min: 0, max: 100, step: 5, unit: '%' },
  { id: 'tampilan.ambient', group: 'tampilan', label: 'Cahaya latar', desc: 'Gradien lembut di bagian atas layar.', type: 'toggle', default: true },
  { id: 'tampilan.reduceMotion', group: 'tampilan', label: 'Kurangi gerakan', desc: 'Matikan animasi transisi dan denyut status.', type: 'toggle', default: false },
  { id: 'tampilan.transparentHeader', group: 'tampilan', label: 'Header transparan', desc: 'Header menyatu dengan latar saat digulir.', type: 'toggle', default: true },
  { id: 'tampilan.dockLabels', group: 'tampilan', label: 'Label dock', desc: 'Tampilkan teks pada navigasi bawah.', type: 'toggle', default: true },

  // ------------------------------------------------------- aksesibilitas
  { id: 'aksesibilitas.contrast', group: 'aksesibilitas', label: 'Kontras tinggi', desc: 'Perkuat batas dan warna teks.', type: 'toggle', default: false },
  { id: 'aksesibilitas.largeText', group: 'aksesibilitas', label: 'Teks besar', desc: 'Naikkan ukuran teks dasar menjadi 18px.', type: 'toggle', default: false },
  { id: 'aksesibilitas.underlineLinks', group: 'aksesibilitas', label: 'Garis bawah tautan', desc: 'Selalu garis bawahi tautan di dalam teks.', type: 'toggle', default: false },
  { id: 'aksesibilitas.focusRing', group: 'aksesibilitas', label: 'Cincin fokus selalu tampil', desc: 'Tampilkan indikator fokus meski memakai mouse.', type: 'toggle', default: false },
  { id: 'aksesibilitas.reduceTransparency', group: 'aksesibilitas', label: 'Kurangi transparansi', desc: 'Ganti permukaan kaca dengan warna solid.', type: 'toggle', default: false },
  { id: 'aksesibilitas.colorBlind', group: 'aksesibilitas', label: 'Mode buta warna', desc: 'Sesuaikan palet untuk jenis penglihatan warna.', type: 'select', default: 'none', options: [{ value: 'none', label: 'Tidak ada' }, { value: 'protanopia', label: 'Protanopia' }, { value: 'deuteranopia', label: 'Deuteranopia' }, { value: 'tritanopia', label: 'Tritanopia' }] },
  { id: 'aksesibilitas.screenReaderHints', group: 'aksesibilitas', label: 'Petunjuk pembaca layar', desc: 'Ucapkan deskripsi tambahan pada kontrol kompleks.', type: 'toggle', default: true },
  { id: 'aksesibilitas.captions', group: 'aksesibilitas', label: 'Teks pada media', desc: 'Tampilkan takarir untuk audio dan video.', type: 'toggle', default: true },

  // ---------------------------------------------------------- notifikasi
  { id: 'notifikasi.email', group: 'notifikasi', label: 'Notifikasi email', desc: 'Kirim ringkasan penting ke emailmu.', type: 'toggle', default: true },
  { id: 'notifikasi.push', group: 'notifikasi', label: 'Notifikasi push', desc: 'Kirim pemberitahuan ke perangkat ini.', type: 'toggle', default: true },
  { id: 'notifikasi.desktop', group: 'notifikasi', label: 'Notifikasi desktop', desc: 'Tampilkan di sistem operasi saat aplikasi terbuka.', type: 'toggle', default: false },
  { id: 'notifikasi.sound', group: 'notifikasi', label: 'Bunyi notifikasi', desc: 'Putar nada saat notifikasi masuk.', type: 'toggle', default: true },
  { id: 'notifikasi.digest', group: 'notifikasi', label: 'Ringkasan berkala', desc: 'Seberapa sering menerima rangkuman.', type: 'segment', default: 'harian', options: [{ value: 'harian', label: 'Harian' }, { value: 'mingguan', label: 'Mingguan' }, { value: 'mati', label: 'Matikan' }] },
  { id: 'notifikasi.mentions', group: 'notifikasi', label: 'Sebutan', desc: 'Saat namamu disebut di komentar atau catatan.', type: 'toggle', default: true },
  { id: 'notifikasi.comments', group: 'notifikasi', label: 'Komentar', desc: 'Balasan pada utas yang kamu ikuti.', type: 'toggle', default: true },
  { id: 'notifikasi.assignments', group: 'notifikasi', label: 'Penugasan', desc: 'Saat tugas diberikan kepadamu.', type: 'toggle', default: true },
  { id: 'notifikasi.deadlines', group: 'notifikasi', label: 'Tenggat', desc: 'Pengingat tenggat 24 jam sebelumnya.', type: 'toggle', default: true },
  { id: 'notifikasi.marketing', group: 'notifikasi', label: 'Promosi', desc: 'Penawaran, tips, dan kabar produk.', type: 'toggle', default: false },
  { id: 'notifikasi.quietHours', group: 'notifikasi', label: 'Jam tenang', desc: 'Rentang waktu tanpa notifikasi.', type: 'text', default: '22:00–07:00', placeholder: '22:00–07:00' },
  { id: 'notifikasi.previewText', group: 'notifikasi', label: 'Pratinjau isi', desc: 'Tampilkan isi pesan pada notifikasi.', type: 'toggle', default: true },

  // ------------------------------------------------------------- privasi
  { id: 'privasi.profileVisibility', group: 'privasi', label: 'Visibilitas profil', desc: 'Siapa yang bisa melihat profilmu.', type: 'segment', default: 'tim', options: [{ value: 'publik', label: 'Publik' }, { value: 'tim', label: 'Tim' }, { value: 'pribadi', label: 'Pribadi' }] },
  { id: 'privasi.activityStatus', group: 'privasi', label: 'Status aktivitas', desc: 'Tampilkan kapan kamu terakhir aktif.', type: 'toggle', default: true },
  { id: 'privasi.readReceipts', group: 'privasi', label: 'Tanda dibaca', desc: 'Bagikan status baca pada pesan.', type: 'toggle', default: true },
  { id: 'privasi.twoFactor', group: 'privasi', label: 'Verifikasi dua langkah', desc: 'Minta kode tambahan saat masuk.', type: 'toggle', default: false },
  { id: 'privasi.sessionTimeout', group: 'privasi', label: 'Batas sesi', desc: 'Keluar otomatis setelah tidak aktif.', type: 'select', default: '60', options: [{ value: '15', label: '15 menit' }, { value: '30', label: '30 menit' }, { value: '60', label: '1 jam' }, { value: '240', label: '4 jam' }, { value: '0', label: 'Tidak pernah' }] },
  { id: 'privasi.loginAlerts', group: 'privasi', label: 'Peringatan masuk', desc: 'Beritahu saat ada perangkat baru masuk.', type: 'toggle', default: true },
  { id: 'privasi.dataSharing', group: 'privasi', label: 'Berbagi data anonim', desc: 'Bantu tingkatkan produk dengan data agregat.', type: 'toggle', default: false },
  { id: 'privasi.analyticsOptIn', group: 'privasi', label: 'Analitik penggunaan', desc: 'Izinkan pencatatan pola pemakaian.', type: 'toggle', default: true },
  { id: 'privasi.personalization', group: 'privasi', label: 'Personalisasi', desc: 'Sesuaikan saran berdasarkan aktivitasmu.', type: 'toggle', default: true },

  // -------------------------------------------------------------- bahasa
  { id: 'bahasa.language', group: 'bahasa', label: 'Bahasa antarmuka', desc: 'Bahasa teks pada aplikasi.', type: 'select', default: 'id', options: [{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }, { value: 'ms', label: 'Bahasa Melayu' }, { value: 'ja', label: '日本語' }] },
  { id: 'bahasa.timezone', group: 'bahasa', label: 'Zona waktu', desc: 'Dipakai untuk jadwal dan laporan.', type: 'select', default: 'Asia/Jakarta', options: [{ value: 'Asia/Jakarta', label: 'WIB · Jakarta' }, { value: 'Asia/Makassar', label: 'WITA · Makassar' }, { value: 'Asia/Jayapura', label: 'WIT · Jayapura' }, { value: 'Asia/Singapore', label: 'SGT · Singapura' }, { value: 'UTC', label: 'UTC' }] },
  { id: 'bahasa.dateFormat', group: 'bahasa', label: 'Format tanggal', desc: 'Urutan hari, bulan, dan tahun.', type: 'segment', default: 'dmy', options: [{ value: 'dmy', label: '31/12/2026' }, { value: 'mdy', label: '12/31/2026' }, { value: 'iso', label: '2026-12-31' }] },
  { id: 'bahasa.timeFormat', group: 'bahasa', label: 'Format waktu', desc: 'Sistem 24 jam atau 12 jam.', type: 'segment', default: '24', options: [{ value: '24', label: '24 jam' }, { value: '12', label: '12 jam' }] },
  { id: 'bahasa.numberFormat', group: 'bahasa', label: 'Format angka', desc: 'Pemisah ribuan dan desimal.', type: 'segment', default: 'dot', options: [{ value: 'dot', label: '1.234,56' }, { value: 'comma', label: '1,234.56' }] },
  { id: 'bahasa.currency', group: 'bahasa', label: 'Mata uang', desc: 'Dipakai pada tagihan dan laporan.', type: 'select', default: 'IDR', options: [{ value: 'IDR', label: 'Rupiah (IDR)' }, { value: 'USD', label: 'Dolar AS (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }, { value: 'SGD', label: 'Dolar Singapura (SGD)' }] },
  { id: 'bahasa.weekStart', group: 'bahasa', label: 'Awal pekan', desc: 'Hari pertama pada kalender.', type: 'segment', default: 'senin', options: [{ value: 'senin', label: 'Senin' }, { value: 'minggu', label: 'Minggu' }] },
  { id: 'bahasa.units', group: 'bahasa', label: 'Satuan', desc: 'Metrik atau imperial.', type: 'segment', default: 'metrik', options: [{ value: 'metrik', label: 'Metrik' }, { value: 'imperial', label: 'Imperial' }] },

  // -------------------------------------------------------- produktivitas
  { id: 'produktivitas.defaultView', group: 'produktivitas', label: 'Layar awal', desc: 'Halaman yang terbuka setelah masuk.', type: 'select', default: 'home', options: [{ value: 'home', label: 'Beranda' }, { value: 'activity', label: 'Aktivitas' }, { value: 'insights', label: 'Insights' }] },
  { id: 'produktivitas.autosave', group: 'produktivitas', label: 'Simpan otomatis', desc: 'Simpan perubahan tanpa menekan tombol.', type: 'toggle', default: true },
  { id: 'produktivitas.saveInterval', group: 'produktivitas', label: 'Jeda simpan otomatis', desc: 'Interval penyimpanan saat mengetik.', type: 'slider', default: 30, min: 5, max: 120, step: 5, unit: ' dtk' },
  { id: 'produktivitas.focusDuration', group: 'produktivitas', label: 'Durasi fokus', desc: 'Panjang satu sesi fokus.', type: 'slider', default: 50, min: 15, max: 90, step: 5, unit: ' mnt' },
  { id: 'produktivitas.breakDuration', group: 'produktivitas', label: 'Durasi istirahat', desc: 'Panjang jeda antar sesi.', type: 'slider', default: 10, min: 3, max: 25, step: 1, unit: ' mnt' },
  { id: 'produktivitas.cycles', group: 'produktivitas', label: 'Jumlah siklus', desc: 'Sesi fokus sebelum istirahat panjang.', type: 'slider', default: 4, min: 2, max: 8, step: 1, unit: '×' },
  { id: 'produktivitas.autoStartBreaks', group: 'produktivitas', label: 'Mulai istirahat otomatis', desc: 'Hitung mundur istirahat tanpa konfirmasi.', type: 'toggle', default: true },
  { id: 'produktivitas.keyboardShortcuts', group: 'produktivitas', label: 'Pintasan papan tik', desc: 'Aktifkan pintasan seperti G lalu H.', type: 'toggle', default: true },
  { id: 'produktivitas.quickActions', group: 'produktivitas', label: 'Aksi cepat', desc: 'Tombol aksi mengambang di sudut layar.', type: 'toggle', default: false },
  { id: 'produktivitas.defaultPriority', group: 'produktivitas', label: 'Prioritas bawaan', desc: 'Prioritas saat membuat tugas baru.', type: 'segment', default: 'sedang', options: [{ value: 'tinggi', label: 'Tinggi' }, { value: 'sedang', label: 'Sedang' }, { value: 'rendah', label: 'Rendah' }] },

  // ---------------------------------------------------------------- akun
  { id: 'akun.name', group: 'akun', label: 'Nama tampilan', desc: 'Nama yang terlihat oleh orang lain.', type: 'text', default: '', placeholder: 'Nama lengkap' },
  { id: 'akun.username', group: 'akun', label: 'Nama pengguna', desc: 'Alamat unik untuk profil publikmu.', type: 'text', default: '', placeholder: 'nama.pengguna', prefix: '@' },
  { id: 'akun.email', group: 'akun', label: 'Email', desc: 'Dipakai untuk masuk dan pemulihan akun.', type: 'text', default: '', placeholder: 'nama@contoh.id', inputType: 'email' },
  { id: 'akun.phone', group: 'akun', label: 'Nomor telepon', desc: 'Untuk verifikasi tambahan.', type: 'text', default: '', placeholder: '+62 812 3456 7890', inputType: 'tel' },
  { id: 'akun.jobTitle', group: 'akun', label: 'Jabatan', desc: 'Peranmu di organisasi.', type: 'text', default: '', placeholder: 'Product Designer' },
  { id: 'akun.company', group: 'akun', label: 'Organisasi', desc: 'Nama tempat kamu bekerja.', type: 'text', default: '', placeholder: 'Nama studio' },
  { id: 'akun.location', group: 'akun', label: 'Lokasi', desc: 'Kota dan negara.', type: 'text', default: '', placeholder: 'Jakarta, Indonesia' },
  { id: 'akun.website', group: 'akun', label: 'Situs web', desc: 'Tautan portofolio atau profil.', type: 'text', default: '', placeholder: 'https://', inputType: 'url' },
  { id: 'akun.bio', group: 'akun', label: 'Bio', desc: 'Deskripsi singkat tentang dirimu.', type: 'textarea', default: '', placeholder: 'Beberapa kalimat tentang dirimu', maxLength: 200 },

  // ---------------------------------------------------------------- data
  { id: 'data.offlineMode', group: 'data', label: 'Mode luring', desc: 'Tetap bisa dibuka tanpa koneksi internet.', type: 'toggle', default: true },
  { id: 'data.autoSync', group: 'data', label: 'Sinkronisasi otomatis', desc: 'Kirim perubahan segera setelah daring.', type: 'toggle', default: true },
  { id: 'data.mediaDownload', group: 'data', label: 'Unduh media', desc: 'Kapan gambar dan berkas disimpan lokal.', type: 'select', default: 'wifi', options: [{ value: 'wifi', label: 'Hanya Wi-Fi' }, { value: 'selalu', label: 'Selalu' }, { value: 'tidak', label: 'Tidak pernah' }] },
  { id: 'data.cacheAction', group: 'data', label: 'Bersihkan cache', desc: 'Hapus berkas sementara aplikasi.', type: 'action', default: null, action: 'clearCache', button: 'Bersihkan' },
  { id: 'data.exportAction', group: 'data', label: 'Ekspor data', desc: 'Unduh seluruh datamu sebagai berkas JSON.', type: 'action', default: null, action: 'exportData', button: 'Ekspor' },
  { id: 'data.importAction', group: 'data', label: 'Impor data', desc: 'Pulihkan dari berkas ekspor sebelumnya.', type: 'action', default: null, action: 'importData', button: 'Impor' },
  { id: 'data.resetAction', group: 'data', label: 'Reset data demo', desc: 'Kembalikan semua data contoh ke kondisi awal.', type: 'action', default: null, action: 'resetDemo', button: 'Reset', tone: 'danger' },
  { id: 'data.usage', group: 'data', label: 'Pemakaian penyimpanan', desc: 'Perkiraan ruang yang dipakai data lokal.', type: 'info', default: null, action: 'storageUsage' },

  // ----------------------------------------------------------- integrasi
  { id: 'integrasi.calendar', group: 'integrasi', label: 'Kalender', desc: 'Sinkronkan sesi fokus ke kalender.', type: 'toggle', default: false },
  { id: 'integrasi.slack', group: 'integrasi', label: 'Slack', desc: 'Kirim ringkasan harian ke kanal Slack.', type: 'toggle', default: false },
  { id: 'integrasi.github', group: 'integrasi', label: 'GitHub', desc: 'Tautkan commit ke proyek aktif.', type: 'toggle', default: true },
  { id: 'integrasi.webhookUrl', group: 'integrasi', label: 'URL webhook', desc: 'Terima peristiwa pada endpoint milikmu.', type: 'text', default: '', placeholder: 'https://contoh.id/webhook', inputType: 'url' },
  { id: 'integrasi.telemetry', group: 'integrasi', label: 'Kirim diagnostik', desc: 'Bagikan metrik performa anonim.', type: 'toggle', default: true },
  { id: 'integrasi.apiKeys', group: 'integrasi', label: 'Kunci API', desc: 'Kelola kunci akses programatik.', type: 'action', default: null, action: 'openApiKeys', button: 'Kelola' },

  // --------------------------------------------------------------- suara
  { id: 'suara.notificationSound', group: 'suara', label: 'Nada notifikasi', desc: 'Bunyi saat pemberitahuan masuk.', type: 'select', default: 'lembut', options: [{ value: 'lembut', label: 'Lembut' }, { value: 'tegas', label: 'Tegas' }, { value: 'naik', label: 'Naik' }, { value: 'hening', label: 'Hening' }] },
  { id: 'suara.volume', group: 'suara', label: 'Volume', desc: 'Kerasnya nada notifikasi.', type: 'slider', default: 60, min: 0, max: 100, step: 5, unit: '%' },
  { id: 'suara.haptics', group: 'suara', label: 'Getaran', desc: 'Getar saat aksi penting dikonfirmasi.', type: 'toggle', default: true },
  { id: 'suara.vibrationPattern', group: 'suara', label: 'Pola getaran', desc: 'Irama getaran notifikasi.', type: 'segment', default: 'pendek', options: [{ value: 'pendek', label: 'Pendek' }, { value: 'ganda', label: 'Ganda' }, { value: 'panjang', label: 'Panjang' }] },
  { id: 'suara.ringtone', group: 'suara', label: 'Nada dering panggilan', desc: 'Untuk panggilan dalam aplikasi.', type: 'toggle', default: false },
  { id: 'suara.silentMode', group: 'suara', label: 'Mode senyap', desc: 'Bisukan seluruh bunyi aplikasi.', type: 'toggle', default: false },

  // ------------------------------------------------------------- lainnya
  { id: 'lainnya.tips', group: 'lainnya', label: 'Tips penggunaan', desc: 'Tampilkan saran kontekstual sesekali.', type: 'toggle', default: true },
  { id: 'lainnya.betaFeatures', group: 'lainnya', label: 'Fitur beta', desc: 'Ikut menguji fitur yang belum stabil.', type: 'toggle', default: false },
  { id: 'lainnya.crashReports', group: 'lainnya', label: 'Laporan kerusakan', desc: 'Kirim detail otomatis saat aplikasi gagal.', type: 'toggle', default: true },
  { id: 'lainnya.autoUpdate', group: 'lainnya', label: 'Pembaruan otomatis', desc: 'Perbarui aplikasi di latar belakang.', type: 'toggle', default: true },
  { id: 'lainnya.about', group: 'lainnya', label: 'Versi aplikasi', desc: 'Orbit Studio Workbench.', type: 'info', default: null, action: 'about' },
  { id: 'lainnya.licenses', group: 'lainnya', label: 'Lisensi sumber terbuka', desc: 'Daftar pustaka yang dipakai.', type: 'action', default: null, action: 'licenses', button: 'Lihat' },
  { id: 'lainnya.terms', group: 'lainnya', label: 'Syarat layanan', desc: 'Ketentuan pemakaian aplikasi.', type: 'action', default: null, action: 'terms', button: 'Buka' },
  { id: 'lainnya.privacy', group: 'lainnya', label: 'Kebijakan privasi', desc: 'Bagaimana data kamu ditangani.', type: 'action', default: null, action: 'privacy', button: 'Buka' },
]

export const SETTINGS_BY_GROUP = SETTING_GROUPS.map((group) => ({
  ...group,
  items: SETTINGS.filter((setting) => setting.group === group.id),
}))

export function defaultSettings() {
  return SETTINGS.reduce((acc, setting) => {
    acc[setting.id] = setting.default
    return acc
  }, {})
}

export const SETTINGS_COUNT = SETTINGS.length
