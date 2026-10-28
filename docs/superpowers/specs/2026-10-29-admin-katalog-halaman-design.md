# Desain: Admin Panel, Katalog Produk, dan Halaman Tambahan

Tanggal: 2026-10-29
Status: disetujui pengguna (2026-10-29)

## 1. Tujuan dan batasan

**Tujuan**

- Admin dapat menambah, mengubah, dan menghapus **produk** tanpa bantuan developer.
- Produk tampil di halaman **katalog** publik yang SEO-friendly.
- Admin dapat membuat **halaman tambahan** (misalnya Tentang Kami, Cara Pemesanan) dengan template artikel.

**Batasan**

- Berjalan di shared hosting Node.js (cPanel + LiteSpeed/Passenger) yang sudah dipakai sekarang.
- Tanpa server database. Data disimpan sebagai file di disk server.
- Jumlah produk diperkirakan maksimal 15–20. Jumlah halaman tambahan sedikit.
- Satu admin. Tidak ada peran pengguna.

**Di luar cakupan (sengaja tidak dibuat)**

- Banyak akun admin, peran, atau log aktivitas.
- Riwayat revisi atau undo.
- Pencarian produk, keranjang belanja, atau checkout. Pemesanan tetap lewat WhatsApp.
- Halaman daftar artikel atau blog.
- Page builder bebas (drag-and-drop atau susun blok).
- Mengedit konten halaman utama yang sudah ada. Konten itu tetap di kode, kecuali section "Produk unggulan" yang baru.

## 2. Arsitektur dan penyimpanan

```
Browser ──► LiteSpeed ──► Next.js (server.js)
                               │ baca/tulis file
                               ▼
                  DATA_DIR  (contoh: /home/<user>/optima-data, di LUAR Application root)
                  ├── products/<id>.json
                  ├── pages/<id>.json
                  ├── categories.json
                  └── uploads/<uuid>.<jpg|png|webp>
```

| Keputusan | Alasan |
|---|---|
| Folder data ditunjuk env `DATA_DIR` dan berada di luar Application root | Deploy ZIP baru tidak menimpa data |
| Kalau `DATA_DIR` tidak diisi, default ke `./data` (masuk `.gitignore`) | `npm run dev` lokal tetap jalan tanpa konfigurasi |
| Satu file JSON per produk atau halaman. Nama file memakai `id` (UUID), bukan slug | Satu edit hanya menyentuh satu file. Slug bisa diganti tanpa rename file |
| Teks panjang (`description`, `body`) disimpan sebagai string Markdown di dalam JSON | Format teks yang rapi, mudah dipindahkan, dan aman diubah menjadi HTML |
| Penulisan atomik: tulis ke `<file>.tmp-<random>` lalu `rename` | Passenger bisa menjalankan lebih dari satu proses. Server bisa mati di tengah penulisan. File tidak boleh setengah tertulis |
| Halaman publik membaca file setiap kali diminta (`force-dynamic`, pola yang sudah dipakai `page.tsx`) | Perubahan admin langsung tampil, tanpa build ulang dan tanpa cache yang perlu dibersihkan. Untuk ±20 file, biayanya kecil |
| Foto dikirim lewat route handler `GET /uploads/[file]` | `public/` ada di dalam ZIP dan tertimpa saat deploy |
| Foto diperkecil di **browser admin** sebelum upload (WebP, sisi terpanjang maks 1600 px). Foto ditampilkan dengan `next/image` `unoptimized` | Server tidak memproses gambar sama sekali. Di hosting Linux, `sharp` jatuh ke versi wasm yang berat dan bisa melewati batas RAM/CPU shared hosting |

### 2.1 Model data

