# Optima Kemasan Prima

Website penjualan kantong vacuum premium. Dibangun dengan Next.js 16 (App Router), React 19, dan TypeScript. Pemesanan diteruskan ke WhatsApp **0812-2220-195** (`628122220195`).

Tidak ada database. Produk, halaman, pengaturan, dan foto yang diisi lewat `/admin` disimpan sebagai file di folder `DATA_DIR`.

Panduan ini berurutan dari nol:

1. [Persiapan Node.js di komputer](#1-persiapan-nodejs-di-komputer)
2. [Menjalankan di komputer lokal](#2-menjalankan-di-komputer-lokal)
3. [Membuat ZIP untuk shared hosting](#3-membuat-zip-untuk-shared-hosting)
4. [Instalasi pertama di cPanel](#4-instalasi-pertama-di-cpanel)
5. [Update situs (deploy ulang)](#5-update-situs-deploy-ulang)
6. [Backup data](#6-backup-data)
7. [Masalah umum](#7-masalah-umum)
8. [Referensi](#8-referensi)

---

## 1. Persiapan Node.js di komputer

Proyek ini memakai **Node.js 24**. Versinya tercatat di `.nvmrc`. Versi minimal yang masih jalan adalah 20.9, tetapi pakai 24 supaya sama dengan hosting.

### macOS dan Linux (pakai nvm)

1. Pasang nvm dengan mengikuti petunjuk di https://github.com/nvm-sh/nvm#installing-and-updating.
2. Tutup lalu buka lagi Terminal.
3. Dari folder proyek, pasang dan aktifkan versi dari `.nvmrc`:

   ```sh
   nvm install
   nvm use
   ```

### Windows

Pasang Node.js 24 LTS dari https://nodejs.org. Kalau perlu beberapa versi Node, pakai nvm-windows: https://github.com/coreybutler/nvm-windows.

### Cek hasilnya

```sh
node -v   # harus v24.x
npm -v
```

Git juga diperlukan untuk mengambil kode: https://git-scm.com.

---

## 2. Menjalankan di komputer lokal

### 2.1 Ambil kode dan pasang dependensi

```sh
git clone https://github.com/xcruz666/kemasan.git
cd kemasan
nvm use        # macOS/Linux
npm ci
```

`npm ci` memasang versi persis dari `package-lock.json`.

### 2.2 Buat file environment lokal

Salin template, lalu isi:

```sh
cp .env.example .env.local
```

| Variabel | Isi untuk lokal |
|---|---|
| `SITE_URL` | `http://localhost:3000` |
| `DATA_DIR` | Kosongkan. Data disimpan di `./data` (diabaikan git). |
| `ADMIN_PASSWORD_HASH` | Hasil perintah di bawah. |
| `SESSION_SECRET` | Hasil perintah di bawah. |

Buat hash password admin. Perintah ini menanyakan password (minimal 12 karakter) dan mencetak satu baris `ADMIN_PASSWORD_HASH=...`:

```sh
npm run admin:hash-password
```

Buat `SESSION_SECRET` (string acak):

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

> `.env`, `.env.local`, dan `.env.example` yang sudah diisi berisi rahasia. **Jangan di-commit.** `.env*` sudah diabaikan git, kecuali `.env.example` yang harus tetap berisi template kosong.

### 2.3 Jalankan

```sh
npm run dev
```

- Situs: http://localhost:3000
- Admin: http://localhost:3000/admin (login dengan password yang tadi di-hash)
- Dari HP di Wi-Fi yang sama: `http://<IP-komputer>:3000`

### 2.4 Pemeriksaan sebelum deploy

```sh
npm run typecheck
npm run build
```

Keduanya harus selesai tanpa error.

---

## 3. Membuat ZIP untuk shared hosting

```sh
npm run package:shared-hosting
```

Perintah ini menjalankan `npm run build` (Next.js **standalone**), lalu membuat:

```text
dist/optima-kemasan-prima-shared-hosting.zip
```

Isi ZIP:

```text
server.js      launcher, hanya memanggil app/server.js
package.json   tanpa dependency
README.txt     ringkasan langkah instalasi
app/           build standalone, termasuk node_modules-nya sendiri
```

Kenapa build ada di `app/` dan bukan di root: CloudLinux (Setup Node.js App di cPanel) memasang symlink `node_modules` sendiri di root aplikasi. Kalau root berisi folder `node_modules` asli, panel **menolak menyimpan** versi Node dan environment variable.

File `.env` lokal **tidak ikut** ke ZIP; script membatalkan proses kalau ada file `.env` yang ikut. Semua variabel diisi di panel hosting.

### Cek ZIP di komputer sendiri (opsional)

Build standalone tidak membaca `.env`, jadi variabel diberikan langsung di perintah:

```sh
cd dist/shared-hosting
PORT=3001 SITE_URL=http://localhost:3001 DATA_DIR="$PWD/../../data" node server.js
```

Buka http://localhost:3001. Untuk mencoba login admin, tambahkan juga `ADMIN_PASSWORD_HASH=...` dan `SESSION_SECRET=...` di depan `node server.js`.

---

## 4. Instalasi pertama di cPanel

Langkah ini untuk cPanel dengan **Setup Node.js App** (CloudLinux), seperti Jagoan Hosting. `Verify this:` nama menu bisa sedikit berbeda antarprovider. Pastikan paket hosting mendukung aplikasi Node.js.

Contoh di bawah memakai user cPanel `<user>`, folder aplikasi `app-optima-kemasan-prima`, dan folder data `optima-data`. Ganti sesuai akun Anda.

### 4.1 Domain dan HTTPS

1. Arahkan domain ke hosting.
2. Aktifkan SSL: cPanel → **SSL/TLS Status** → **Run AutoSSL**.
3. Paksa HTTPS: cPanel → **Domains** → nyalakan **Force HTTPS Redirect** untuk domain tersebut.

### 4.2 Buat folder data

Di **File Manager**, buat folder di **luar** folder aplikasi dan di luar `public_html`, misalnya:

```text
/home/<user>/optima-data
```

Folder ini menyimpan produk, halaman, pengaturan, dan foto dari admin. Deploy ulang tidak menyentuhnya.

### 4.3 Buat aplikasi Node.js

cPanel → **Setup Node.js App** → **Create Application**:

| Kolom | Isi |
|---|---|
| Node.js version | **24** |
| Application mode | Production |
| Application root | `app-optima-kemasan-prima` (jangan di dalam `public_html`) |
| Application URL | domain Anda, misalnya `optimakemasanprima.com` |
| Application startup file | `server.js` |

Klik **Create**, lalu **Stop App**.

### 4.4 Upload dan ekstrak ZIP

1. **File Manager** → buka `/home/<user>/app-optima-kemasan-prima`.
2. Hapus semua isi bawaan yang dibuat panel.
3. **Upload** `optima-kemasan-prima-shared-hosting.zip`.
4. Klik kanan ZIP → **Extract** ke folder ini.
5. Hapus file ZIP-nya.

Isi folder harus persis:

```text
app/  package.json  README.txt  server.js
```

Tidak boleh ada folder `node_modules` atau `.next` di sini.

### 4.5 Isi environment variable

Kembali ke **Setup Node.js App** → klik ikon edit aplikasi → bagian **Environment variables** → **Add Variable**:

| Variabel | Isi |
|---|---|
| `SITE_URL` | `https://optimakemasanprima.com` (pakai `https`, tanpa garis miring di belakang) |
| `DATA_DIR` | `/home/<user>/optima-data` (**path absolut**, diawali `/home/`) |
| `ADMIN_PASSWORD_HASH` | Hasil `npm run admin:hash-password` di komputer Anda |
| `SESSION_SECRET` | String acak dari perintah `node -e ...` di bagian 2.2 |

Pakai password dan secret yang **berbeda** dari yang dipakai di lokal. Password asli tidak pernah disimpan di hosting, hanya hash-nya.

Klik **SAVE**. Pastikan tidak muncul pesan error; lihat [Masalah umum](#7-masalah-umum) kalau gagal.

### 4.6 Jalankan

1. Klik **Start App** (atau **Restart**).
2. Jangan klik **Run NPM Install**. Dependensi sudah ada di `app/`.
3. Cek versi Node yang benar-benar dipakai: buka `.htaccess` di folder domain. Baris `PassengerNodejs` harus berisi `/24/bin/node`. Kalau masih `/20/`, berarti pengaturan belum tersimpan.

### 4.7 Cek hasil

- `https://<domain>/` tampil normal.
- `http://<domain>/` dialihkan ke `https://`.
- `https://<domain>/admin/login` menampilkan form login, bukan "Admin belum dikonfigurasi".
- Login, lalu ubah sesuatu kecil di `/admin` dan simpan. Perubahan tampil di situs.
- `https://<domain>/sitemap.xml` berisi URL `https://`.

### 4.8 Daftarkan ke Google (sekali saja)

1. Buka https://search.google.com/search-console, tambahkan properti **Domain**, lalu verifikasi lewat record DNS TXT (cPanel → **Zone Editor**).
2. Menu **Sitemaps**: kirim `https://<domain>/sitemap.xml`.
3. **Inspeksi URL** → **Minta pengindeksan** untuk beranda dan `/katalog`.

---

## 5. Update situs (deploy ulang)

Di komputer:

```sh
git pull
nvm use
npm ci
npm run package:shared-hosting
```

Di cPanel:

1. **Setup Node.js App** → **Stop App**.
2. **File Manager** → kosongkan folder aplikasi (`app-optima-kemasan-prima`). **Jangan** sentuh folder data.
3. Upload dan ekstrak ZIP baru, lalu hapus file ZIP-nya.
4. **Start App**.

Environment variable tersimpan di panel, jadi tidak perlu diisi ulang. Konten dari admin tetap ada karena tersimpan di `DATA_DIR`.

---

## 6. Backup data

Cukup salin folder `DATA_DIR`. Di cPanel: **File Manager** → klik kanan `optima-data` → **Compress** → unduh ZIP-nya.

Untuk memindahkan data ke hosting lain, ekstrak backup itu ke folder baru, lalu arahkan `DATA_DIR` ke sana.

---

## 7. Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Saat SAVE di Setup Node.js App muncul: *"CloudLinux NodeJS Selector demands to store node modules … should not contain folder/file with such name [node_modules]"* | Ada folder `node_modules` asli di root aplikasi, biasanya sisa paket lama | Stop App, hapus `node_modules` (dan `.next`) dari root aplikasi, lalu SAVE lagi |
| `/admin` menampilkan "Folder data tidak dapat diakses: …" | `DATA_DIR` bukan path absolut, atau pengaturan belum tersimpan karena masalah di atas | Isi `DATA_DIR` dengan `/home/<user>/...`, SAVE tanpa error, lalu Restart |
| Versi Node tidak berubah setelah dipilih | Pengaturan gagal tersimpan | Cek `.htaccess` (bagian 4.6). Selesaikan masalah `node_modules` dulu |
| `/admin/login` menampilkan "Admin belum dikonfigurasi" | `ADMIN_PASSWORD_HASH` atau `SESSION_SECRET` kosong | Isi di panel, SAVE, Restart |
| Simpan di admin gagal dengan `Invalid Server Actions request` di `stderr.log` | Host yang diteruskan LiteSpeed berbeda dengan domain di browser | Perlu `serverActions.allowedOrigins` di `next.config.ts`, lalu build ulang |
| Situs error 503 atau tidak mau start | Lihat log | Buka `stderr.log` di folder aplikasi. Cek versi Node dan startup file `server.js` |
| Google menampilkan `http://` | Google masih menyimpan indeks lama | Ikuti bagian 4.8; perubahan butuh beberapa hari |
| Preview link di WhatsApp/Telegram masih versi lama | Cache aplikasi chat | Tunggu, atau kirim link ke @WebpageBot di Telegram |

---

## 8. Referensi

### Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan di port 3000 |
| `npm run typecheck` | Cek TypeScript |
| `npm run build` | Build produksi |
| `npm run package:shared-hosting` | Build + ZIP untuk cPanel (`dist/optima-kemasan-prima-shared-hosting.zip`) |
| `npm run zip:source` | ZIP kode sumber (`dist/optima-kemasan-prima-source.zip`) |
| `npm run admin:hash-password` | Buat `ADMIN_PASSWORD_HASH` |

`npm run zip:source` menghasilkan folder `optima-kemasan-prima/` di dalam ZIP. Yang tidak ikut: `node_modules`, `.next`, `.git`, `dist`, `optima-data`, `data`, dan semua file `.env`. `.env.example` diambil dari versi commit, jadi isian lokal tidak ikut.

### Halaman admin

- `/admin`: login satu password. Kelola produk, kategori, dan halaman. Editor punya mode visual dan Markdown.
- `/admin/beranda`: semua isi halaman utama. Bagian selain hero bisa disembunyikan. Desain dan jumlah kartu tetap; hanya FAQ yang bisa ditambah atau dihapus.
- `/admin/situs`: nama situs, logo (teks atau gambar upload), bar pengumuman, footer, favicon, gambar preview link, SEO Beranda dan Katalog, serta domain canonical.
- `/admin/pengaturan`: menu header (link bawaan bisa disembunyikan, link lain bisa ditambah) serta nomor WhatsApp dan pesan pembuka untuk semua tombol WhatsApp.

### Halaman publik

- `/katalog` dan `/katalog/<slug>`: produk berstatus Terbit. Produk Unggulan juga tampil di beranda.
- `/<slug>`: halaman tambahan, misalnya Tentang Kami. Tambahkan ke menu header lewat `/admin/pengaturan`.

### SEO

- Canonical, sitemap, robots, Open Graph, dan structured data memakai `SITE_URL`.
- Domain canonical di `/admin/situs` menggantikan `SITE_URL` untuk canonical, sitemap, dan preview link.
- Produk dan halaman punya kolom Canonical URL opsional. Kosong berarti URL halaman itu sendiri.
- Judul dan deskripsi preview (Open Graph) bisa dibedakan dari judul halaman.
- Tanpa `SITE_URL` dan tanpa domain canonical, tag canonical dan URL absolut tidak dibuat.

### Letak kode

- Teks bawaan beranda: `src/lib/content/landing-shared.ts`. Tampilannya: `src/app/(site)/page.tsx`.
- Header, footer, dan bar pengumuman: `src/app/(site)/layout.tsx`.
- Token warna, tata letak, dan tampilan mobile: `src/app/globals.css`.
- Pembentuk tautan WhatsApp: `src/lib/brand.ts`. Nilai bawaan pengaturan: `src/lib/content/settings-shared.ts`.
- Formulir penawaran: `src/components/quote-form.tsx`. Formulir hanya menyusun tautan WhatsApp; data tidak disimpan atau dikirim ke server situs.
- Konfigurasi standalone: `next.config.ts`. Script ZIP: `scripts/package-shared-hosting.mjs` dan `scripts/zip-source.mjs`.
- Desain fitur admin: `docs/superpowers/specs/`.

### Konten dan aset

- Nama Optima Kemasan Prima sudah dikonfirmasi pemilik. Spesifikasi bersumber dari materi promosi pemilik. Harga, minimum pemesanan, kecocokan mesin, dan pengiriman dikonfirmasi lewat konsultasi. Tidak ada harga, testimoni, atau nomor sertifikasi rekaan.
- Foto bawaan adalah ilustrasi buatan AI yang dikonversi ke WebP, bukan dokumentasi produk asli. Prompt dan lokasi aset ada di `docs/image-prompts.md`.
- Font Geist disimpan lokal, jadi build tidak bergantung pada layanan font luar. Ikon memakai Lucide.
