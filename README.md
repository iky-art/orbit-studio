# Orbit Studio — Workbench

Ruang kerja fokus (dasbor, aktivitas, insights, pengaturan) **plus** konsol admin
33 panel, dibungkus sebagai Progressive Web App yang bisa dipasang seperti
aplikasi biasa — termasuk siap di-`wrap` menjadi APK.

- `/` — halaman depan (landing, tanpa aplikasi)
- `/app` — aplikasi: splash → masuk/daftar → onboarding → ruang kerja
- `/app/admin` — konsol admin (khusus peran `owner` / `admin`)

Dibangun dengan React 18 + Vite 5 tanpa kerangka UI tambahan: router sendiri
(History API), sistem ikon SVG sendiri, dan token CSS sendiri.

---

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # keluaran ke dist/
npm run preview    # menyajikan hasil build di http://localhost:4173
```

Mau menayangkannya ke internet? Lihat **[Publikasi (deploy)](#publikasi-deploy)**.

### Akun demo

Muncul langsung di layar masuk (mode demo), siap diklik:

| Peran | Email | Kata sandi | Keadaan |
| --- | --- | --- | --- |
| Owner (admin) | `admin@orbit.studio` | `orbit1234` | sudah onboarding |
| Anggota | `anggota@orbit.studio` | `orbit1234` | belum onboarding |

Anggota sengaja belum onboarding agar alur 8 langkahnya bisa dicoba; akun ini juga
ditolak saat membuka `/app/admin`.

---

## Mode demo vs Firebase

| | Mode demo (bawaan) | Mode Firebase |
| --- | --- | --- |
| Konfigurasi | tidak ada | `.env.local` (lihat `.env.example`) |
| Penyimpanan | `localStorage` bernamespace `orbit:` | Firestore |
| Autentikasi | akun contoh + pendaftaran lokal | Firebase Authentication |
| Data | 32 koleksi contoh deterministik | dokumen asli |
| SDK Firebase | tidak diunduh | diunduh lewat *dynamic import* |

Lapisan data (`src/services/db.js`, `src/services/auth.js`) memilih cabangnya
sendiri dari `isFirebaseConfigured`, jadi tidak ada kode layar yang perlu diubah
saat berpindah mode. Untuk mengaktifkan Firebase:

```bash
cp .env.example .env.local   # lalu isi kredensial proyek
npm run build                # variabel VITE_* disisipkan saat build
```

Data demo bisa dikembalikan ke kondisi awal dari **Pengaturan → Data &
Penyimpanan → Reset data demo**.

---

## Setup Firebase (langkah demi langkah)

Pakai ini kalau kamu ingin login sungguhan dan data tersimpan di cloud
(bukan mode demo). Paket gratis (Spark) sudah cukup untuk mulai.

### 1. Buat proyek Firebase

1. Buka <https://console.firebase.google.com> → **Add project** → beri nama
   (mis. `orbit-studio`). Google Analytics boleh dimatikan.
2. Di halaman proyek, tekan ikon web **`</>`** → beri nama app → **Register app**.
   Kamu akan melihat blok `firebaseConfig` berisi `apiKey`, `authDomain`, dst.
   Biarkan halaman ini terbuka, nilainya dipakai di langkah 3.

### 2. Aktifkan layanan

- **Authentication → Get started → Sign-in method → Email/Password → Enable.**
- **Sign-in method → Google → Enable** (isi email dukungan proyek). Tanpa ini tombol
  "Lanjut dengan Google" menampilkan pesan galat. Email verifikasi untuk akun
  email/kata sandi dikirim otomatis oleh Firebase.
- **Firestore Database → Create database** → pilih lokasi (mis.
  `asia-southeast2` Jakarta) → mulai dengan *production mode*.
- **Firestore → Rules** → tempel aturan berikut lalu **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function signedIn() {
      return request.auth != null;
    }
    // Akun yang dinonaktifkan admin ditolak di semua koleksi data.
    function isActive() {
      return signedIn()
        && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.get('status', 'aktif') != 'nonaktif';
    }
    function myEmail() {
      return request.auth.token.email.lower();
    }
    function isMember(teamId) {
      return signedIn()
        && exists(/databases/$(db)/documents/memberships/$(teamId + '_' + request.auth.uid));
    }
    function memberRole(teamId) {
      return get(/databases/$(db)/documents/memberships/$(teamId + '_' + request.auth.uid)).data.role;
    }
    function isTeamAdmin(teamId) {
      return isMember(teamId) && memberRole(teamId) in ['owner', 'admin'];
    }

    // Profil: hanya pemiliknya. Peran, paket, dan status hanya bisa diubah admin.
    match /users/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow create: if signedIn() && request.auth.uid == uid
                    && request.resource.data.role == 'member'
                    && request.resource.data.plan == 'Free'
                    && request.resource.data.get('status', 'aktif') == 'aktif';
      allow update: if signedIn() && request.auth.uid == uid
                    && request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['name', 'jobTitle', 'goal', 'focus', 'onboarded', 'lastActiveAt',
                                   'dailyTarget', 'termsAcceptedAt', 'termsVersion']);
      // Hapus akun mandiri (khusus member; owner/admin lewat konsol admin).
      allow delete: if signedIn() && request.auth.uid == uid
                    && resource.data.get('role', 'member') == 'member';
    }

    // Catatan aktivitas (Beranda, Aktivitas, Insights): milik pembuatnya.
    match /activities/{id} {
      allow read, delete: if isActive() && resource.data.uid == request.auth.uid;
      allow create: if isActive() && request.resource.data.uid == request.auth.uid;
      allow update: if isActive() && resource.data.uid == request.auth.uid
                    && request.resource.data.uid == resource.data.uid;
    }

    // Masukan: pengguna mengirim dan boleh melihat/menghapus miliknya (ekspor & hapus akun).
    match /feedback/{id} {
      allow create: if isActive() && request.resource.data.uid == request.auth.uid
                    && request.resource.data.status == 'baru'
                    && request.resource.data.votes == 0;
      allow read, delete: if isActive() && resource.data.uid == request.auth.uid;
    }

    // Tiket bantuan: pengguna membuat, membaca, membalas, dan menghapus tiketnya sendiri.
    match /tickets/{id} {
      allow read, delete: if isActive() && resource.data.uid == request.auth.uid;
      allow create: if isActive() && request.resource.data.uid == request.auth.uid
                    && request.resource.data.status == 'terbuka';
      allow update: if isActive() && resource.data.uid == request.auth.uid
                    && request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['thread', 'messages', 'status', 'updatedAt'])
                    && request.resource.data.status in ['terbuka', 'ditutup'];
    }

    // Tim: dibaca anggota; dibuat/diubah/dihapus pemiliknya.
    match /teams/{teamId} {
      allow read: if isMember(teamId);
      allow create: if isActive() && request.resource.data.ownerUid == request.auth.uid;
      allow update: if isActive() && resource.data.ownerUid == request.auth.uid
                    && request.resource.data.ownerUid == resource.data.ownerUid;
      allow delete: if isActive() && resource.data.ownerUid == request.auth.uid;
    }

    // Keanggotaan: id dokumen = teamId_uid. Pemilik membuat dirinya sendiri; anggota
    // lain bergabung hanya dengan undangan yang menunggu untuk emailnya.
    match /memberships/{mid} {
      allow read: if isActive()
                  && (resource.data.uid == request.auth.uid || isMember(resource.data.teamId));
      allow create: if isActive()
                    && mid == request.resource.data.teamId + '_' + request.auth.uid
                    && request.resource.data.uid == request.auth.uid
                    && (
                      (request.resource.data.role == 'owner'
                        && get(/databases/$(db)/documents/teams/$(request.resource.data.teamId)).data.ownerUid == request.auth.uid)
                      || (request.resource.data.role in ['admin', 'member']
                        && get(/databases/$(db)/documents/invitations/$(request.resource.data.inviteId)).data.teamId == request.resource.data.teamId
                        && get(/databases/$(db)/documents/invitations/$(request.resource.data.inviteId)).data.email == myEmail()
                        && get(/databases/$(db)/documents/invitations/$(request.resource.data.inviteId)).data.status == 'tertunda'
                        && get(/databases/$(db)/documents/invitations/$(request.resource.data.inviteId)).data.role == request.resource.data.role)
                    );
      allow update: if isActive()
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['role'])
                    && resource.data.role != 'owner'
                    && request.resource.data.role in ['admin', 'member']
                    && memberRole(resource.data.teamId) == 'owner';
      allow delete: if isActive()
                    && (resource.data.uid == request.auth.uid
                        || (isMember(resource.data.teamId) && resource.data.role != 'owner'
                            && (memberRole(resource.data.teamId) == 'owner'
                                || (memberRole(resource.data.teamId) == 'admin' && resource.data.role == 'member'))));
    }

    // Undangan: dibuat admin tim; dibaca penerima (email cocok) dan admin tim;
    // penerima hanya boleh menjawab (status).
    match /invitations/{iid} {
      allow read: if isActive()
                  && (resource.data.email == myEmail() || isTeamAdmin(resource.data.teamId));
      allow create: if isActive() && isTeamAdmin(request.resource.data.teamId)
                    && request.resource.data.invitedByUid == request.auth.uid
                    && request.resource.data.status == 'tertunda'
                    && (request.resource.data.role == 'member'
                        || (request.resource.data.role == 'admin'
                            && memberRole(request.resource.data.teamId) == 'owner'));
      allow update: if isActive() && resource.data.email == myEmail()
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'respondedAt'])
                    && request.resource.data.status in ['diterima', 'ditolak'];
      allow delete: if isActive() && isTeamAdmin(resource.data.teamId);
    }

    // Publik: paket & harga, flag, status layanan, dan artikel Pusat Bantuan yang terbit.
    match /plans/{id} {
      allow read: if true;
    }
    match /featureFlags/{id} {
      allow read: if true;
    }
    match /systemServices/{id} {
      allow read: if true;
    }
    match /content/{id} {
      allow read: if resource.data.status == 'terbit';
    }

    // Pengguna yang masuk: broadcast dan pengumuman yang sudah terbit.
    match /broadcasts/{id} {
      allow read: if isActive();
    }
    match /announcements/{id} {
      allow read: if isActive() && resource.data.status == 'terbit';
    }

    // Owner/admin: baca dan tulis semua koleksi (konsol admin).
    match /{doc=**} {
      allow read, write: if signedIn()
        && get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role in ['owner', 'admin'];
    }
  }
}
```

