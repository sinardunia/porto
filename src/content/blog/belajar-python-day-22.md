---
title: "belajar python day 22: Read From Database"
slug: belajar-python-day-22
description: Hari ini mencoba mengambil data dari database, dan menampilkannya
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-28
modDatetime: 2026-07-28
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Menampilkan data dari database

Hari ini terasa sepele, alias "gitu doang". Yaitu: menampilkan data dari database.

Setelah kemarin kita mencoba mengirim data ke database, sekarang menampilkannya.

Kita menggunakan query:

```
SELECT * FROM posts
```

Artinya, pilih semua -> * data dari tabel bernama posts.

Lalu kita tampilkan, di kode-nya begini:

```
  conn = sqlite3.connect("blog.db")
    cursor = conn.cursor()
    cursor.execute(
          "SELECT * FROM posts",
      )
    rows = cursor.fetchall()
    conn.close() 
```

- fetchall() untuk mengambil semua data
- fetchone() untuk mengambil satu

Begitulah, gitu doang...

Eh, tapi hari ini ada sesuatu yang rada asing, yaitu tuple. ini belum dijelaskan sebelumnya...

### Tuple

> Apa itu tuple? 

Ada tiga tipe data "pilar" di python, yaitu:

- List []
- Dictionary{}
- Lalu, Tuple()

Nah, Tuple ini mirip seperti list. Cuman, data-nya gabisa diubah-ubah. 

> Apa fungsinya?

Biasanya, dipake saat mengambil data dari database, format tuple ini bagus karena kita gabisa apa-apain data-nya (immutable).

Sedangkan list, bisa kita ubah-ubah.

Dicitonary, you know lah...