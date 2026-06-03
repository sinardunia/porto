# Porto

A minimal personal publication built with [Astro 5](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Pages CMS](https://pagescms.org).

**Live:** [waltahh.vercel.app](https://waltahh.vercel.app)

## Stack

| Layer | Tool |
|-------|------|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3 + Typography |
| Hosting | Vercel (SSR) |
| Content | Astro Content Collections (`src/content/blog`) |
| CMS | Pages CMS (`.pages.yml`) |

## Development

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

Set `SITE_URL` in `.env` to your canonical domain (SEO, RSS, sitemap, Open Graph).

## Content

Posts live in `src/content/blog` as Markdown with YAML frontmatter.

| Field | Description |
|-------|-------------|
| `title` | Article title |
| `description` | Summary for listings and SEO |
| `pubDatetime` | Publish date |
| `modDatetime` | Last modified (optional) |
| `tags` | Tag list |
| `draft` | Hide from site when `true` |
| `featured` | Boost in sitemap priority |
| `coverImage` | Cover image path from `/images/...` (upload via Pages CMS) |

Edit content at [Pages CMS](https://app.pagescms.org) — `/admin` redirects to the configured project.

Cover images and inline images upload to `public/images` via Pages CMS media.

## License

MIT
