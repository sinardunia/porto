---
title: "belajar python day 13: file i/o"
slug: belajar-python-day-13
description: hari ini kita belajar tentang file i/o
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-19
modDatetime: 2026-07-19
draft: false
featured: false
tags:
  - Learning
  - Python
---
### File

Hari ini kita belajar sesuatu yang sedikit berbeda dari hari-hari sebelumnya, yaitu file.

> Kenapa file ini ada?
>
>

Dengan file kita bisa menyimpan data meski kode sudah selesai di eksekusi.

contoh kode:

```
with open("contoh.txt", "r") as file:
    nama = file.read()
```

- r di dalam parameter ke dua tersebut artinya read, kita membaca file dari contoh.txt

ada juga nama parameter yang bisa kita gunakan di dalam itu, ada w, ada r, ada x.

- r untuk rea
- w untuk write (menimpa)
- x untuk create



&nbsp;