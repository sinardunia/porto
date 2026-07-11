---
title: "belajar python day 6: loop"
slug: belajar-python-day-6
description: active recall dari pembelajaran python di day 6, tentang pengulangan
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-12
modDatetime: 2026-07-12
draft: false
featured: false
tags:
  - Learning
  - Python
---
Hari ini belajar tentang pengulangan di dalam python.

### loop

kenapa loop? karena jika kita menuliskan kode secara berulang itu tidak efisien, maka dari itu kita membutuhkan loop.

contoh:

```
hasil_panen = [120, 85, 150, 90, 110]

total = 0

for hasil in hasil_panen:
    total += hasil

print(total)
```

di kode tersebut kita mencoba menghitung total hasil panen, dari hari ke hari (list). untuk menghitungnya kita menggunakan for sehingga kita mengulangnya tanpa perlu print ke layar satu persatu.



di dalam loop, kita juga bisa memberikan kondisi.

contoh:

```
stok = [15, 8, 20, 3, 12]

nomor = 1

for jumlah in stok:
    if jumlah < 10:
        print(f"Gudang {nomor}: Stok rendah ({jumlah})")
    else:
        print(f"Gudang {nomor}: Stok aman ({jumlah})")

    nomor += 1
```

di kode tersebut, kita bisa menampilkan stok yang rendah sehingga kita bisa mengelompokan stok mana yang rendah, mana yang tidak.



Yang saya pahami hari ini:

- for adalah sintaks dalam python untuk melakukan looping
- di dalam loop kita tidak hanya bisa mengulang kode, tapi kita bisa menambahkan kondisi

