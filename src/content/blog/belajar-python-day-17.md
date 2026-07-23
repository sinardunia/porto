---
title: "belajar python day 17: Rest API"
slug: belajar-python-day-17
description: Hari ini kita belajar materi tentang API, menggunakan FastAPi
pubDatetime: 2026-07-23
modDatetime: 2026-07-23
draft: false
featured: false
---
### API

Aplication Programming Interface, itu arti dari API.

> Untuk apa?

Untuk membuat aplikasi kita bisa bertukar data, baik aplikasi mobile maupun web.

### Metode HTTP

Kemarin, kita sudah mempelajari tentang HTTP. Nah, di http kita menggunakan respon kode, dengan tujuan memudahkan kita mengetahui ini erornya kenapa. contoh:

- 404: kalian mungkin ga asing dengan ++*404 not found,* Yang artinya adalah tidak ditemukan++
- 200: artinya berhasil sukses tanpa kendala
- Dan masih banyak lagi

kita sudah bahas hal itu, namun perlu diketahui bahwasanya dalam API, HTTP memiliki perintah yang mewakili tindakan tertentu:

- GET: mengambil data
- POST: ngirim data
- PUT: edit data
- DELETE: hapus data

Di hari-hari sebelumnya kita sudah menggunakan API dari jsonplaceholder.

> tapi kali ini kita bukan client, kita akan buat sendiri API nya!

### Fast API

FastApi, adalah framework yang memudahkan kita untuk membuat API. Selain memudahkan, juga mempunyai liblary bawaan seperti pydantic untuk validasi kiriman dari user tanpa kita buat manual.

> Intinya, memudahkan:)

sebelum menggunakan framwork/liblary ini kita wajib menginstall-nya terlebih dahulu menggunakan pip:

```
pip install fastapi uvicorn
```

### Langkah pertama

lalu, langkah pertama kita buat server paling sederhana:

```
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def baca_root():
    return {"pesan": "Halo, ini API pertama saya!"}
```

Artinya, kita ambil dari liblary fastapi dengan import terlebih dahulu.

Kemudian, kita buat variabel app dengan disii FastApi() yang artinya kita membuat aplikasi ini menjadi server! gokil gk tuh...

Terakhir, kita buat routingnya ke index, yaitu:

```
/
```

dengan mereturn "Halo, ini adalah api pertama saya!

### Jalankan server

untuk menjalankannya kita membutuhkan liblary lain, kali ini kita menggunakan uvicorn. tentunya, kita mesti install terlebih dahulu

```
pip install uvicorn
```

lalu jikalau sudah terinstal, maka kita tinggal jalanin aja:

```
uvicorn server:app --reload
```

Buka port  yang dikasih, contohnya di browser:`http://127.0.0.1:8000`

maka akan muncul tulisan di browser:

```
{"pesan": "Halo, ini API pertama saya!"}
```

Sudah otomatis di konversi menjadi json, bukan dictionary lagi. sungguh memudahkan hidup wkwk



