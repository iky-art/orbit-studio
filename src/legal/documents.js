import { LEGAL, contactLine } from './config'

/**
 * Isi dokumen legal. Format `body`: string = paragraf, array = daftar poin.
 * Dokumen ini adalah draf kerja yang menggambarkan cara kerja aplikasi saat
 * ini; sebaiknya ditinjau penasihat hukum sebelum dipakai untuk layanan komersial.
 */

const terms = {
  slug: 'terms',
  title: 'Syarat & Ketentuan',
  short: 'Syarat',
  summary: 'Aturan main saat kamu memakai Orbit Studio Workbench.',
  sections: [
    {
      id: 'penerimaan',
      h: '1. Penerimaan syarat',
      body: [
        `Syarat & Ketentuan ini berlaku saat kamu membuat akun atau memakai ${LEGAL.product} ("Layanan") yang dikelola ${LEGAL.company} ("kami"). Dengan membuat akun atau terus memakai Layanan, kamu menyatakan telah membaca dan menyetujuinya, termasuk Kebijakan Privasi dan Kebijakan Cookie & Penyimpanan Lokal.`,
        'Jika kamu tidak setuju, mohon jangan memakai Layanan.',
      ],
    },
    {
      id: 'layanan',
      h: '2. Tentang layanan',
      body: [
        'Layanan adalah ruang kerja berbasis web (Progressive Web App) untuk mencatat aktivitas, melihat ringkasan fokus, dan, bagi pengelola, menjalankan konsol admin. Layanan dapat dipasang di perangkatmu dan sebagian fiturnya berjalan tanpa internet.',
        'Layanan berstatus versi 1.0 dan dapat berubah, bertambah, atau dihentikan sebagian dari waktu ke waktu.',
      ],
    },
    {
      id: 'akun',
      h: '3. Akun dan keamanan',
      body: [
        [
          'Berikan data yang benar saat mendaftar (nama dan email) dan jaga agar tetap mutakhir.',
          'Jaga kerahasiaan kata sandimu. Kamu bertanggung jawab atas aktivitas yang terjadi lewat akunmu.',
          'Segera beri tahu kami bila kamu menduga akunmu diakses orang lain.',
          'Pengguna di bawah 18 tahun hanya boleh memakai Layanan dengan persetujuan orang tua atau wali.',
        ],
      ],
    },
    {
      id: 'penggunaan',
      h: '4. Penggunaan yang diizinkan',
      body: [
        'Kamu setuju untuk tidak:',
        [
          'melanggar hukum yang berlaku di Indonesia atau hak pihak lain;',
          'mencoba mengakses akun, data, atau bagian Layanan yang bukan hakmu, termasuk mengubah perananmu sendiri;',
          'mengganggu, membebani, atau memindai Layanan secara berlebihan, atau menyebarkan kode berbahaya;',
          'memasukkan konten yang melanggar hukum, menyesatkan, atau melanggar hak kekayaan intelektual;',
          'memakai Layanan untuk mengirim spam atau menyamar sebagai orang lain.',
        ],
      ],
    },
    {
      id: 'konten',
      h: '5. Data dan konten milikmu',
      body: [
        'Catatan aktivitas dan data lain yang kamu masukkan tetap milikmu. Kamu memberi kami izin terbatas untuk menyimpan, memproses, dan menampilkannya semata-mata agar Layanan berjalan untukmu, sebagaimana dijelaskan dalam Kebijakan Privasi.',
        'Kamu bertanggung jawab atas isi yang kamu masukkan.',
      ],
    },
    {
      id: 'admin',
      h: '6. Peran admin dan Broadcast',
      body: [
        'Pengelola dengan peran owner atau admin dapat membuka konsol admin untuk menjalankan Layanan. Dalam batas yang dijelaskan di Kebijakan Privasi, mereka dapat melihat data akun dan catatan aktivitas, mengelola peran pengguna, serta mengirim pesan Broadcast yang tampil di aplikasi pengguna.',
        'Pesan Broadcast bersifat informasi layanan (misalnya pemeliharaan atau pembaruan) dan dapat kamu tutup dari layar.',
      ],
    },
    {
      id: 'ketersediaan',
      h: '7. Ketersediaan dan perubahan layanan',
      body: [
        'Kami berupaya menjaga Layanan tetap tersedia, tetapi tidak menjamin Layanan bebas gangguan atau galat. Pemeliharaan, gangguan penyedia infrastruktur, atau pembaruan dapat membuat Layanan tidak tersedia sementara.',
        'Kami dapat mengubah fitur Layanan; perubahan penting akan diumumkan lewat Broadcast atau halaman ini bila memungkinkan.',
      ],
    },
    {
      id: 'penafian',
      h: '8. Penafian dan batas tanggung jawab',
      body: [
        'Layanan disediakan "sebagaimana adanya" dan "sebagaimana tersedia". Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau kehilangan keuntungan yang timbul dari pemakaian atau ketidakmampuan memakai Layanan.',
        'Angka dan ringkasan di dasbor dihitung dari catatan yang kamu masukkan dan dimaksudkan sebagai bantuan pribadi, bukan nasihat profesional.',
        'Tidak ada ketentuan di sini yang meniadakan hak konsumen atau tanggung jawab yang menurut hukum tidak boleh dikecualikan.',
      ],
    },
    {
      id: 'penangguhan',
      h: '9. Penangguhan dan penghentian',
      body: [
        'Kami dapat menangguhkan atau menghapus akun yang melanggar syarat ini atau membahayakan Layanan atau pengguna lain. Kamu dapat berhenti memakai Layanan kapan saja dan meminta penghapusan akunmu sesuai Kebijakan Privasi.',
      ],
    },
    {
      id: 'ki',
      h: '10. Hak kekayaan intelektual',
      body: [
        `Nama, logo, dan tampilan ${LEGAL.company} serta Layanan dilindungi hukum kekayaan intelektual dan tidak boleh dipakai tanpa izin tertulis, kecuali sejauh diperlukan untuk memakai Layanan secara wajar.`,
      ],
    },
    {
      id: 'perubahan',
      h: '11. Perubahan syarat',
      body: [
        'Kami dapat memperbarui syarat ini. Tanggal "terakhir diperbarui" di bagian atas halaman menunjukkan versi terbaru. Bila perubahan material, kami akan memberi tahu lewat Layanan. Memakai Layanan setelah perubahan berlaku berarti kamu menerimanya.',
      ],
    },
    {
      id: 'hukum',
      h: '12. Hukum yang berlaku dan sengketa',
      body: [
        'Syarat ini tunduk pada hukum Republik Indonesia. Bila timbul sengketa, kita upayakan penyelesaian secara musyawarah lebih dulu; bila tidak tercapai, sengketa diselesaikan melalui pengadilan yang berwenang di Indonesia.',
      ],
    },
    {
      id: 'kontak',
      h: '13. Kontak',
      body: [`Pertanyaan tentang syarat ini? ${contactLine()}`],
    },
  ],
}

