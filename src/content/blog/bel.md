---
title: "belajar python day 9: dictionary"
slug: belajar-python-day-9
description: "hari ini belajar tentang dictionary "
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-15
modDatetime: 2026-07-15
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Dictionary

dictionary, mengingatkan saya terhadap object di javascript. karena sama-sama menggunakan {}.

ini adalah contoh dictionary dalam python:

```
stok_gudang = {
    "A": 15,
    "B": 8,
    "C": 20
}
```

untuk menampilkannya kita bisa menuliskannya seperti ini:

```
print(stok_gudang["B"])
```

output:

```
8
```

jika tidak ingin output seperti itu, di dalam dictionary, kita bisa menampilkan keynya juga. contoh:

```
for key, value in stok_gudang.items():
    print(f"stok barang {key} adalah {value}")

```

kita menggunakan looping, untuk mencetak semua isi dari dictionary. tidak hanya isi, tapi key nya juga.

> ngomong-ngomong, fungsi items() tersebut adalah

untuk menampilkan key dan value. jika kita ingin menampilkan valuenya saja, atau key-nya saja. kita bisa menggunakan:

- values() untuk menampilkan value
- keys() untuk menampilkan key
- items() untuk menampilkan keduanya

### key dan value

untuk memperjelas, key adalah A, B, C yang ada di kiri. sedangkan value adalah isi dari abc itu, yaitu 15,8,20.

sederhananya, ini mirip variabel tapi banyak! 

- key: digunakan sebagai label
- value: digunakan sebagai data

---

### default value dalam parameter

selain itu, saya notice hal kecil dalam fungsi yang kita bahas kemarin.

bahwasanya, fungsi bisa menyimpan paramter, kan? nah, parameter ini bisa menyimpan default value. contoh:

```
def cek_stok_rendah(stok, batas = 10):
    total_rendah = 0
    for key, value in stok.items():
        if value < batas:
            print(f"stok barang {key} rendah, hanya {value} tersisa")
            total_rendah += 1
    return total_rendah
```

di kode fungsi barusan, kita bisa menetapkan isi dari sebuah parameter. sehingga, saat fungsi dipanggil parameter kedua menjadi opsional!

tidak hanya itu, kita juga dimudahkan dengan adanya default value ini, sehingga kita bisa melakukan penkondisian dalam if, kita hanya perlu menyebutkan parameternya saja.