**Produk** (`products/<id>.json`)

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | string (UUID) | ya | Dibuat sistem |
| `slug` | string | ya | `^[a-z0-9]+(-[a-z0-9]+)*$`, unik di antara produk |
| `name` | string | ya | Maks 120 karakter |
| `categoryId` | string \| null | tidak | Mengacu ke `categories.json` |
| `summary` | string | ya | Maks 200 karakter. Dipakai di kartu katalog dan sebagai fallback meta description |
| `description` | string (Markdown) | tidak | |
| `specs` | `{ label, value }[]` | tidak | Contoh: Ketebalan, 75 mikron |
| `price` | number \| null | tidak | Rupiah, bilangan bulat. `null` = tampil "Tanya harga" |
| `priceUnit` | string | tidak | Contoh: "per pack" |
| `images` | `{ file, alt, width, height }[]` | tidak | Urutan pertama = foto utama. `alt` wajib kalau foto ada. `width`/`height` disimpan supaya layout tidak bergeser (CLS) |
| `featured` | boolean | ya | Tampil di section "Produk unggulan" halaman utama |
| `status` | `"draft"` \| `"published"` | ya | Draf tidak tampil publik (404) |
| `sortOrder` | number | ya | Urutan di katalog, dari kecil ke besar |
| `seoTitle` | string | tidak | Fallback: `name` |
| `seoDescription` | string | tidak | Fallback: `summary` |
| `createdAt`, `updatedAt` | string (ISO) | ya | Dibuat sistem |

**Halaman** (`pages/<id>.json`)

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | string (UUID) | ya | |
| `slug` | string | ya | Pola sama seperti produk. Unik di antara halaman. Tidak boleh memakai slug yang dicadangkan (lihat 4.3) |
| `title` | string | ya | Menjadi H1 |
| `body` | string (Markdown) | ya | |
| `coverImage` | `{ file, alt, width, height }` \| null | tidak | |
| `showInMenu` | boolean | ya | Tampil di menu header |
| `menuOrder` | number | ya | |
| `status` | `"draft"` \| `"published"` | ya | |
| `seoTitle`, `seoDescription` | string | tidak | Fallback deskripsi: 160 karakter pertama teks `body` |
| `createdAt`, `updatedAt` | string (ISO) | ya | |

**Kategori** (`categories.json`): `{ id, slug, name, sortOrder }[]`. Kategori yang masih dipakai produk tidak dapat dihapus.

## 3. Admin dan keamanan

### 3.1 Rute admin

| Rute | Fungsi |
|---|---|
| `/admin/login` | Form password |
| `/admin` | Ringkasan: jumlah produk, halaman, dan draf. Tautan cepat |
| `/admin/produk`, `/admin/produk/baru`, `/admin/produk/[id]` | Daftar, buat, edit, dan hapus produk |
| `/admin/kategori` | Daftar, tambah, ubah nama, dan hapus kategori dalam satu layar |
| `/admin/halaman`, `/admin/halaman/baru`, `/admin/halaman/[id]` | Daftar, buat, edit, dan hapus halaman |

Semua penyimpanan memakai **Server Actions**. Teks antarmuka admin memakai Bahasa Indonesia.

### 3.2 Login dan sesi

- **Password:** env `ADMIN_PASSWORD_HASH` berisi hash scrypt (`node:crypto`, tanpa library tambahan). Hash dibuat dengan `npm run admin:hash-password`. Password asli tidak pernah disimpan di panel hosting.
- **Sesi:** cookie `optima_admin` berisi `expiry` yang ditandatangani HMAC-SHA256 dengan env `SESSION_SECRET` (minimal 32 karakter).
  - Cookie diset `httpOnly`, `secure` (di produksi), `sameSite=lax`, berlaku 7 hari.
  - Logout menghapus cookie.
  - Mengganti `SESSION_SECRET` membatalkan semua sesi.
- **Pemeriksaan berlapis:**
  1. `src/proxy.ts` (nama baru Middleware di Next.js 16): pemeriksaan cepat. Setiap `/admin/*` kecuali `/admin/login` dialihkan ke login kalau cookie tidak valid.
  2. `requireAdmin()` dipanggil di **setiap** halaman admin dan **setiap** Server Action. Sesuai panduan Next.js, Proxy tidak boleh menjadi satu-satunya pertahanan.
- **Batas percobaan login:** di memori, per IP. 5 kali gagal → dikunci 15 menit. Batas ini per proses Passenger, jadi kalau ada lebih dari satu proses, batas efektifnya berlipat. Untuk satu admin, ini bisa diterima.
- **Perbandingan:** hash dan tanda tangan dibandingkan dengan `timingSafeEqual`.
- **Kalau env admin belum diisi:** `/admin/login` menampilkan pesan "Admin belum dikonfigurasi". Situs publik tetap jalan.

### 3.3 Upload foto