const privacy = {
  slug: 'privacy',
  title: 'Kebijakan Privasi',
  short: 'Privasi',
  summary: 'Data apa yang kami simpan, untuk apa, dan hakmu atas data itu.',
  highlights: [
    'Kami tidak menjual data pribadimu dan tidak menampilkan iklan.',
    'Kami hanya menyimpan data yang dibutuhkan agar Layanan berjalan.',
    'Kamu berhak meminta akses, perbaikan, dan penghapusan datamu.',
  ],
  sections: [
    {
      id: 'pengendali',
      h: '1. Siapa kami',
      body: [
        `${LEGAL.company} adalah pengendali data pribadi untuk ${LEGAL.product}. Kebijakan ini menjelaskan bagaimana kami memproses data pribadimu sesuai hukum Indonesia, termasuk Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.`,
      ],
    },
    {
      id: 'data',
      h: '2. Data yang kami proses',
      body: [
        [
          'Data akun: nama, alamat email, dan kata sandi. Kata sandi dikelola Firebase Authentication milik Google; kami tidak dapat melihat kata sandimu dalam bentuk asli.',
          'Data profil: peran (member, admin, atau owner), paket, status onboarding, dan tanggal pendaftaran.',
          'Catatan aktivitas yang kamu buat: jenis, judul, nama proyek (opsional), durasi (opsional), dan waktu pencatatan. Sesi fokus yang selesai di Beranda juga tercatat otomatis sebagai catatan aktivitas.',
          'Data yang tersimpan hanya di perangkatmu: sesi masuk, pengaturan tampilan dan preferensi, serta daftar pesan Broadcast yang sudah kamu tutup (lihat Kebijakan Cookie & Penyimpanan Lokal).',
          'Data teknis: saat kamu masuk atau mengakses database, penyedia infrastruktur (Google Firebase dan penyedia hosting) dapat memproses alamat IP, jenis perangkat, dan log teknis untuk menjalankan serta mengamankan layanan mereka.',
        ],
        'Kami tidak meminta data sensitif (seperti data kesehatan, biometrik, atau keuangan) dan kamu diminta tidak memasukkannya ke kolom bebas seperti judul aktivitas.',
      ],
    },
    {
      id: 'tujuan',
      h: '3. Untuk apa data dipakai',
      body: [
        [
          'Membuat dan mengamankan akunmu serta mengenali kamu saat masuk.',
          'Menampilkan dasbor, grafik, dan ringkasan dari catatan aktivitasmu sendiri.',
          'Mengirim informasi layanan seperti Broadcast (pemeliharaan, pembaruan, pengumuman).',
          'Menjaga keamanan dan mencegah penyalahgunaan, serta memenuhi kewajiban hukum.',
        ],
        'Dasar pemrosesannya adalah persetujuanmu saat mendaftar, pelaksanaan perjanjian pemakaian Layanan, dan kepentingan sah untuk menjaga keamanan Layanan.',
      ],
    },
    {
      id: 'pihak-ketiga',
      h: '4. Pihak ketiga yang membantu kami',
      body: [
        [
          'Google Firebase (Authentication dan Cloud Firestore) menyimpan akun, profil, dan catatanmu sebagai pemroses data kami.',
          'Penyedia hosting (misalnya Cloudflare Pages) menyajikan aplikasi ke perangkatmu.',
        ],
        'Saat ini kami tidak memasang pelacak iklan maupun layanan analitik pihak ketiga di aplikasi. Kami tidak menjual atau menyewakan data pribadimu. Data dapat dibuka kepada pihak berwenang bila diwajibkan hukum.',
      ],
    },
    {
      id: 'akses',
      h: '5. Siapa yang dapat melihat datamu',
      body: [
        [
          'Kamu dapat melihat dan mengelola data akun serta catatan aktivitasmu sendiri.',
          'Pengguna lain tidak dapat melihat catatan aktivitasmu.',
          'Pengelola dengan peran owner atau admin dapat mengakses data akun dan catatan aktivitas lewat konsol admin, semata-mata untuk menjalankan, mengamankan, dan mendukung Layanan.',
        ],
      ],
    },
    {
      id: 'retensi',
      h: '6. Berapa lama data disimpan',
      body: [
        'Data akun dan catatan aktivitasmu disimpan selama akunmu aktif. Setelah kamu meminta penghapusan dan identitasmu terverifikasi, kami menghapus datamu dalam waktu yang wajar, kecuali sebagian harus kami simpan untuk memenuhi kewajiban hukum atau menyelesaikan sengketa.',
        'Data yang tersimpan di perangkatmu dapat kamu hapus sendiri kapan saja lewat pengaturan browser.',
      ],
    },
    {
      id: 'hak',
      h: '7. Hakmu',
      body: [
        'Sesuai UU Pelindungan Data Pribadi, kamu berhak untuk:',
        [
          'mengetahui dan mengakses data pribadimu yang kami proses;',
          'memperbaiki data yang tidak akurat atau tidak lengkap;',
          'meminta penghapusan atau pemusnahan data pribadimu;',
          'menarik persetujuan pemrosesan data;',
          'mengajukan keberatan atau meminta pembatasan pemrosesan tertentu;',
          'meminta salinan data dalam format yang lazim dipakai (portabilitas) bila memungkinkan secara teknis.',
        ],
        `Untuk menggunakan hak ini, kirim permintaan dari email yang terdaftar. ${contactLine()} Kami akan menanggapi dalam waktu yang wajar.`,
      ],
    },
    {
      id: 'keamanan',
      h: '8. Keamanan',
      body: [
        'Kami memakai langkah teknis yang wajar: koneksi HTTPS, autentikasi lewat Firebase, dan aturan akses database yang membatasi data pengguna pada pemiliknya serta pengelola. Meski demikian, tidak ada sistem yang sepenuhnya aman. Bila terjadi kegagalan pelindungan data yang berdampak padamu, kami akan memberi tahu sesuai ketentuan hukum yang berlaku.',
      ],
    },
    {
      id: 'lintas-negara',
      h: '9. Penyimpanan di luar Indonesia',
      body: [
        'Infrastruktur Google dan penyedia hosting dapat memproses data di luar Indonesia. Kami memilih penyedia yang menerapkan standar keamanan yang memadai dan memakai wilayah penyimpanan yang dipilih pengelola.',
      ],
    },
    {
      id: 'anak',
      h: '10. Anak-anak',
      body: [
        'Layanan tidak ditujukan bagi anak di bawah 18 tahun tanpa persetujuan orang tua atau wali. Bila kamu orang tua atau wali dan mengetahui anakmu mendaftar tanpa izin, hubungi kami agar datanya dihapus.',
      ],
    },
    {
      id: 'perubahan',
      h: '11. Perubahan kebijakan',
      body: [
        'Kami dapat memperbarui kebijakan ini. Versi terbaru selalu ada di halaman ini dengan tanggal pembaruannya, dan perubahan material akan diberitahukan lewat Layanan.',
      ],
    },
    {
      id: 'kontak',
      h: '12. Kontak',
      body: [`Pertanyaan atau permintaan tentang data pribadimu? ${contactLine()}`],
    },
  ],
}

