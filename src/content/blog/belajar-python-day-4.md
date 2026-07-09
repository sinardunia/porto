---
title: "belajar python day 4: Gerbang Logika"
slug: belajar-python-day-4
description: belajar python active recall hari ke 4
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-10
modDatetime: 2026-07-10
draft: false
featured: false
---
### Gerbang Logika

hari ini saya belajar tentang logika dalam python, ada beberapa simbol yang saya mengerti:

- and: Berlaku keduanya. jika kondisi keduanya terpenuhi maka bernilai true
- or: Salah satu. jika salah satu benar, maka benar.
- not: mirip seperti ! di javascript, artinya negasi. atau membalikan kondisi yang dulunya false menjadi true atau sebaliknya.

Di python ada juga prioritas dalam menjalankan suatu kode, seperti jika dikasih () maka jadi prioritas.

Berikut adalah tabel prioritas dalam python jika suatu saat lupa, Tulisan ini bisa menjadi second brain:


| **Priority** | **Operator** | **Description** | **Associativity** |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- |
| **1 (Highest)** | `()` | Parentheses (grouping) | Left-to-right |
| **2** | `**` | Exponentiation (power) | **Right-to-left** |
| **3** | `+x`, `-x`, `~x` | Unary plus, unary minus, bitwise NOT | Right-to-left |
| **4** | `*`, `/`, `//`, `%` | Multiplication, division, floor division, modulo | Left-to-right |
| **5** | `+`, `-` | Addition and subtraction | Left-to-right |
| **6** | `<<`, `>>` | Bitwise left and right shifts | Left-to-right |
| **7** | `&` | Bitwise AND | Left-to-right |
| **8** | `^` | Bitwise XOR | Left-to-right |
| **9** | ` | ` | Bitwise OR | Left-to-right |
| **10** | `==`, `!=`, `>`, `>=`, `<`, `<=`, `is`, `is not`, `in`, `not in` | Comparisons, identity, and membership tests | Left-to-right |
| **11** | `not` | Logical NOT | Right-to-left |
| **12** | `and` | Logical AND | Left-to-right (with short-circuit) |
| **13** | `or` | Logical OR | Left-to-right (with short-circuit) |
| **14 (Lowest)** | `=`, `+=`, `-=`, `*=`, etc. | Assignment operators | Right-to-left |


