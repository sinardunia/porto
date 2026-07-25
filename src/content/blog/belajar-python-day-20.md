---
title: "belajar python day 20: Put, Patch, Query parameters"
slug: belajar-python-day-20
description: Hari ini kita belum masuk dulu ke database, tapi bedanya put dan
  patch sama query parameter
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-26
modDatetime: 2026-07-26
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Put & Patch

Hari ini kita diberi materi tentang Put dan Patch.

> Apa bedanya?

Put, seperti yang kita bahas kemaren, itu adalah salah satu dari method HTTP yang berfungsi untuk edit, kan? 

Nah, Patch di sini juga sama untuk mengedit. Cuman, bedanya adalah kita bisa mengedit salah satu, bukan semuanya seperti Put.

Contoh:

```
posts = [
    {"id": 1, "judul": "Belajar Python", "isi": "Hari ini belajar HTTP"},
    {"id": 2, "judul": "Belajar API", "isi": "Hari ini belajar FastAPI"},
    {"id": 3, "judul": "Belajar JSON", "isi": "Format universal"},
]
```

Kode di atas kita mempunyai sebuah data bernama posts. Jika kita ingin mengubah judulnya doang, menggunakan Put, itu kita tidak bisa. Karena, syarat put itu mengubah semua data, bukan salah satu.

Padahal, user pengen-nya ngubah judul doang, gmn dong?

> Di situlah kita memerlukan Patch

Patch ini tergolong baru sebagai method HTTP, karena muncul di tahun 2010.

Sebenarnya, kita tidak perlu menggunakan Put lagi, karena Patch lebih "kepake" di beberapa situasi, sih...

### Patch perlu kondisi

Patch, memerlukan kondisi opsional. Contohnya di python kita menggunakan None:

```
def ambil_semua_post(search: str | None = None):
```

Contoh fungsi di atas, kita membuat parameter search, tapi diisi None = None. Yang artinya, kita membuat kalo search itu gadiisi ama user, kita buat itu opsional.

### Query Parameters

Ada yang namanya Path Parameter dan Query Parameter.

> Apa bedanya?

Bedanya adalah, Path parameter bagian dari url yang spesifik. contoh:

- `/Posts/python`

Sedangkan Query Parameter adalah tambahan setelah ? di url nya, bisa diinput user. contoh:

- `/posts?search=Python`

Biasanya Query Parameter ini digunakan di search, karena user yang menentukan. Dan kalo Query Parameter ga dikirim, itu gapapa. karena opsional....

