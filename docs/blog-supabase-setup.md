---
title: Blog Supabase Setup
---

# Blog Supabase Setup

Blog posts are longer shaped reflections. They are separate from thoughts, but they should still feel like the same quiet personal archive.

## Required environment variables

Add these locally and in Vercel Project Settings:

```txt
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
THOUGHTS_ADMIN_SECRET=your_private_admin_secret
SITE_URL=https://your-domain.example
```

For now, blog posts use the same private admin secret as thoughts to keep the writing system simple.

## Exact SQL setup

Run this in Supabase SQL Editor:

```sql
create extension if not exists pgcrypto;

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  cover_image_alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_published boolean not null default false
);

alter table blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on blog_posts;

create policy "Public can read published blog posts"
on blog_posts
for select
using (is_published = true);
```

Do not add tags, categories, likes, views, comments, reactions, author profiles, SEO scores, or analytics fields.

## Storage bucket setup

The blog admin page uploads cover images to a public Supabase Storage bucket named:

```txt
blog-images
```

Create it in the Supabase Dashboard, or run:

```sql
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;
```

The server uploads images through `/api/blog` using `SUPABASE_SERVICE_ROLE_KEY`, so no public upload policy is required.

## Verify RLS

```sql
select relrowsecurity
from pg_class
where relname = 'blog_posts';
```

Expected:

```txt
true
```

## Verify public read policy

```sql
select policyname, cmd, qual
from pg_policies
where tablename = 'blog_posts';
```

Expected policy:

```txt
Public can read published blog posts
```

## Verify storage bucket

```sql
select id, name, public
from storage.buckets
where id = 'blog-images';
```

Expected:

```txt
blog-images | blog-images | true
```

## Manual insert test

```sql
insert into blog_posts (slug, title, excerpt, content, is_published)
values (
  'first-supabase-blog-post',
  'First Supabase Blog Post',
  'A quiet test blog post from Supabase.',
  '# First Supabase Blog Post\n\nThis is a longer reflection stored in Supabase.',
  true
);
```

Then open:

```txt
/posts
/posts/first-supabase-blog-post
```

Published rows should appear immediately without rebuilding because `/posts` and `/posts/[slug]` are runtime routes.

## Admin posting test

Open:

```txt
/admin/blog
```

Test in this order:

1. Save a draft with `Publish now` unchecked.
2. Confirm it does not appear on `/posts`.
3. Save a published post with `Publish now` checked.
4. Confirm it appears immediately on `/posts` and `/posts/[slug]`.
5. Upload a cover image smaller than 5MB.
6. Confirm `cover_image_url` and `cover_image_alt` are stored in `blog_posts`.
7. Confirm the image appears publicly.

## Vercel deployment checklist

1. Install dependencies with `npm install`.
2. Ensure `astro.config.mjs` uses `@astrojs/vercel`.
3. Set these Vercel environment variables for Production, Preview, and Development as needed:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
THOUGHTS_ADMIN_SECRET
SITE_URL
```

4. Deploy to Vercel.
5. Confirm these runtime routes work after deployment:

```txt
/thoughts
/admin/thoughts
/api/thoughts
/posts
/posts/[slug]
/admin/blog
/api/blog
```

## Migration note

Do not delete old Markdown files yet. Migrate one old post at a time into `blog_posts`.

The public `/posts` route now reads from Supabase, so legacy Markdown posts are preserved in the repository but no longer drive the public blog list.