> Pengguna biasa hanya boleh mengubah `name`, `jobTitle`, `goal`, `focus`,
> `onboarded`, `lastActiveAt`, `dailyTarget`, `termsAcceptedAt`, dan
> `termsVersion` di dokumen profilnya; `role`, `plan`, dan
> `status` hanya bisa diubah owner/admin. Jika kelak ada field profil baru yang boleh diedit pengguna,
> tambahkan namanya ke daftar `hasOnly([...])`.

### 3. Isi kredensial

Salin nilai dari `firebaseConfig`:

| Variabel | Dari `firebaseConfig` |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `measurementId` (boleh kosong) |

- **Lokal / Termux:** `cp .env.example .env.local`, isi nilainya, lalu
  `npm run dev` (atau `npm run build`). File `.env.local` tidak ikut ke GitHub.
- **Produksi:** isi variabel yang sama di Cloudflare Pages →
  *Settings → Variables and Secrets*, lalu **Retry deployment**
  (variabel `VITE_*` disisipkan saat build).

Kalau berhasil, layar masuk tidak lagi menampilkan akun demo.

### 4. Daftarkan domain

*Authentication → Settings → Authorized domains* → **Add domain** →
`nama-proyek.pages.dev` (dan domain kustommu). Tanpa ini login ditolak.

