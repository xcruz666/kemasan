# Desain: Pengaturan Menu Header dan WhatsApp

Tanggal: 2026-10-29
Status: disetujui pengguna (2026-10-29)
Melanjutkan: `2026-10-29-admin-katalog-halaman-design.md`

## Tujuan

- Admin dapat mengatur menu header situs tanpa developer.
- Admin dapat mengganti nomor WhatsApp dan pesan pembuka untuk semua tombol WhatsApp.

## Keputusan pengguna

| Pertanyaan | Jawaban |
|---|---|
| Model menu | 5 link bawaan bisa disembunyikan, tidak bisa dihapus. Link lain bisa ditambah dan dihapus |
| WhatsApp | Satu nomor untuk semua tombol, ditambah pesan pembuka yang bisa diedit |
| Footer | Tetap seperti sekarang, tidak ikut diatur |

## Halaman admin `/admin/pengaturan`

Dua kartu. Masing-masing punya tombol Simpan sendiri.

### Menu header

| Jenis item | Sembunyikan | Hapus | Ubah |
|---|---|---|---|
| Bawaan: Produk, Katalog, Keunggulan, Cara pesan, FAQ | ya | tidak | urutan |
| Halaman (dipilih dari daftar halaman) | ya | ya | label opsional (default: judul halaman), urutan |
| Link bebas (`/…` atau `http(s)://…`) | ya | ya | label, URL, urutan |

- Urutan diatur dengan tombol ↑ ↓. Maksimal 12 item. Label maksimal 30 karakter.
- Item halaman menyimpan **ID halaman**, jadi mengganti slug tidak merusak menu. Halaman draf atau yang sudah dihapus tidak tampil.
- Link `https://` dibuka di tab baru. URL `//host`, `javascript:`, dan protokol lain ditolak.
- Centang "Tampil di menu header" dan field "Urutan menu" di form Halaman dihapus, supaya menu hanya diatur di satu tempat.
- **Migrasi:** selama `settings.json` belum punya menu, menu awal = 5 link bawaan + halaman yang dulu dicentang `showInMenu`. Menu ini tersimpan saat admin pertama kali menyimpan pengaturan apa pun.

### WhatsApp

- Nomor boleh diketik `0812-2220-195`, `+62 812 2220 195`, atau `628122220195`. Disimpan sebagai `628122220195` dan tampil sebagai `0812-2220-195`. Formatnya harus `62` + 8–13 digit.
- Pesan pembuka (maksimal 500 karakter) dipakai di tombol WhatsApp umum: header, menu mobile, tombol melayang, tombol hero, link "Tanya langsung", dan nomor di section kontak.
- Pesan yang spesifik tetap dibuat di kode, tetapi memakai nomor dari pengaturan: produk di katalog, section produk, kartu aplikasi, dan form konsultasi.
- `telephone` di JSON-LD Organization ikut memakai nomor dari pengaturan.

## Penyimpanan

`DATA_DIR/settings.json`:

```json
{
  "whatsapp": { "phone": "628122220195", "defaultMessage": "…" },
  "headerMenu": [
    { "id": "produk", "kind": "default", "visible": true },
    { "id": "page-<uuid>", "kind": "page", "pageId": "<uuid>", "label": "", "visible": true },
    { "id": "<uuid>", "kind": "link", "label": "Blog", "href": "https://…", "visible": true }
  ]
}
```

- File belum ada → nilai bawaan (nomor `0812-2220-195`, pesan pembuka yang lama, 5 link bawaan).
- File rusak → situs publik memakai nilai bawaan dan mencatat error. Admin tetap bisa menyimpan dan menimpa file rusak itu.
- Item menu yang tidak valid dibuang saat dibaca. Item bawaan yang hilang ditambahkan kembali di akhir.
- Penulisan atomik, sama seperti data lain.

## Kode

- `src/lib/content/settings-shared.ts` (aman dipakai di browser): tipe, nilai bawaan, normalisasi nomor, validasi menu dan WhatsApp.
- `src/lib/content/settings.ts` (server): baca dan simpan, `getSiteSettings()` (tidak pernah melempar error, dibaca sekali per request), `resolveHeaderMenu()`, `toWhatsappContact()`.
- `src/lib/brand.ts`: hanya nama brand dan `whatsappUrl(phone, message)`. Nomor bawaan pindah ke `settings-shared.ts`.
- Publik: layout `(site)`, header, beranda, halaman produk, form konsultasi, dan data terstruktur menerima nomor dan menu dari pengaturan.
- Admin: `/admin/pengaturan`, aksi `settings.ts`, editor menu, form WhatsApp, menu sidebar, form dan daftar Halaman.

## Dampak dan risiko

- Tidak ada perubahan pada footer, katalog, produk, atau format data produk dan halaman.
- **Risiko: SEDANG.** Semua tombol WhatsApp tersentuh. Verifikasinya: setelah build, cek setiap link `wa.me` di ZIP hasil packaging memakai nomor dari pengaturan.
