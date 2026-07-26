---
title: "belajar python day 21: SQLite & Database"
slug: belajar-python-day-21
description: Hari ini kita belajar tentang database menggunakan SQLite
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-27
modDatetime: 2026-07-27
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Database

Apa itu database? apa fungsinya

Database adalah tempat untuk menyimpan data. Fungsinya adalah, menyimpan data.

### SQLite

SQLite adalah salah satu database, cuman ini ringan. selain itu, SQLite sudah disediakan oleh  python. Kita tinggal pake aja, contoh:

```
import sqlite3

conn = sqlite3.connect("nama-filenya.db")
```

SQLite tersimpan dalam bentuk tabel, contohnya kita dulu kita punya posts berisi id, judul dan isi.

```
posts = [
    {"id": 1, "judul": "Belajar Python", "isi": "Hari ini belajar HTTP"},
    {"id": 2, "judul": "Belajar API", "isi": "Hari ini belajar FastAPI"},
    {"id": 3, "judul": "Belajar JSON", "isi": "Format universal"},
]
```

Nah, sekarang tersimpan bukan dalam bentuk list begini, tapi:


| id | judul | isi |
| --- | ----------------------- | -------------------------------- |
| 1 | ```Belajar Python"``` | ```Hari ini belajar HTTP``` |
| 2 | ```Belajar API"``` | ```Hari ini belajar FastAPI``` |


Secara otomatis, jika di sintaks-nya kita deklarasikan ID sebagai *Primary* key dan *autoincrement*

- Primary key = wajib unik, artinya gaboleh sama
- Autoincrement = angka-nya naik satu, jadi gabakal sama

```
@app.post("/posts", status_code=201)
def buat_post(post: Post):
    conn = sqlite3.connect("blog.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO posts (judul, isi) VALUES (?, ?)",
        (post.judul, post.isi)
    )
    conn.commit()
    id_baru = cursor.lastrowid
    conn.close()
    return {"id": id_baru, "judul": post.judul, "isi": post.isi}

```

Sekarang, data akan tetap ada meski server di restart