### 5. Jadikan dirimu owner

1. Buka aplikasi, **daftar** dengan emailmu (peran awal selalu `member`).
2. Firebase Console → **Firestore → koleksi `users` → dokumen akunmu**.
3. Ubah field `role` dari `member` menjadi `owner`.
4. Keluar lalu masuk lagi — `/app/admin` sekarang bisa dibuka.

### Real-time: bagaimana datanya bekerja

- **Beranda, Aktivitas, Insights** dihitung langsung dari koleksi Firestore
  `activities` milik akunmu (`src/hooks/useDashboard.js`,
  `src/lib/stats.js`). Catat aktivitas lewat tombol **Catat aktivitas**, atau
  selesaikan timer fokus 25 menit di Beranda (otomatis tercatat sebagai
  sesi fokus). Perubahan langsung muncul di semua perangkat yang sedang membuka
  akun yang sama.
- **Paket & harga** (`/app/admin/plans`) tampil ke pengguna di dua tempat:
  bagian **Harga** di landing page (`/#harga`, publik) dan kartu **Paket kamu**
  di Pengaturan (`/app/settings`, menandai paket akunmu). Hanya paket berstatus
  aktif yang tampil, dan perubahan di admin langsung terlihat. Paket akun
  pengguna diambil dari field `plan` di dokumen `users` (ubah manual di
  Firestore atau lewat panel Pengguna). Pembayaran online belum ada.
