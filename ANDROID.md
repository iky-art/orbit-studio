# Membungkus Orbit Studio menjadi APK Android

Orbit Studio sudah memenuhi syarat **PWA yang dapat dipasang**: Web App Manifest
lengkap, ikon `any` + `maskable`, service worker dengan halaman luring, dan
routing SPA di `/` (landing) serta `/app` (aplikasi).

Justru karena itu ia bisa dibungkus menjadi **APK** tanpa menulis ulang satu baris
pun kode React. Ada dua jalur: **Bubblewrap** (CLI, menghasilkan TWA) atau
**PWABuilder** (antarmuka web, hasil sama).

> TWA (Trusted Web Activity) menampilkan aplikasi web di dalam aktivitas Android
> tanpa bilah alamat. Syaratnya: konten disajikan lewat **HTTPS** dan
> **Digital Asset Links** terpasang dengan benar.

---

## 0. Prasyarat

| Kebutuhan | Versi | Catatan |
| --- | --- | --- |
| Node.js | 18 atau lebih baru | untuk Bubblewrap + build aplikasi |
| JDK | 17 | Bubblewrap memakai Gradle |
| Android SDK | platform 34+ | `ANDROID_HOME` harus di-set |
| Perangkat/emulator | Android 5.0+ | untuk memasang hasil build |

`bubblewrap` bisa mengunduh JDK dan Android SDK secara otomatis saat pertama
kali dijalankan (`bubblewrap doctor` memeriksa kelengkapannya).

---

## 1. Publikasikan lebih dulu

Bubblewrap mengambil manifest dari URL publik, jadi aplikasi harus bisa diakses.

```bash
npm ci
npm run build          # menghasilkan dist/
npm run preview        # http://localhost:4173
```

Untuk produksi, unggah `dist/` ke hosting statis apa pun (Netlify, Cloudflare
Pages, Vercel, Firebase Hosting). Pastikan:

- **HTTPS aktif** (wajib untuk TWA dan service worker).
- **Fallback SPA** mengarah ke `index.html` — berkas `public/_redirects` sudah
  disiapkan untuk Netlify/Cloudflare:
  ```
  /*    /index.html   200
  ```
  Untuk Firebase Hosting, tambahkan di `firebase.json`:
  ```json
  { "hosting": { "rewrites": [{ "source": "**", "destination": "/index.html" }] } }
  ```
- `manifest.webmanifest` dan `sw.js` tersaji dari **root domain** (bukan
  sub-folder), karena `scope`-nya `/`.

Cek cepat sebelum membungkus:

```bash
curl -s https://domainmu.id/manifest.webmanifest | head
curl -sI https://domainmu.id/sw.js | head -3
```

---

## 2A. Bubblewrap (CLI)

```bash
npm install -g @bubblewrap/cli
bubblewrap doctor                 # pastikan JDK & Android SDK siap

bubblewrap init --manifest https://domainmu.id/manifest.webmanifest
```

Bubblewrap akan membaca manifest lalu menanyakan beberapa hal. Jawaban yang
disarankan untuk proyek ini:

| Pertanyaan | Nilai |
| --- | --- |
| Application name | `Orbit Studio` |
| Short name | `Orbit Studio` |
| Application ID | `id.orbit.studio` (pakai domain milikmu, dibalik) |
| Display mode | `standalone` |
| Status bar color | `#17191c` |
| Splash screen color | `#17191c` |
| Start URL | `/app` (agar APK membuka aplikasi, bukan landing) |
| Signing key | buat baru bila ditanya, simpan berkasnya baik-baik |

Lalu bangun:

```bash
bubblewrap build
```

Hasilnya:

- `app-release-signed.apk` — untuk pemasangan langsung / pengujian
- `app-release-bundle.aab` — untuk Google Play Console
- `assetlinks.json` — berkas Digital Asset Links yang **wajib** dipasang

Pasang ke perangkat yang tersambung lewat adb:

```bash
bubblewrap install
# atau: adb install -r app-release-signed.apk
```

Perbarui proyek TWA saat aset web berubah (ikon, manifest):

```bash
bubblewrap update
bubblewrap build
```

