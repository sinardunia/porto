---
title: "belajar python day 14: JSON"
slug: belajar-python-day-14
description: kali ini kita belajar tentang json dalam python
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-20
modDatetime: 2026-07-20
draft: false
featured: false
tags:
  - Learning
  - Python
---
### JSON

Hari ini, kita belajar tentang JSON.

> Apa itu JSON?

Singkatnya, json adalah Javascript Object Notation.

> Kenapa kita menggunakan JSON?

Karena, JSON adalah format yang dimengerti hampir oleh semua bahasa pemrograman, bahkan respon API juga menggunakan JSON.

### JSON VS Dictionary

> Apa bedanya? JSON dan Dictionary? Bukankah sama aja formatnya pake {} ada key dan value? sama aja dong?

Tidak, itu berbeda. Dictionary bisa kita mutable dengan kode di python, sedangkan JSON adalah string yang mempresentasikan data.

Contoh:

```
data = {"harga": 1200}
data["harga"] = 5000   # bisa, dictionary itu mutable
```

Kode tersebut adalah dictionary, bisa diubah dan bisa diotak-atik.

Bedanya dengan json adalah, contoh:

```
teks = '{"harga": 4000}'
# teks["harga"] = 5000  ← ERROR, ini string, bukan dict 
```

String json, tidak bisa diubah langsung. 

### Fungsi JSON dalam python

Python memiliki liblary bawaan yang bisa kita pakai untuk mem-parsing JSON. Kita bisa mengaksesnya dengan import json, lalu menggunakan fungsi bawaan-nya. 

- `dumps()` → object → string JSON
- `loads()` → string JSON → object

khusus untuk dari file kita menggunakan dump dan load, tidak ada S nya.

- `dump()` → object → file JSON
- `load()` → file JSON → object



&nbsp;