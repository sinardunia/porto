---
title: "belajar python day 23: CRUD"
slug: belajar-python-day-23
description: Hari ini kita melengkapi materi kemarin dari CRUD
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-29
modDatetime: 2026-07-29
draft: false
featured: false
tags:
  - Learning
  - Python
---
Hari ini lanjutin yang sebelumnya, karena kemarin lusa kita belajar tentang Create, dan kemarin Read.

Btw, CRUD artinya:

- Create
- Read
- Update
- Delete

Nah, hari ini kita selesain Update dan Delete.

### Update

Di sql-nya query update adalah:

```
UPDATE posts SET isi = ? WHERE id = ?
```

Artinya, kita update dari tabel posts lalu kita set isi-nya apa dengan id apa.

> Fun Fact: Query sql tidak mesti capslok "`UPDATE` "bisa juga `"update"`, cuman supaya mudah dibedakan ini query sql atau bukan, best practice-nya menggunakan CAPSLOK

Di dalam case buat post, sebelum update kita mesti ambil data-nya semua menggunakan SELECT.

contoh kode :

```
cursor.execute(
            "SELECT * FROM posts WHERE id = ?",
      (post_id,)
        )

#lalu:


    if data.judul is not None: 
     cursor.execute("UPDATE posts SET judul = ? WHERE id = ?", (data.judul, post_id))
    if data.isi is not None:
     cursor.execute("UPDATE posts SET isi = ? WHERE id = ?",(data.isi, post_id))
    conn.commit()


```

Di kode ini kita mengambil semua data, lalu kita update salah satu mau judul maupun isi.

Supaya, user bisa update salah satu.

### Delete

Untuk delete kurang lebih cuma beda query aja:

`DELETE FROM posts WHERE id = ?`

Artinya, kita hapus postingan dari tabel posts, dari id apa? nah kita tentuin di kode:

```
#Select dulu:
cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))

#lalu:
 cursor.execute(
                   "DELETE FROM posts WHERE id = ?",
             (post_id,)
```

