# Riwayat versi

## 1.1.0 — 19 Oktober 2026

### Baru
- **Onboarding 8 langkah**: perkenalan, tujuan, fokus, target harian, tampilan
  (mode warna dan aksen langsung berlaku), tur fitur dengan ajakan memasang
  aplikasi, notifikasi, dan ringkasan dengan persetujuan Syarat & Privasi.
- **Target fokus harian** dengan progres di Beranda.
- **Ulangi panduan awal** dari Pengaturan → Bantuan & masukan.
- **Logo baru** di seluruh aplikasi, ikon PWA, dan favicon.
- **Dasbor real-time**: Beranda, Aktivitas, dan Insights dihitung dari catatan
  aktivitas di Firestore, plus form **Catat aktivitas**.
- **Broadcast** dari admin sebagai banner real-time, dan **lonceng notifikasi**
  untuk pengumuman.
- **Bantuan & masukan**: kirim masukan dan buat tiket dengan percakapan nyata.
- **Paket & Harga** tampil di landing (`/#harga`) dan di Pengaturan.
- **Mode pemeliharaan**, banner status layanan, dan penutupan pendaftaran lewat
  feature flag `mode.pemeliharaan` dan `pendaftaran.tutup`.
- **Halaman legal**: Syarat & Ketentuan, Kebijakan Privasi, Cookie.
- Aksi admin pada Pengguna yang berefek nyata (nonaktifkan, peran, paket,
  tautan sandi), **Jejak Audit otomatis**, dan Ikhtisar/Analitik dari data nyata.

### Diperbaiki
- Sesi masuk mode Firebase tidak tersimpan sehingga pengguna terlempar setelah
  onboarding.
- Kolom isian di laci admin kehilangan fokus setiap mengetik.
- Hasil pencarian panel admin dan lonceng terpotong di layar sempit serta tembus
  pandang.
- Data "Akun & Profil" terbawa ke akun baru di perangkat yang sama.
- Baris baru di panel admin bisa muncul ganda pada mode real-time.

### Catatan upgrade
- **Perbarui Rules Firestore** (lihat README): ada tiga field profil baru
  (`dailyTarget`, `termsAcceptedAt`, `termsVersion`). Tanpa itu onboarding tetap
  selesai, tetapi field baru itu tidak tersimpan.
- Naikkan cache PWA: `orbit-v3`. Pengguna lama menerima versi baru saat
  membuka ulang aplikasi.

## 1.0.0 — 18 Oktober 2026

Rilis awal: landing page, aplikasi PWA (Beranda, Aktivitas, Insights,
Pengaturan 94 item), konsol admin 33 panel, mode demo dan Firebase.