- **Broadcast** (`/app/admin/broadcast`): admin menulis pesan (judul, isi, nada,
  penerima, lama tampil) lalu **Kirim sekarang**. Pesan langsung muncul sebagai
  banner di aplikasi semua pengguna yang sedang terbuka, bisa ditutup oleh
  pengguna, dan bisa dihentikan atau dihapus admin kapan saja. Koleksi:
  `broadcasts` (`src/hooks/useBroadcasts.js`). Hanya aktif di mode Firebase;
  di mode demo banner baru terbaca setelah muat ulang.
- **Konsol admin** (`/app/admin`) membaca semua koleksi secara real-time lewat
  `onSnapshot` (`src/services/db.js` → `subscribe`).
- Semua koleksi **dimulai kosong**. Data contoh (`seed` dan
  `src/data/dashboard.js`) hanya dipakai di mode demo.
- Query aktivitas memakai satu filter (`uid`) lalu mengurutkan di klien, jadi
  tidak perlu membuat indeks komposit di Firebase.

---

## Konsol admin — 33 panel

Sidebar dibagi 8 grup, dan panel apa pun bisa dicari dari bilah atas (atau
`/app/admin/<id>` langsung).

| Grup | Panel |
| --- | --- |
| Ikhtisar | Ringkasan, Analitik, Laporan |
| Pengguna | Pengguna, Peran & Izin, Tim, Undangan, Sesi & Perangkat |
| Konten | Moderasi, Konten, Media, Kategori & Tag |
| Komersial | Paket & Harga, Langganan, Faktur, Transaksi, Kupon |
| Pertumbuhan | Umpan Balik, Broadcast, Kampanye, Notifikasi, Template Email |
| Keamanan | Jejak Audit, Keamanan, Kunci API, Webhook, Feature Flag |
| Dukungan | Tiket Dukungan, Pengumuman |
| Sistem | Status Sistem, Bahasa, Integrasi, Cadangan |

- **23 panel entitas** digerakkan skema (`src/admin/schemas.jsx`) melalui satu
  komponen generik: pencarian, penyaring, pengurutan, paginasi, aksi massal,
  panel detail (drawer), dialog konfirmasi, dan ekspor CSV.
- **10 panel khusus** (`src/admin/panels/*.jsx`) dibuat tangan: Ringkasan,
  Analitik, Moderasi, Umpan Balik, Broadcast, Jejak Audit, Keamanan, Tiket,
  Pengumuman, Status Sistem.

## Peta panel admin: efeknya di mana

Setiap panel punya salah satu status ini di **mode Firebase**:

- **Nyata**: yang dibuat/diubah admin langsung berefek di aplikasi pengguna.
- **Tersimpan**: data tersimpan dan bisa dikelola, tetapi belum ada layar
  pengguna yang memakainya.
- **Butuh backend**: tidak bisa benar-benar bekerja hanya dengan Firebase di
  sisi klien (perlu server atau Cloud Functions, mis. pembayaran, email, kunci API).

