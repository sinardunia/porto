---
title: "belajar python day 18: Learning FastApi"
slug: belajar-python-day-18
description: Hari ini kita memperdalam dulu tentang FastApi kemaren, karena
  belum beneran paham:)
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-24
modDatetime: 2026-07-24
draft: false
featured: false
tags:
  - Learning
  - Python
---
### FastApi

Sebuah framework membuat API dalam bahasa pemrograman python. Kemarin, kita sudah pakai. Tapi, saya ga bener-bener paham wkwk

Jadi, sebelum masuk ke database kita sedikit lebih mendalami tentang fungsi fast api ini.

> Apa itu rest dalam rest api?

Rest api mengikuti prinsip HTTP.

contoh benar:

```
http://127.0.0.1:8000/posts/1 
```

contoh keliru:

```
http://127.0.0.1:8000/getposts/1
```

Karena aksi sudah dijelaskan oleh http method GET. url cukup berisi ***posts/*** tidak perlu menggunakan ***getposts/***

> Kenapa?

Karena sudah jelas kita menggunakan tipe get, untuk mengambil data. sehingga tidak perlu repot-repot menulis begitu di url-nya.



### Perbedaan URL dan HTTPmethod

url adalah link-nya:

```
http://127.0.0.1:8000/
```

sedangkan HTTPMethod adalah metode-nya, yang kita bahas kemaren ada get, post, put, dan delete.

### Apa fungsi FastApi?

Sudah dijelaskan kemaren, yaitu framework yang memudahkan membuat api, dalam bahasa pemrograman python. Hari ini kita hanya memperdalamnya saja...

