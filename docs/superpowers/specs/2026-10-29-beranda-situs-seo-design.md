# Halaman Utama, Situs & SEO yang bisa diedit — desain

Tanggal: 2026-10-29. Status: disetujui pengguna ("lanjut, jangan sampai mengubah design").

## Tujuan

Semua isi beranda, teks di sekitar setiap halaman, dan SEO bisa diubah dari admin, tanpa database dan tanpa mengubah desain. Pemicu: preview link di Telegram/WhatsApp ("Optima Kemasan Prima" + judul + deskripsi + gambar) harus bisa diatur.

## Keputusan

| Topik | Keputusan |
|---|---|
| Daftar item beranda | Jumlah kartu tetap sesuai desain (strip 4, keunggulan 3, spesifikasi 5, aplikasi 4, langkah 3). FAQ 1–12 dan pilihan produk form penawaran 1–10 bisa ditambah/dihapus. |
| Canonical | Domain canonical global (kosong = `SITE_URL`) dan override per halaman: Beranda, Katalog, setiap produk, setiap halaman. Harus URL http(s) lengkap. |
| Tambahan | Foto hero dan foto bagian produk, saklar tampil per bagian (hero selalu tampil karena memuat H1), bar pengumuman dan footer, pesan WhatsApp per tombol. |
| Logo | Dua mode di Situs & SEO: logo teks (ikon, kata utama, tanda berwarna, teks kecil; markup desain sama) atau gambar upload (tinggi 47 px, 40 px di HP, lebar maks. 220 px). Dipakai di header, footer, dan logo Organization di structured data. |
| Tetap (desain) | Navigasi footer, nomor urut kartu/langkah, ikon pada label material hero, CSS dan struktur elemen. |
| Bawaan | Isi bawaan sama persis dengan teks sebelumnya, sehingga HTML tidak berubah sampai admin mengedit. |

## Penyimpanan

- `DATA_DIR/landing.json`: `LandingContent` (`src/lib/content/landing-shared.ts`). Dibaca longgar: bagian yang hilang atau rusak memakai bawaan.
- `DATA_DIR/settings.json`: ditambah `site` (`SiteIdentity`) dan `seo` (`SeoSettings`) (`src/lib/content/settings-shared.ts`).
- Produk dan halaman: field opsional `canonicalUrl`. File lama tanpa field ini tetap valid.
- Pembersihan foto menghitung foto beranda dan foto SEO sebagai terpakai.

## SEO

- `src/lib/seo.ts`: judul = judul halaman + " | nama situs" (bisa dimatikan). Deskripsi kosong memakai deskripsi bawaan. Judul/deskripsi preview opsional. Gambar preview: milik halaman, lalu gambar bawaan dari admin, lalu `/images/optima-social.jpg`.
- `getPublicOrigin()`: domain canonical admin, lalu `SITE_URL`. Dipakai canonical, sitemap, robots, Open Graph, dan structured data.
- Favicon: PNG/WebP hasil upload, juga sebagai apple-touch-icon. Kosong = `/icon.svg`.
- Structured data beranda: Organization, WebSite, WebPage dari pengaturan. Entitas Product generik yang ditulis tetap di kode dihapus karena isinya tidak lagi dijamin sesuai dengan konten yang diedit admin.

## Admin

- `/admin/beranda`: satu form per bagian (dapat dilipat), satu tombol Simpan.
- `/admin/situs`: identitas & tampilan situs, SEO bawaan, favicon, domain canonical, SEO Beranda dan Katalog dengan pratinjau kartu link.
- Form produk dan halaman: kolom Canonical URL di area SEO.

## Risiko

- Canonical salah bisa mengeluarkan halaman dari Google: validasi URL dan peringatan di form.
- Menyembunyikan bagian beranda membuat link menu bawaan (#produk, #faq, …) tidak punya tujuan: peringatan di form, menu bisa disembunyikan di Pengaturan.
- Cache preview WhatsApp/Telegram: dijelaskan di admin (Telegram: @WebpageBot).