| Panel | Status | Muncul / bekerja di mana |
| --- | --- | --- |
| Ringkasan, Analitik | Nyata | Dihitung dari pengguna dan aktivitas nyata (pendapatan 0, belum ada pembayaran) |
| Pengguna | Nyata | Daftar = akun yang mendaftar. **Nonaktifkan** memblokir masuk (juga di Rules); **Jadikan admin/member** membuka atau menutup konsol admin; **Paket** tampil di Pengaturan → Paket kamu; **Kirim tautan sandi** mengirim email Firebase |
| Paket & Harga | Nyata | Landing `/#harga` dan Pengaturan → Paket kamu |
| Broadcast | Nyata | Banner di Beranda semua pengguna (real-time) + toast |
| Pengumuman | Nyata | Lonceng notifikasi di header pengguna (hanya yang berstatus terbit) |
| Umpan Balik | Nyata | Pengguna kirim dari Pengaturan → Bantuan & masukan; admin mengelola statusnya |
| Tiket Dukungan | Nyata | Pengguna buat dan balas tiket di Pengaturan; admin membalas di panel (percakapan nyata) |
| Status Sistem | Nyata | Status layanan yang kamu ubah tampil sebagai banner ke pengguna; **Mode pemeliharaan** menampilkan halaman pemeliharaan ke non-admin |
| Feature Flag | Sebagian | Hanya kunci `mode.pemeliharaan` dan `pendaftaran.tutup` yang dikenali kode; flag lain tersimpan tetapi belum dipakai. Penutupan pendaftaran hanya di antarmuka (Firebase Auth tetap menerima pendaftaran dari luar) |
| Jejak Audit | Nyata | Otomatis mencatat setiap buat/ubah/hapus dari panel admin |
| Konten | Nyata | Artikel berstatus **terbit** dan berisi tampil di Pusat Bantuan `/help` (bisa diubah lewat tombol Ubah) |
| Media, Kategori & Tag, Moderasi, Bahasa | Tersimpan | Belum ada layar pengguna yang menampilkan |
| Tim, Undangan | Nyata | Pengguna membuat tim di Pengaturan → Tim, mengundang lewat email, dan menjawab undangan di lonceng. Panel admin menampilkan semuanya |
| Peran & Izin | Tersimpan | Hak akses nyata hanya `owner`/`admin` vs `member`; peran dalam tim: pemilik, admin, anggota |
| Notifikasi, Laporan | Tersimpan | Pakai Pengumuman/Broadcast untuk pesan ke pengguna |
| Langganan, Faktur, Transaksi, Kupon | Butuh backend | Perlu payment gateway (mis. Midtrans/Xendit) dan server |
| Kunci API, Webhook, Integrasi | Butuh backend | Perlu server untuk memvalidasi kunci dan memanggil layanan luar |
| Kampanye, Template Email | Butuh backend | Perlu pengirim email (Cloud Functions/SMTP) |
| Cadangan, Sesi & Perangkat, Keamanan | Butuh backend | Perlu Firebase Admin SDK/Cloud Functions |

Tugas di Status Sistem seperti "mulai ulang pekerja" juga ditandai
**Butuh backend**.

---

## Pengaturan — 94 item dalam 11 grup

Registry di `src/services/settings.js`. Setiap tipe punya kontrolnya sendiri
(`toggle`, `segment`, `select`, `slider`, `accent`, `text`, `textarea`, `action`,
`info`), dan yang penting: **perubahan benar-benar diterapkan** lewat token CSS,
bukan sekadar tersimpan.

`SettingsProvider` menulis ke `document.documentElement`:

- `--accent`, `--font-scale`, `--radius-base`, `--glass-blur`
- `data-density`, `data-contrast`, `data-large-text`, `data-transparency`,
  `data-ambient`, `data-color-blind`, `data-dock-labels`,
  `data-transparent-header`, `data-underline-links`, `data-always-focus`,
  `data-reduce-motion`

Aturan untuk atribut-atribut itu ada di `src/styles/preferences.css`; palet aman
buta warna memakai skema Okabe–Ito.

---

## PWA

| Berkas | Isi |
| --- | --- |
| `public/manifest.webmanifest` | `start_url: /app`, `scope: /`, ikon `any` + `maskable`, pintasan |
| `public/sw.js` | navigasi *network-first* → cache → `offline.html`; aset *stale-while-revalidate*; font *cache-first* berbatas |
| `public/offline.html` | halaman luring mandiri (tanpa dependensi) |
| `public/icons/*` | 192/512/1024, varian maskable, apple-touch-icon, favicon |
| `index.html` | meta PWA + splash inline yang digambar sebelum bundel JS |
| `src/pwa/usePwaInstall.js` | `beforeinstallprompt`, deteksi platform, petunjuk manual iOS |

