---
title: "belajar python day 8: function"
slug: belajar-python-day-8
description: di hari ke 8 ini, saya belajar tentang fungsi
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-14
modDatetime: 2026-07-14
draft: false
featured: false
tags:
  - Learning
  - Python
---
Hari ke 8, akhirnya kita belajar tentang fungsi dalam python.

### Function

Fungsi ada di hampir semua bahasa pemrograman, tanpa fungsi kita akan melakukan kode yang sama terus menerus, sangat tidak efisien.

Fungsi sangat memudahkan kita untuk:

- menghindari duplikasi
- membuat kode bisa digunakan kembali
- menyembunyikan kompleksitas dibaliknya, dengan nama yang mudah dimengerti

Secara default, python juga memiliki fungsi bawaan, seperti yang sudah kita lakukan di hari sebelumnya yaitu range() dan masih banyak lagi!

### Parameter

Parameter adalah variabel yang menerima input ketika fungsi dipanggil, contoh:

```
def say_hello(nama)
    print(f"helo bang {nama}")

say_hello("waltahh")
say_hello("kim jong un")
say_hello("jokouwi")
```

Kita bisa menggunakan parameter untuk menyimpan nilai, sehingga kita bisa memanggilnya berulang dengan nilai berbeda. Sungguh mempermudah hidup!

### Return

Dalam fungsi, kita juga bisa menggunakan return. 

> Apa itu return?

return, berfungsi sebagai membalikan nilai. contoh:

```
def hitung_diskon(total_belanja):
    if total_belanja > 500000:
        return total_belanja * 0.1
    else:
        return 0
    
diskon = hitung_diskon(600000)

print(f"Diskon yang didapatkan adalah Rp{diskon}")
```

### Return vs  Print

Lalu, apa bedanya return dan print? kenapa mesti repot-repot menggunakan return? padahal kita bisa langsung print saja, kan?

Jawabannya, tidak begitu. kenapa?

hal ini dikarenakan print, tidak mengembalikan nilai. print() hanya menampilkan ke layar, itu doang.

sedangkan return, bisa dipakai lagi di kode lain, dikirim ke fungsi lain, disimpan, dsb.



Dari ChatGpt:

```
Mental Model Hari Ini

Bayangkan function seperti sebuah mesin kopi.

Parameter = biji kopi + air.

Function = mesin yang mengolah.

Return = secangkir kopi yang keluar.

Print = hanya memamerkan kopi ke orang lain.

Kalau mesin hanya print, kopi tidak pernah keluar untuk dipakai mesin lain.

Kalau mesin return, kopi bisa diminum, dijual, dikirim, atau dipakai membuat resep lain.

Programming modern adalah menyambungkan mesin-mesin kecil menjadi sistem besar.
```

