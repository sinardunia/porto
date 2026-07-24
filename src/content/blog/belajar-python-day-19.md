---
title: "belajar python day 19: Pydantic"
slug: belajar-python-day-19
description: Hari ini kita belajar tentang pydantic
coverImage: /images/e520d5fdf66615af98e523582d226bef.jpg
pubDatetime: 2026-07-25
modDatetime: 2026-07-25
draft: false
featured: false
tags:
  - Learning
  - Python
---
### Pydantic

Apa itu pydantic? Apa fungsinya?

Hari ini kita dapat materi tentang pydantic, sebuah liblary  yang sudah kita pelajari kemaren.

Fungsi dari pydantic adalah memudahkan kita untuk membuat sebuah validasi.

Jika kamu memiliki data postingan yaitu judul dan isi, tentunya kita ingin user mengisi keduanya. jika user cuma ngisi judul, dan isinya dibiarin gitu aja. itu bisa menjadi masalah!

Tapi, jika kita membuatnya manual menggunakan if else dan error handling, tentu itu tidak best practice!

Maka, kita menggunakan pydantic untuk memudahkan kita...



```
from pydantic import BaseModel


class Post(BaseModel):
    judul: str
    isi: str


```

kita import terlebih dahulu, lalu kita inisialisasikan ke dalam class.

```

@app.post("/posts", status_code=201)
def buat_post(post: Post):
        id_baru = posts[-1]["id"] + 1 if posts else 1
        post_dictionary = post.model_dump()
        post_dictionary["id"] = id_baru
        posts.append(post_dictionary)
        return post

```

Kita tinggal simpen aja di parameter post: Post.