---

## 2B. PWABuilder (tanpa CLI)

1. Buka <https://www.pwabuilder.com>.
2. Masukkan URL produksi (mis. `https://domainmu.id`).
3. Pilih **Package for stores → Android**.
4. Isi nama paket, lalu unduh paketnya.
5. Lakukan langkah **Signing key** seperti yang dijelaskan PWABuilder, lalu
   `./gradlew assembleRelease` atau buka folder di Android Studio.

---

## 3. Digital Asset Links (langkah yang sering dilupakan)

Tanpa langkah ini, APK tetap berjalan tetapi **menampilkan bilah alamat
peramban** — jadi tidak terasa seperti aplikasi.

1. Ambil sidik jari SHA-256 dari keluaran `bubblewrap build` (atau dari
   `./gradlew signingReport`).
2. Simpan berkas berikut di server, tepat di path ini:

   `https://domainmu.id/.well-known/assetlinks.json`

   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "id.orbit.studio",
         "sha256_cert_fingerprints": [
           "AA:BB:CC:...:FF"
         ]
       }
     }
   ]
   ```

3. Untuk Firebase Hosting, letakkan berkasnya di `public/.well-known/assetlinks.json`
   agar ikut tersalin saat build. Untuk Netlify/Cloudflare, cukup letakkan di
   `public/` juga (Vite menyalin isi `public/` apa adanya).
4. Verifikasi:

   ```bash
   curl -s https://domainmu.id/.well-known/assetlinks.json | jq .
   ```

   Perlu waktu beberapa menit hingga Google memverifikasi ulang. Setelah itu
   buka APK-nya: aplikasi tampil layar penuh tanpa bilah alamat.

> **Google Play** memakai *Play App Signing*, sehingga sidik jari yang berlaku
> adalah milik Google, bukan kuncimu. Salin SHA-256 dari Play Console →
> *Release → Setup → App signing*, lalu perbarui `assetlinks.json`.

---

## 4. Daftar periksa sebelum merilis

- [ ] `npm run build` bersih tanpa galat.
- [ ] `dist/index.html` memuat `manifest.webmanifest` dan ikon-ikon.
- [ ] Service worker terdaftar di produksi (DevTools → Application → Service Workers).
- [ ] Uji luring: nyalakan *Offline* di DevTools, muat ulang — muncul `offline.html`.
- [ ] Lighthouse → *Installable* hijau.
- [ ] `start_url` APK = `/app`, sehingga pengguna langsung masuk ke aplikasi.
- [ ] `assetlinks.json` dapat diakses publik dan sidik jarinya benar.
- [ ] Sudah diuji di perangkat nyata: splash → masuk → onboarding → aplikasi.
- [ ] Bila memakai Firebase, `apiKey`/`projectId`/`appId` terisi dan aturan
      Firestore sudah dibatasi ke pengguna yang sah.

---

## 5. Catatan tentang mode demo vs Firebase

APK yang dibungkus dari build tanpa `.env.local` akan berjalan dalam **mode
demo** (data contoh disimpan di perangkat). Itu cukup untuk menguji pemasangan,
tetapi bukan untuk produksi.

Untuk versi produksi:

1. Salin `.env.example` → `.env.local`, isi kredensial proyek Firebase.
2. `npm run build` ulang (variabel `VITE_*` disisipkan saat build).
3. Bingkai ulang APK-nya (`bubblewrap update && bubblewrap build`).

Firebase SDK dimuat lewat *dynamic import*, jadi berkas APK/web tetap ringan
saat mode demo dan hanya mengunduh SDK setelah konfigurasi terisi.

---

## 6. Alternatif: Capacitor

Bila butuh plugin native (kamera, berkas, notifikasi push, IAP), bungkus `dist/`
memakai Capacitor alih-alih TWA:

```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npx cap init "Orbit Studio" id.orbit.studio --web-dir=dist
npm run build && npx cap add android && npx cap sync
npx cap open android      # lanjutkan di Android Studio
```

TWA lebih ringan dan selalu memakai versi web terbaru; Capacitor lebih tepat bila
benar-benar butuh akses perangkat tingkat rendah.
