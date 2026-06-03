# Porto

> Ini blog pribadi, bukan media. Tulisan di sini kebanyakan opini setengah matang, dan eksperimen kecil yang kebetulan tersimpan. Jika ada yang bermanfaat, alhamdulillah.

Blog pribadi minimalis berbasis [Astro](https://astro.build). Cepat, ringan, dan ditulis dalam Markdown.

**Live:** [waltahh.vercel.app](https://waltahh.vercel.app)

---

## Apa ini?

Sebuah situs blog statis-sederhana: ada daftar artikel, halaman per artikel, halaman tag, dan halaman "About". Artikel ditulis sebagai berkas Markdown, lalu otomatis tampil di situs. Tidak perlu database.

## Teknologi

| Bagian        | Yang dipakai                              |
| ------------- | ----------------------------------------- |
| Framework     | Astro 5                                   |
| Tampilan      | Tailwind CSS 3 + plugin Typography        |
| Konten        | Markdown di `src/content/blog`            |
| CMS (opsional)| [Pages CMS](https://pagescms.org)         |
| Hosting       | Vercel                                    |

## Persiapan

Yang perlu dipasang lebih dulu:

- [Node.js](https://nodejs.org) versi **18 atau lebih baru** (disarankan 20/22)
- npm (sudah ikut saat memasang Node.js)

## Menjalankan di komputer sendiri

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan file konfigurasi
cp .env.example .env

# 3. Jalankan server pengembangan
npm run dev
```

Buka [http://localhost:4321](http://localhost:4321) di browser. Setiap perubahan file langsung tampil otomatis.

Isi `SITE_URL` di file `.env` dengan alamat domain final kamu. Nilai ini dipakai untuk SEO, RSS, sitemap, dan Open Graph (preview saat dibagikan).

### Perintah lain

| Perintah          | Fungsi                                          |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Menjalankan situs untuk pengembangan (live)     |
| `npm run build`   | Membangun versi siap rilis ke folder `dist/`    |
| `npm run preview` | (Catatan: tidak didukung adapter Vercel)        |

## Menulis artikel

Setiap artikel adalah satu berkas `.md` di dalam `src/content/blog/`. Contoh isi paling atas berkas (disebut *frontmatter*):

```markdown
---
slug: judul-tulisan-saya
title: "Judul Tulisan Saya"
description: "Ringkasan singkat untuk daftar artikel dan SEO"
pubDatetime: 2026-05-29T08:00:00+07:00
tags:
  - personal
draft: false
featured: false
---

Tulis isi artikel di sini, dalam format Markdown biasa.
```

Penjelasan tiap kolom:

| Kolom          | Wajib? | Keterangan                                                    |
| -------------- | ------ | ------------------------------------------------------------ |
| `slug`         | —      | Bagian alamat URL & nama file (mis. `judul-tulisan-saya`). Jangan diubah setelah terbit. |
| `title`        | ✅     | Judul artikel                                                |
| `description`  | —      | Ringkasan untuk daftar artikel & SEO                         |
| `pubDatetime`  | ✅     | Tanggal terbit                                               |
| `modDatetime`  | —      | Tanggal terakhir diubah                                      |
| `tags`         | —      | Daftar tag (boleh lebih dari satu)                           |
| `draft`        | —      | Beri `true` untuk menyembunyikan dari situs                  |
| `featured`     | —      | Beri `true` untuk menaikkan prioritas di sitemap             |
| `coverImage`   | —      | Gambar sampul, mis. `/images/foto.jpg`                       |

Artikel dengan `draft: true` tidak akan muncul di situs.

## Gambar

Gambar diletakkan di `public/images/`, lalu dirujuk dengan alamat `/images/nama-berkas.jpg`. Format yang didukung: jpg, jpeg, png, webp, gif.

## Menulis lewat CMS (opsional)

Kalau tidak mau mengutak-atik file langsung, ada antarmuka editor lewat [Pages CMS](https://pagescms.org). Buka `/admin` di situs (akan diarahkan ke project Pages CMS), lalu tulis artikel dan unggah gambar dari sana. Hasilnya tetap tersimpan sebagai Markdown di `src/content/blog`.

## Struktur folder (ringkas)

```
src/
├─ content/blog/   ← artikel (Markdown)
├─ pages/          ← halaman & rute (index, about, blog, tags, dll.)
├─ components/     ← potongan tampilan yang dipakai ulang
├─ layouts/        ← kerangka halaman
└─ data/           ← data penulis & konfigurasi situs
public/             ← berkas statis (gambar, favicon)
.pages.yml          ← konfigurasi Pages CMS
```

## Deploy

Situs ini di-deploy ke [Vercel](https://vercel.com). Setiap perubahan yang masuk ke branch utama akan otomatis dibangun dan dirilis. Pastikan variabel `SITE_URL` sudah diatur di pengaturan project Vercel.

## Lisensi

[MIT](LICENSE)