- Admin memilih JPEG, PNG, atau WebP. Browser memperkecilnya dengan canvas (WebP, kualitas 0,82, sisi terpanjang maks 1600 px) lalu mengirim hasilnya beserta `width`/`height`. Biasanya hasilnya 150–400 KB (`Typically:`).
- Server tetap memvalidasi: tipe dicek dari **byte awal file** (magic bytes), bukan dari ekstensi atau `Content-Type`.
- Maks 3 MB per file, untuk berjaga-jaga kalau browser lama tidak bisa encode WebP dan mengirim file asli. Satu file per pemanggilan action. `experimental.serverActions.bodySizeLimit = '4mb'`.
- Nama file selalu `crypto.randomUUID()` + ekstensi hasil deteksi. Nama dari pengguna tidak pernah dipakai, sehingga path traversal tidak mungkin terjadi.
- `GET /uploads/[file]` hanya melayani nama yang cocok dengan `^[0-9a-f-]{36}\.(jpg|png|webp)$`, dengan header `Cache-Control: public, max-age=31536000, immutable`.
- Saat produk atau halaman dihapus, file foto miliknya ikut dihapus, kecuali foto yang masih dipakai item lain.
- `Verify this:` LiteSpeed di hosting mungkin punya batas ukuran request sendiri. Uji upload 3 MB setelah deploy.

### 3.4 Editor teks

