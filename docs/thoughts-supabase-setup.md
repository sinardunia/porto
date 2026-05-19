---
title: Thoughts Supabase Setup
---

# Thoughts Supabase Setup

This setup is only for short personal thoughts. Long-form blog posts stay in Astro Markdown content collections.

## Required environment variables

Add these to your local `.env` file and to your Vercel environment variables:

```txt
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
THOUGHTS_ADMIN_SECRET=your_strong_random_admin_secret
```

- `SUPABASE_URL` is your Supabase project URL.
- `SUPABASE_ANON_KEY` is safe for normal public reads, depending on your RLS policy.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in browser code.
- `THOUGHTS_ADMIN_SECRET` is the private password/token used by the hidden posting page.

## Exact SQL setup

Open Supabase SQL Editor and run this full setup:

```sql
create extension if not exists pgcrypto;

create table if not exists thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  image_url text,
  image_alt text,
  created_at timestamptz not null default now(),
  is_published boolean not null default true
);

alter table thoughts enable row level security;

drop policy if exists "Public can read published thoughts" on thoughts;

create policy "Public can read published thoughts"
on thoughts
for select
using (is_published = true);
```

This intentionally does not include likes, views, reactions, comments, tags, mood fields, followers, or analytics fields.

## Verify RLS and public read policy

Run:

```sql
select relrowsecurity
from pg_class
where relname = 'thoughts';
```

Expected:

```txt
relrowsecurity = true
```

Run:

```sql
select policyname, cmd, qual
from pg_policies
where tablename = 'thoughts';
```

Expected policy:

```txt
Public can read published thoughts
```

## Write access guidance

Do not create a public insert policy for thoughts.

The website writes through an Astro API route using the server-only `SUPABASE_SERVICE_ROLE_KEY`. The API route checks `THOUGHTS_ADMIN_SECRET` before inserting anything.

That means browser visitors can read published thoughts, but they cannot write directly to the table.

## Create the image storage bucket

In Supabase Dashboard:

1. Go to Storage.
2. Create a new bucket named:

```txt
thought-images
```

3. Make the bucket public for simple image display.

Images uploaded from the admin page will be stored in this bucket and displayed using public URLs.

Alternatively, run this SQL:

```sql
insert into storage.buckets (id, name, public)
values ('thought-images', 'thought-images', true)
on conflict (id) do update set public = true;
```

## Verify storage bucket

Run:

```sql
select id, name, public
from storage.buckets
where id = 'thought-images';
```

Expected:

```txt
id = thought-images
public = true
```

## Minimal storage policy guidance

For this phase, image uploads are performed from the server API route using the service role key.

Do not create a public upload policy unless you intentionally want browser clients to upload directly.

For public image display, a public bucket is the simplest option.

## Manually test table inserts

After creating the table, run this in Supabase SQL Editor:

```sql
insert into thoughts (content, image_alt)
values ('Testing the thoughts archive from Supabase.', null);
```

Then open:

```txt
/thoughts
```

You should see the test thought if your environment variables and Supabase connection are configured correctly.

## Manually test unpublished thoughts

Run:

```sql
insert into thoughts (content, is_published)
values ('This should stay hidden.', false);
```

This row should not appear on `/thoughts`.

## Admin posting route

The hidden posting route is:

```txt
/admin/thoughts
```

It is intentionally not linked from the main navigation.

Use your `THOUGHTS_ADMIN_SECRET` as the admin secret when posting.

## Local testing flow

1. Create a local `.env` file with the required variables.
2. Run the dev server.
3. Open `/admin/thoughts`.
4. Enter `THOUGHTS_ADMIN_SECRET`.
5. Write a short thought.
6. Optionally upload an image smaller than 5MB.
7. Submit.
8. Check Supabase Table Editor for a new row in `thoughts`.
9. Check Supabase Storage for a new file in `thought-images`.
10. Open `/thoughts` and verify the thought appears.

## Production testing flow

1. Add all required env vars in Vercel.
2. Deploy the site.
3. Open `/admin/thoughts` on your phone.
4. Post a text-only thought first.
5. Confirm it appears on `/thoughts`.
6. Post another thought with an image.
7. Confirm the image appears on `/thoughts`.

If posting works but `/thoughts` does not update, check that `/thoughts` is being handled by the Vercel SSR function and that `export const prerender = false` is still present.