Service worker hanya didaftarkan pada build produksi (`import.meta.env.PROD`)
supaya pengembangan dengan HMR tidak tersangkut cache.

Panduan membungkusnya menjadi APK (Bubblewrap/TWA, Digital Asset Links, daftar
periksa rilis) ada di **[ANDROID.md](ANDROID.md)**.

---

## Publikasi (deploy)

Hasil build (`dist/`) adalah situs statis, jadi bisa dipasang di hosting statis
mana pun. Jalur paling mudah (cukup dari HP, tanpa CLI tambahan) adalah
**GitHub → Cloudflare Pages**: setiap `git push` otomatis membangun dan
menayangkan ulang.

### 1. Cek build lokal dulu

```bash
npm install
npm run build      # harus selesai tanpa error, keluaran di dist/
npm run preview    # coba di http://localhost:4173
```

### 2. Dorong kode ke GitHub

Buat repositori kosong di GitHub (mis. `orbit-studio`), lalu dari folder proyek:

```bash
git init
git add .
git commit -m "Orbit Studio v1.1.0"
git branch -M main
git remote add origin https://github.com/<username>/orbit-studio.git
git push -u origin main
```

`.gitignore` sudah mengecualikan `node_modules`, `dist`, dan `*.local`
(termasuk `.env.local`), jadi kredensial Firebase tidak ikut terunggah.

### 3. Hubungkan ke Cloudflare Pages

