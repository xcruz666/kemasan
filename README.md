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

- `src/app/(site)/page.tsx`: konten beranda, spesifikasi, FAQ, dan bagian pemasaran.
- `src/app/(site)/layout.tsx`: header, footer, dan tombol WhatsApp untuk semua halaman publik.
- `src/app/globals.css`: token warna, tata letak, dan tampilan mobile.
- `src/lib/brand.ts`: nomor kontak dan pembentuk tautan WhatsApp.
- `src/components/quote-form.tsx`: pilihan produk, ukuran, dan jumlah yang dimasukkan ke pesan WhatsApp.

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
- `/<slug>`: halaman tambahan, misalnya Tentang Kami. Bisa dimunculkan di menu header.
- Data disimpan sebagai file JSON dan foto di folder `DATA_DIR` (lokal: `./data`, diabaikan git). Tidak ada database.
- Untuk login lokal, isi `ADMIN_PASSWORD_HASH` (dari `npm run admin:hash-password`) dan `SESSION_SECRET` di `.env.local`.
- Desain lengkap: `docs/superpowers/specs/2026-10-29-admin-katalog-halaman-design.md`. Panduan deploy: `README_SHARED_HOSTING.md`.

Gunakan Node.js 24 (`nvm use`, lihat `.nvmrc`).

## SEO

Salin `.env.example` ke `.env.local` dan isi `SITE_URL` dengan origin domain publik, misalnya `https://www.example.com`. Untuk shared hosting, masukkan variabel `SITE_URL` di pengaturan environment aplikasi Node.js. Canonical, sitemap, robots, Open Graph, dan structured data memakai URL tersebut saat server berjalan. Tanpa domain publik, canonical dan sitemap menunggu sampai `SITE_URL` diatur.
