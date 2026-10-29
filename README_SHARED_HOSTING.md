# Deploy ke shared hosting

## Membuat ZIP siap upload

Jalankan dari folder proyek:

```sh
npm run package:shared-hosting
```

Perintah ini membuat build Next.js **standalone**, lalu menghasilkan arsip berikut:

```text
dist/optima-kemasan-prima-shared-hosting.zip
```

Ekstrak ZIP ke folder aplikasi di hosting. `server.js` ada langsung di root arsip, bersama `package.json`, `.next/`, dan `public/`.

## Menjalankan aplikasi

Gunakan Node.js **24** (minimal 20.9), pilih `server.js` sebagai startup file, lalu mulai atau restart aplikasi dari panel hosting. Next.js membaca nomor port dari variabel `PORT` yang disediakan hosting. Jangan klik **Run NPM Install**; dependensi sudah ada di dalam ZIP.

Di pengaturan environment aplikasi, tambahkan `SITE_URL` dengan URL situs lengkap, tanpa path atau garis miring di belakang, misalnya `https://www.example.com`. Nilai ini digunakan untuk canonical, sitemap, robots, metadata berbagi, dan structured data. Salin nama domain yang benar setelah domain diarahkan ke hosting.

## Admin panel (`/admin`)

Admin menyimpan produk, kategori, halaman, dan foto sebagai file di folder `DATA_DIR`, tanpa database. Isi tiga environment variable berikut di **Setup Node.js App**, lalu restart:

| Variabel | Isi |
|---|---|
| `DATA_DIR` | Folder di **luar** Application root, misalnya `/home/<user>/optima-data`. Folder dibuat otomatis. |
| `ADMIN_PASSWORD_HASH` | Jalankan `npm run admin:hash-password` di komputer developer, lalu salin hasilnya. Password asli tidak disimpan di hosting. |
| `SESSION_SECRET` | String acak minimal 32 karakter, misalnya hasil `openssl rand -base64 48`. Menggantinya membuat admin harus login ulang. |

- Jangan arahkan `DATA_DIR` ke dalam Application root. Deploy ZIP berikutnya akan menimpa isinya.
- Backup cukup dengan menyalin folder `DATA_DIR`, misalnya lewat File Manager → Compress.
- Kalau `DATA_DIR` tidak dapat ditulis, halaman `/admin` menampilkan peringatan. Situs publik tetap berjalan.
- Kalau ketiga variabel belum diisi, `/admin/login` menampilkan "Admin belum dikonfigurasi". Situs publik tidak terpengaruh.
- Kalau menyimpan di admin gagal dengan error `Invalid Server Actions request` di `stderr.log`, berarti host yang diteruskan LiteSpeed berbeda dengan domain di browser. Laporkan ke developer, karena perlu diatur `serverActions.allowedOrigins` saat build.

## cPanel

Di cPanel, buat aplikasi melalui **Setup Node.js App**, pilih Node.js 24, atur **Application root** ke folder hasil ekstrak, dan isi **Application startup file** dengan `server.js`.

Isi ZIP: `server.js` (launcher), `package.json` tanpa dependency, `README.txt`, dan folder `app/` berisi build standalone beserta `node_modules`-nya. CloudLinux menolak menyimpan pengaturan aplikasi (versi Node, environment variable) jika root aplikasi berisi folder `node_modules` asli, karena ia memasang symlink `node_modules` sendiri. Karena itu build diletakkan di `app/`.

Saat deploy ulang: Stop aplikasi, kosongkan folder aplikasi (termasuk `node_modules` dan `.next` dari paket lama), ekstrak ZIP, lalu Start. `DATA_DIR` harus path absolut, karena folder kerja aplikasi adalah `app/`. File `.env` lokal tidak ikut ke dalam ZIP; isi semua variabel di panel.

Beberapa provider shared hosting tidak mendukung aplikasi Node.js atau memerlukan konfigurasi Passenger tambahan. Pastikan paket layanan mendukung Node.js sebelum upload.

Konfigurasi standalone berada di `next.config.ts`; skrip pembuat ZIP ada di `scripts/package-shared-hosting.mjs`.
