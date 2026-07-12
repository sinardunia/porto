---
title: "belajar python day 7: fungsi range()"
slug: belajar-python-day-7
description: recap pembelajaran di hari ke 7
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-13
modDatetime: 2026-07-13
draft: false
featured: false
---
Hari ini, rasanya tidak terlalu banyak progress. Banyak hal kemarin yang masih belum terlalu paham, seperti akumulasi dan iterasi dalam kode.

Berikut penjelasan recap kemarin, beserta materi baru di hari ini:

### Akumulator

Akumulator diibaratkan seperti celengan, kita dapat menyimpan nilai:

```
celengan = 0           # celengan kosong

celengan += 5000       # hari 1: masukkan 5000 → isi celengan 5000
celengan += 3000       # hari 2: masukkan 3000 → isi celengan 8000
celengan += 10000      # hari 3: masukkan 10000 → isi celengan 18000

print(celengan)        # 18000
```

Akumulator biasanya digunakan dengan looping, kenapa? Karena jika kita menulis kode yang sama sebanyak 365 hari, tentu kita akan kewalahan, Tentu  itu bukan best practice!

> don't repeate yourself

akan sederhana jika kita menggunakan looping:

```
celengan = 0
uang_harian = [5000, 3000, 10000]   # uang masuk tiap hari

for uang in uang_harian:
    celengan += uang                # masukkan ke celengan

print(celengan)                     # 18000
```

kita tidak perlu menulisnya secara berulang, kan? lebih efektif dan efisien!

Sederhananya, akumulator adalah variabel yang nilainya berubah secara terus-menerus.

### Range()

Range adalah fungsi bawaan python. Kenapa kita menggunakan range? karena kita tidak selalu memiliki list, untuk itulah range dibutuhkan



Dengan menggunakan range(), kita bisa menetapkan angka yang kita ingin mulai, berhenti, bahkan sampai "loncat", contoh:

```
for i in range(1, 8):
    print(i)

```

```
output:
1
2
3
4
5
6
7
```

parameter kedua, yaitu 8. tidak ditampilkan ke layar, karena artinya stop.

urutan parameter dalam range: Range(start, stop, step)

arti step adalah loncat,  jika kita menuliskan:

```
range(1, 10, 2) 
```

akan menghasilkan output:

```
1
3
5
7
9
```

karena, kita menggunakan paramtere ketiga yaitu step 2, jadi angkanya loncat 2.