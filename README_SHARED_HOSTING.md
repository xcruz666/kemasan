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

Gunakan Node.js **20.9 atau lebih baru**, pilih `server.js` sebagai startup file, lalu mulai atau restart aplikasi dari panel hosting. Next.js membaca nomor port dari variabel `PORT` yang disediakan hosting.

Di pengaturan environment aplikasi, tambahkan `SITE_URL` dengan URL situs lengkap, tanpa path atau garis miring di belakang, misalnya `https://www.example.com`. Nilai ini digunakan untuk canonical, sitemap, robots, metadata berbagi, dan structured data. Salin nama domain yang benar setelah domain diarahkan ke hosting.

Di cPanel, buat aplikasi melalui **Setup Node.js App**, pilih versi Node.js yang didukung, atur **Application root** ke folder hasil ekstrak, dan isi **Application startup file** dengan `server.js`.

Beberapa provider shared hosting tidak mendukung aplikasi Node.js atau memerlukan konfigurasi Passenger tambahan. Pastikan paket layanan mendukung Node.js sebelum upload.

Konfigurasi standalone berada di `next.config.ts`; skrip pembuat ZIP ada di `scripts/package-shared-hosting.mjs`.