const cookies = {
  slug: 'cookies',
  title: 'Cookie & Penyimpanan Lokal',
  short: 'Cookie',
  summary: 'Apa saja yang disimpan di browsermu dan cara menghapusnya.',
  highlights: [
    'Kami tidak memakai cookie iklan atau pelacak lintas situs.',
    'Penyimpanan di browser dipakai agar kamu tetap masuk dan pengaturanmu diingat.',
  ],
  sections: [
    {
      id: 'apa',
      h: '1. Apa yang kami simpan di perangkatmu',
      body: [
        'Orbit Studio berjalan sebagai aplikasi web yang menyimpan sebagian data langsung di browsermu:',
        [
          'Penyimpanan lokal (localStorage, awalan "orbit:"): sesi masuk, pengaturan tampilan dan preferensi, serta daftar pesan Broadcast yang sudah kamu tutup.',
          'Penyimpanan milik Firebase (IndexedDB dan sejenisnya): token yang menjaga kamu tetap masuk.',
          'Cache aplikasi (service worker): salinan berkas aplikasi agar bisa dibuka cepat dan sebagian berjalan tanpa internet.',
        ],
      ],
    },
    {
      id: 'tujuan',
      h: '2. Mengapa perlu',
      body: [
        'Semua penyimpanan di atas bersifat fungsional: menjaga sesi, mengingat pilihanmu, dan membuat aplikasi cepat serta bisa dipakai luring. Kami tidak memakainya untuk iklan atau pelacakan lintas situs, dan tidak ada layanan analitik pihak ketiga yang dipasang saat ini.',
      ],
    },
    {
      id: 'demo',
      h: '3. Mode demo',
      body: [
        'Jika aplikasi dijalankan tanpa Firebase (mode demo), akun dan data contoh hanya tersimpan di browser perangkatmu dan tidak dikirim ke server.',
      ],
    },
    {
      id: 'hapus',
      h: '4. Cara menghapus',
      body: [
        [
          'Keluar dari akun menghapus sesi masuk dari perangkat.',
          'Hapus data situs (site data) untuk alamat aplikasi lewat pengaturan browser untuk membersihkan semua penyimpanan lokal dan cache.',
          'Jika aplikasi dipasang ke layar utama, menghapus pemasangannya juga membersihkan datanya di perangkat.',
        ],
        'Setelah dihapus, kamu mungkin perlu masuk lagi dan mengatur ulang preferensi.',
      ],
    },
    {
      id: 'kontak',
      h: '5. Pertanyaan',
      body: [`Lihat juga Kebijakan Privasi. ${contactLine()}`],
    },
  ],
}

export const LEGAL_DOCS = [terms, privacy, cookies]

export const getLegalDoc = (slug) => LEGAL_DOCS.find((doc) => doc.slug === slug) ?? null

/** Judul tab browser untuk path /legal/*. */
export function getLegalTitle(path) {
  const slug = path.split('/')[2]
  const doc = slug ? getLegalDoc(slug) : null
  return doc ? `${doc.title} — Orbit Studio` : 'Legal — Orbit Studio'
}