- **Tiptap v3** (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/markdown`), dimuat hanya di halaman admin.
- Dua mode, seperti komentar GitLab:
  - **Visual**: toolbar Heading 2/3, Tebal, Miring, List, List bernomor, Link, Kutipan, Sisip gambar.
  - **Markdown**: textarea mentah.
- Isi selalu disimpan sebagai Markdown. Saat pindah mode, format Markdown bisa dinormalisasi (misalnya `*` menjadi `-`), tetapi isinya tidak berubah.
- Heading 1 tidak disediakan. H1 sudah dipakai untuk nama produk atau judul halaman (aturan SEO: satu H1 per halaman).
- Sisip gambar memakai alur upload di 3.3 dan meminta teks alt.

## 4. Halaman publik dan SEO

### 4.1 Rute publik baru

| Rute | Isi |
|---|---|
| `/katalog` | Grid produk terbit, urut `sortOrder`. Chip filter kategori `/katalog?kategori=<slug>`. Canonical selalu `/katalog` |
| `/katalog/[slug]` | Galeri foto, H1 nama produk, harga atau "Tanya harga", tabel spesifikasi, deskripsi, tombol WhatsApp berisi nama produk, maks 3 produk lain dari kategori yang sama |
| `/[slug]` | H1 judul, gambar sampul, isi halaman |

Produk atau halaman berstatus draf, atau slug yang tidak ada, mengembalikan `notFound()` (404 Next.js yang sudah ada).

### 4.2 Perubahan pada halaman yang sudah ada

- **Header** (`src/components/header.tsx`):
  - Tautan anchor diubah dari `#produk` menjadi `/#produk`, supaya tetap berfungsi dari halaman lain.
  - Ditambah tautan "Katalog" dan halaman dengan `showInMenu`. Daftar menu dikirim sebagai props dari server.
  - Logo mengarah ke `/`.
- **Footer:** dipindah dari `page.tsx` ke `src/components/footer.tsx` supaya dipakai di semua halaman publik. Isinya tidak berubah.
- **Halaman utama:**
  - Section baru "Produk unggulan" tepat setelah section `#produk`, maks 6 produk `featured` yang terbit, dengan tautan "Lihat semua produk" ke `/katalog`.
  - Kalau tidak ada produk unggulan, section tidak ditampilkan.
- **Form konsultasi** (`quote-form.tsx`): tidak berubah.

### 4.3 Slug yang dicadangkan untuk halaman

`admin`, `katalog`, `uploads`, `api`, `images`, `fonts`, `_next`. Pola slug tidak mengizinkan titik, jadi `robots.txt`, `sitemap.xml`, dan `icon.svg` aman dengan sendirinya.

### 4.4 SEO

| Elemen | Implementasi |
|---|---|
| Title | `<seoTitle atau nama/judul> \| Optima Kemasan Prima` |
| Meta description | `seoDescription` → fallback `summary` (produk) atau 160 karakter pertama isi (halaman) |
| Canonical | URL absolut dari `SITE_URL` |
| Open Graph / Twitter | Judul, deskripsi, dan foto utama atau sampul. Fallback ke `/images/optima-social.jpg` |
| JSON-LD produk | `Product` (name, description, image, brand, category). `offers` (`Offer`, `priceCurrency: IDR`) **hanya** kalau harga diisi. Tidak ada rating atau ulasan rekaan |
| JSON-LD lain | `BreadcrumbList` di halaman produk. `WebPage` di halaman tambahan |
| Sitemap | Beranda, `/katalog`, setiap produk dan halaman terbit, dengan `lastModified = updatedAt` |
| robots.txt | Ditambah `Disallow: /admin` |
| Halaman admin | `robots: noindex, nofollow` |
| Struktur heading | Satu H1 per halaman. Isi Markdown dimulai dari H2 |
| Gambar | `alt` wajib. `next/image` `unoptimized` dengan `width`/`height` asli dan `sizes`. Foto pertama di atas lipatan diberi `priority`, sisanya lazy |

### 4.5 Markdown ke HTML

- `marked` mengubah Markdown menjadi HTML. `sanitize-html` **tidak dipakai**, karena versi terbarunya (2.18.1) butuh Node ≥ 22.12, sedangkan target proyek Node ≥ 20.9.
- Pengamanan langsung di renderer `marked`:
  - Token HTML mentah tidak pernah dirender. HTML dibuang, jadi `<script>`, `<iframe>`, dan atribut `on*` tidak bisa masuk.
  - `href` hanya boleh `http:`, `https:`, `mailto:`, `tel:`, atau path relatif. Selain itu link dirender sebagai teks.
  - `src` gambar hanya boleh `/uploads/...`. Selain itu gambar dibuang.
  - Heading `#` di isi diturunkan menjadi H2. Hanya H2–H4 yang dihasilkan.
- Link eksternal diberi `rel="noopener noreferrer"`.
- Gambar di dalam isi teks dirender sebagai `<img loading="lazy">` biasa.

## 5. Penanganan error

Pelajaran dari kejadian `SITE_URL` sebelumnya: **kesalahan data tidak boleh mematikan situs publik.**

| Kondisi | Situs publik | Admin |
|---|---|---|
| `DATA_DIR` tidak ada atau tidak bisa dibaca | Katalog kosong ("Belum ada produk"), section unggulan disembunyikan, error dicatat ke log | Banner "Folder data tidak dapat diakses: <path>" |
| `DATA_DIR` tidak bisa ditulis | — | Simpan gagal dengan pesan jelas, data lama tetap aman |
| Satu file JSON rusak | Item itu dilewati, error dicatat | Item ditandai "File rusak" di daftar |
| Slug duplikat atau dicadangkan | — | Pesan validasi di field slug |
| Upload salah tipe atau terlalu besar | — | "Format harus JPG, PNG, atau WebP, maksimal 3 MB" |
| Env admin belum diisi | Tidak berpengaruh | "Admin belum dikonfigurasi" |

Folder `products/`, `pages/`, dan `uploads/` dibuat otomatis saat penulisan pertama.

## 6. Pengujian

- **Unit test** dengan test runner bawaan Node (`node --test`) plus `tsx` (devDependency) untuk menjalankan TypeScript di Node 20:
  - Penyimpanan: tulis atomik, baca melewati file rusak, `DATA_DIR` tidak ada.
  - Validasi slug: pola, duplikat, slug dicadangkan.
  - Auth: hash dan verifikasi password, tanda tangan dan kedaluwarsa sesi, cookie dimodifikasi ditolak.
  - Upload: deteksi magic bytes, tolak tipe atau ukuran salah, pola nama file.
  - Markdown: `<script>`, `<img onerror=...>`, link `javascript:`, dan gambar dari luar `/uploads/` terbuang. Heading, list, link, tabel, dan gambar `/uploads/` tetap ada.
- **Wajib lulus:** `npm run typecheck`, `npm test`, `npm run build`.
- **Uji manual di ZIP hasil packaging** (lokal, seperti pengujian sebelumnya): login, buat kategori, buat produk dengan 2 foto, terbitkan, cek `/katalog`, halaman produk, beranda, sitemap, buat halaman dengan `showInMenu`, hapus produk (foto ikut terhapus), restart server (data tetap ada).

## 7. Kompatibilitas shared hosting

Persyaratan utama: semua fitur harus berjalan di paket shared hosting yang sekarang.

| Keterbatasan shared hosting | Bagaimana desain ini menanganinya |
|---|---|
| Tidak ada database | Data berupa file JSON di `DATA_DIR` |
| Batas RAM/CPU per akun (CloudLinux LVE, `Typically:`) | Tidak ada pemrosesan gambar di server. Editor Tiptap hanya berjalan di browser admin. Server hanya membaca ±20 file kecil per request |
| Binary native dibuild di Mac tidak jalan di Linux | Tidak ada dependensi native baru. Semua paket baru JavaScript murni |
| Versi Node di panel bisa lebih tua | Semua dependensi baru mendukung Node 20 (`marked` ≥ 20, Tiptap tanpa batasan engine). `sanitize-html` sengaja dihindari karena butuh ≥ 22.12 |
| Tidak ada cron, worker, atau proses latar | Tidak dibutuhkan. Semua terjadi saat request |
| Passenger bisa menjalankan beberapa proses dan mematikan proses yang idle | Penulisan atomik. Rate limit login di memori boleh hilang saat restart |
| Deploy = ekstrak ZIP ke Application root | Data dan foto ada di luar Application root, jadi aman dari penimpaan |
| Kuota disk dan inode | Foto sudah dikompres di browser. ±20 produk × beberapa foto = puluhan file kecil |
| LiteSpeed langsung melayani file di `public_html` | Tidak ada file baru di `public_html`. Semua rute baru dilayani Next.js |

## 8. Deploy

Versi Node yang tersedia di hosting: 20, 22, 24, 26. **Pilih Node 24** (LTS aktif). Node 20 sudah EOL (April 2026), Node 22 hanya menerima perbaikan keamanan. Kode tetap kompatibel dengan Node ≥ 20.9 (`engines` tidak diubah), tetapi build dan uji lokal sebaiknya juga memakai Node 24.

Env baru di Setup Node.js App:

```
DATA_DIR=/home/<user>/optima-data
ADMIN_PASSWORD_HASH=<hasil npm run admin:hash-password>
SESSION_SECRET=<string acak minimal 32 karakter>
```

- `.env.example` ditambah ketiga kunci ini, tanpa nilai asli.
- `README_SHARED_HOSTING.md` dan `README.txt` di ZIP diperbarui: cara mengisi env, lokasi data, dan cara backup (salin folder `DATA_DIR`).
- `scripts/package-shared-hosting.mjs` tidak perlu diubah. `data/` lokal tidak ikut masuk ZIP karena standalone tidak menyertakannya. Ini dicek ulang saat implementasi.

## 9. Dampak

**Dependensi baru** (versi dipasang persis, mengikuti gaya `package.json`): `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/markdown`, `marked`. Dev: `tsx`. Semuanya JavaScript murni, tanpa binary native.

**File baru (garis besar):**

- `src/lib/content/` — `storage.ts`, `products.ts`, `pages.ts`, `categories.ts`, `validation.ts`, `markdown.ts`
- `src/lib/auth/` — `password.ts`, `session.ts`, `rate-limit.ts`
- `src/lib/uploads.ts`
- `src/proxy.ts`
- `src/app/admin/**`
- `src/app/katalog/**`, `src/app/[slug]/page.tsx`, `src/app/uploads/[file]/route.ts`
- `src/components/footer.tsx`, `src/components/markdown-editor.tsx`, `src/components/product-card.tsx`
- `scripts/hash-password.mjs`
- `tests/**`
- `.env.example`

**File yang diubah:**

- `src/app/page.tsx`: section unggulan, footer diekstrak
- `src/components/header.tsx`: tautan dan props menu
- `src/app/sitemap.ts`, `src/app/robots.ts`
- `next.config.ts`: `experimental.serverActions.bodySizeLimit`
- `package.json`: dependensi dan script `test`, `admin:hash-password`
- `.gitignore`: `data/`
- `README_SHARED_HOSTING.md`, `README.md`

**Tidak tersentuh:** form konsultasi, isi section lain di beranda, skrip packaging.

**Risiko:** SEDANG. Header dan beranda berubah. Mitigasinya: uji manual seluruh beranda di ZIP hasil packaging sebelum deploy.
