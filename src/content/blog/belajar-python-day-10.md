---
title: "belajar python day 10: string"
slug: belajar-python-day-10
description: belajar python day 10, cuman kok string?
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-16
modDatetime: 2026-07-16
draft: false
featured: false
tags:
  - Learning
  - Python
---
### String

kenapa string? kenapa baru belajar ini di day 10?

karena, string tidak semudah beda dengan integer. di dalam string, kita bisa "memanipulasinya" dengan membuatnya kapital, lower, atau bahkan menambahkannya.

memahami string ini penting untuk kedepannya, jika kita ingin mengambil request dari api, dan lain sebagainya.

### Slicing

di dalam string, kita bisa men-slice, atau memotongnya menjadi beberapa bagian. 

contoh:

```
list = ['wahaha']
print(list[:3]
```

artinya, kita mengambil huruf ketiga awalannya saja. outputnya menjadi:

```
wah
```

### method chaining

menggabungkan string atau mengubahnya. contoh:

```
teks = "  Halo DUNIA!  "

# Menggabungkan tiga metode secara berurutan
dibersihkan = teks.strip().lower().replace("!", ".") cetak(dibersihkan) 

```

output:

```
"hello world."
```

method chaining ini dapat bermanfaat saat kita menerima input dari user yang asal-asalan, dan kita ingin merapikannya. entah itu untuk disimpan di database, atau menampilkannya dengan rapih di UI.

### string dalam dictionary

```
produk = {
    "nama": " telur ayam ",
    "harga": 30000
}
```

produk, adalah dictionary. sedangkan untuk key-nya kebetulan berupa string.

karena berupa string, kita dapat menggunakan method chaining:

```
produk["nama"].strip().upper()
```

kita tidak bisa langsung menggunakan:

```
produk.strip()   # ❌
```

---



### Return di dalam loop

selain mempelajari tentang string, hari ini saya melakukan kesalahan yang sama dengan kemaren, yaitu menyimpan return di dalam loop.

hal ini bisa berakibat sangat fatal saat kita menggunakannya dengan keliru.

> kenapa?

sebagai contoh, bayangkan sebuah parkiran.

terdapat parikan A, B dan C.

jika kita mencari parkiran a, lalu penuh. lantas apa yang kita lakukan?

kita akan mencari di parkiran B.

ketika kita menemukan tempat kosong di parkiran B, apakah kita akan mencari tempat parkir kosong di tempat C?? jawabannya, tentuk tidak. kan?

```
def cari_parkir(tempat):
    for huruf, isi in tempat.items():
        if isi == "kosong":
            return f"Parkir di {huruf}"  # begitu nemu, langsung parkir. Berhenti mencari.
    return "Penuh"  # cuma jalan kalau semuanya isi

print(cari_parkir({"A": "isi", "B": "kosong", "C": "kosong"}))
# Output: Parkir di B
```

itulah yang terjadi, jika kita menyimpan return di dalam loop. kita terus mencari meski kita sudah mendapat parkiran di tempat B, sangat tidak efisien. ngapain kita mencari parkiran di tempat C?