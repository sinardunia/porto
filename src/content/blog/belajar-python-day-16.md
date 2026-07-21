---
title: "belajar python day 16: Error handling"
slug: belajar-python-day-16
description: Hari ini kita belajar tentang error handling, menangani error.
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-22
modDatetime: 2026-07-22
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Error handling

> apa itu error handling

Ketika kita menjalankan kode, tentunya tidak luput dari kesalahan dan error. jika eror dari kode, itu disebut **bug**.

Bug, itu tidak kita inginkan, kan? sedangkan jika error dari faktor external seperti dari response API atau dari server, itu di luar kendali kita. 

Bayangkan kamu sebagai user, ketika membuka halaman blog ini, lalu data-nya tiba-tiba ga muncul tanpa penjelasan, tentu kalian akan bingung. 

Tapi, jika si pembuat website menangkap erornya, dan menampilkan "404 tulisannya ga ditemukan". Kalian sebagai user, akan jelas menerima. oh, inimah emang belom ada tulisannya, dan sebagainya.



---

---

---

---

### Fungsinya?

Untuk itulah kita membutuhkan handle untuk eror, karena faktor external tidak bisa kita kendalikan.

Untuk meng-handle error di dalam python, kita menggunakan try except. 

contoh:

```
import json

def file(nama_file):
    try:
        with open(nama_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("file-nya eror bang")
        return []

data = file("apadeh.txt")

print(data)

```

Jika file apadeh.txt itu gada. kita akan dikasih tau bahwasanya "file-nya eror bang". jadi, program-nya tidak crash. aplikasi tetap berjalan, user dapat penjelasan.

Ini adalah maksud dari sintaks pada error handling: 

- `try` → coba jalankan dulu.
- `except TipeErronyapa` → kalau error dengan tipe itu, jalankan ini.
- `else` → kalau tidak ada error sama sekali, jalankan ini.
- `finally` → apapun yang terjadi, error atau tidak, jalankan ini.



> Software yang baik bukan software yang tidak pernah gagal, tetapi software yang tahu apa yang harus dilakukan ketika gagal. 
>
>  ~ chatgpt