1. Buka dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, lalu pilih repositori `orbit-studio`.
2. Isi pengaturan build:

   | Kolom | Nilai |
   | --- | --- |
   | Framework preset | Vite (atau None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (biarkan kosong) |

3. Jika memakai **mode Firebase**, ikuti dulu **[Setup Firebase](#setup-firebase-langkah-demi-langkah)**,
   lalu buka *Settings → Variables and Secrets* dan isi semua variabel
   `VITE_FIREBASE_*`. Variabel ini disisipkan **saat build**, jadi setelah
   mengubahnya jalankan *Retry deployment* / push ulang. Lewati langkah ini
   untuk mode demo.
4. Klik **Save and Deploy**. Beberapa menit kemudian situs tayang di
   `https://<nama-proyek>.pages.dev`.

`public/_redirects` sudah menyajikan `index.html` untuk semua rute, sehingga
`/app` dan `/app/admin` tidak 404 saat di-refresh.

### 4. Domain sendiri (opsional)

Di proyek Pages → **Custom domains** → **Set up a domain**, lalu ikuti petunjuk
DNS. HTTPS aktif otomatis. `manifest.webmanifest` dan `sw.js` harus tersaji
dari **root domain** (bukan sub-folder).

### 5. Periksa setelah tayang

- `/` menampilkan landing, `/app` menampilkan splash → masuk.
- `/manifest.webmanifest` dan `/sw.js` terbuka (bukan halaman HTML).
- Chrome Android → menu ⋮ → **Instal aplikasi** muncul dan ikonnya benar.
- Firebase: domain `*.pages.dev` / domain kustommu sudah ada di *Authentication →
  Settings → Authorized domains* (lihat Setup Firebase, langkah 4).

### Memperbarui

```bash
git add .
git commit -m "pesan perubahan"
git push
```

Cloudflare membangun ulang otomatis. Kalau tampilan lama masih muncul, itu
service worker: naikkan `VERSION` di `public/sw.js` (mis. `orbit-v2` → `orbit-v3`)
supaya cache lama dibuang di perangkat pengguna.

### Alternatif tanpa GitHub

Unggah langsung hasil build dengan Wrangler (butuh login Cloudflare sekali):

```bash
npm run build
npx wrangler pages deploy dist --project-name orbit-studio
```

### Hosting lain

| Layanan | Build command | Output | Catatan |
| --- | --- | --- | --- |
| Netlify | `npm run build` | `dist` | `_redirects` langsung terbaca |
| Vercel | `npm run build` | `dist` | tambahkan `vercel.json` berisi rewrite `/(.*)` → `/index.html` |
| Firebase Hosting | `npm run build` | `dist` | tambahkan `rewrites` di `firebase.json` (lihat ANDROID.md) |

---

## Riwayat versi

Versi aplikasi ada di `src/version.js` (juga `package.json` dan `VERSION` di
`public/sw.js`). Catatan lengkap per rilis ada di [CHANGELOG.md](CHANGELOG.md).
Saat menaikkan versi, ubah ketiga tempat itu agar cache PWA ikut diperbarui.

---

## Halaman legal

Tiga halaman legal tersedia di rute publik (tanpa login):

| Rute | Isi |
| --- | --- |
| `/legal` | Pusat legal (daftar dokumen) |
| `/legal/terms` | Syarat & Ketentuan |
| `/legal/privacy` | Kebijakan Privasi (mengacu UU PDP No. 27/2022) |
| `/legal/cookies` | Cookie & Penyimpanan Lokal |

Tautannya ada di footer landing, footer aplikasi, dan di bawah tombol **Buat
akun**. Isi dokumen ada di `src/legal/documents.js` (teks biasa, mudah diedit);
tanggal pembaruan dan nama layanan ada di `src/legal/config.js`.

- Isi `VITE_CONTACT_EMAIL` (di `.env.local` dan variabel Cloudflare Pages) agar
  email kontak tampil di dokumen. Jika kosong, dokumen memakai kalimat kontak
  umum.
- Dokumen ini menggambarkan cara kerja aplikasi saat ini (Firebase
  Authentication + Firestore, penyimpanan lokal, tanpa pelacak iklan). Jika kamu
  menambah analitik, iklan, atau pembayaran, perbarui dokumennya.
- Ini draf kerja, bukan nasihat hukum; minta tinjauan penasihat hukum sebelum
  dipakai untuk layanan komersial.

---

## Mengganti logo

Logo yang dipakai aplikasi ada di dua tempat:

| Berkas | Dipakai untuk |
| --- | --- |
| `public/logo-mark.png` | tanda logo di header, splash, layar masuk, landing, halaman luring |
| `public/icons/*.png` | ikon PWA/APK (192, 512, 1024, maskable), apple-touch-icon, favicon |

Ganti berkas-berkas itu dengan nama yang sama (ikon maskable perlu ruang
kosong ±20% di tepi), lalu naikkan `VERSION` di `public/sw.js` agar cache ikon
lama tidak terbawa.

---

## Struktur

```
src/
  lib/          router, format, id, user
  services/     seed (32 koleksi), db, auth, settings, storage
  firebase/     config (gate demo vs Firebase)
  providers/    Auth, Settings, Toast
  hooks/        useCollection, usePersistentState, useTheme
  components/   Icon, Header, BottomDock, Footer, ViewHeader, InstallBanner, …
  views/        HomeView, ActivityView, InsightsView, SettingsView
  screens/      Splash, Auth, Onboarding, MainApp, OrbitApp, App
  admin/        AdminApp, AdminLayout, schemas, panels, components
  landing/      LandingPage, LandingSections
  pwa/          registerSW, usePwaInstall
  styles/       tokens, preferences, app, ui, screens, admin, landing
```

Sumber kebenaran tampilan adalah `src/styles/tokens.css`
(Neomorphism × Liquid Glass · graphite `#17191c` · lime `#d7f59a`,
Space Grotesk untuk judul, Outfit untuk teks isi).
`design-system/orbit-studio/MASTER.md` adalah templat lama yang **tidak** dipakai.

---

## Catatan implementasi

- **Router** (`src/lib/router.jsx`) memakai History API, mendukung parameter
  opsional (`/app/:section?`, `/app/admin/:panel?`), wildcard, dan komponen
  `<Link>` yang tetap menghormati klik tengah/Ctrl.
- **Firebase** hanya masuk bundel sebagai chunk terpisah yang diunduh saat
  konfigurasi terisi; halaman awal tetap ringan.
- **Aksesibilitas**: setiap layar punya satu `<main>`, lompatan ke konten di
  aplikasi, fokus yang selalu terlihat, `aria-current` pada navigasi aktif,
  target sentuh ≥ 34px, `prefers-reduced-motion` dihormati, dan warna status
  tidak pernah jadi satu-satunya pembeda (selalu ada teks/lencana).
- **Data contoh ditandai jelas** sebagai data demo di layar yang menampilkannya.
