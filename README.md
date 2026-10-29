# Optima Kemasan Prima

Website penjualan kantong vacuum premium menggunakan Next.js App Router, TypeScript, dan CSS responsif. Pemesanan diteruskan ke WhatsApp **0812-2220-195** (`628122220195`).

## Menjalankan

Node.js 20.9 atau lebih baru.

```sh
npm ci
npm run dev
```

Buka http://localhost:3000. Untuk produksi:

```sh
npm run build
npm start
```

## Konten dan kontak

- Semua teks, foto, dan pesan WhatsApp di beranda diatur di `/admin/beranda`. Teks bawaan ada di `src/lib/content/landing-shared.ts`; tampilannya di `src/app/(site)/page.tsx`.
- Nama situs, bar pengumuman, teks footer, dan label tombol diatur di `/admin/situs`. Tampilannya di `src/app/(site)/layout.tsx`.
- `src/app/globals.css`: token warna, tata letak, dan tampilan mobile.
- `src/lib/brand.ts`: pembentuk tautan WhatsApp. Nomor WhatsApp diatur di `/admin/pengaturan` (nilai bawaan di `src/lib/content/settings-shared.ts`).
- `src/components/quote-form.tsx`: formulir penawaran. Pilihan produk dan template pesannya diatur di `/admin/beranda`.

Formulir hanya menyusun tautan WhatsApp. Data tidak disimpan atau dikirim ke server situs. Pesan baru terkirim setelah pengunjung mengirimkannya sendiri di WhatsApp.

Nama Optima Kemasan Prima telah dikonfirmasi pengguna. Spesifikasi bersumber dari materi promosi pengguna; harga, minimum pemesanan, kecocokan mesin, dan pengiriman dikonfirmasi lewat konsultasi. Tidak ada harga, testimoni, atau nomor sertifikasi rekaan.

## Aset

Foto ilustrasi dibuat dengan tool imagegen bawaan, lalu dikonversi ke WebP untuk web. Foto merupakan ilustrasi, bukan dokumentasi produk aktual. Prompt dan lokasi aset tercantum di `docs/image-prompts.md`.

Font Geist disimpan lokal agar render dan build tidak bergantung pada layanan font eksternal. Ikon memakai Lucide.

## Pemeriksaan

```sh
npm run typecheck
npm run build
```

Struktur mengikuti [dokumentasi instalasi Next.js](https://nextjs.org/docs/app/getting-started/installation).

## Admin, katalog, dan halaman

- `/admin`: login satu password. Kelola produk, kategori, dan halaman. Editor punya mode visual dan Markdown.
- `/katalog` dan `/katalog/<slug>`: katalog produk yang berstatus Terbit. Produk yang ditandai Unggulan juga tampil di beranda.
- `/<slug>`: halaman tambahan, misalnya Tentang Kami. Tambahkan ke menu header lewat Pengaturan.
- `/admin/beranda`: semua isi halaman utama. Bagian selain hero bisa disembunyikan. Desain dan jumlah kartu tetap; hanya FAQ yang bisa ditambah atau dihapus.
- `/admin/situs`: nama situs, logo (teks bawaan yang bisa diubah atau gambar upload), bar pengumuman, footer, favicon, gambar preview link, SEO Beranda dan Katalog, serta domain canonical.
- `/admin/pengaturan`: menu header (link bawaan bisa disembunyikan, link lain bisa ditambah) serta nomor WhatsApp dan pesan pembuka untuk semua tombol WhatsApp.
- Data disimpan sebagai file JSON dan foto di folder `DATA_DIR` (lokal: `./data`, diabaikan git). Tidak ada database.
- Untuk login lokal, isi `ADMIN_PASSWORD_HASH` (dari `npm run admin:hash-password`) dan `SESSION_SECRET` di `.env.local`.
- Desain lengkap: `docs/superpowers/specs/2026-10-29-admin-katalog-halaman-design.md`. Panduan deploy: `README_SHARED_HOSTING.md`.

Gunakan Node.js 24 (`nvm use`, lihat `.nvmrc`).

## SEO

Salin `.env.example` ke `.env.local` dan isi `SITE_URL` dengan origin domain publik, misalnya `https://www.example.com`. Untuk shared hosting, masukkan variabel `SITE_URL` di pengaturan environment aplikasi Node.js. Canonical, sitemap, robots, Open Graph, dan structured data memakai URL tersebut saat server berjalan. Tanpa domain publik, canonical dan sitemap menunggu sampai `SITE_URL` diatur.

Domain canonical di `/admin/situs` menggantikan `SITE_URL` untuk canonical, sitemap, dan preview link. Produk dan halaman punya kolom Canonical URL opsional; kosong berarti URL halaman itu sendiri. Judul dan deskripsi preview (Open Graph) bisa dibedakan dari judul halaman. WhatsApp dan Telegram menyimpan cache preview, jadi link yang pernah dibagikan bisa tetap menampilkan versi lama.
