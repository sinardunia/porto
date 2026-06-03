# Personal Blog

A minimal personal blog built with [Astro 5](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Pages CMS](https://pagescms.org) for content editing.

**Live:** [waltahh.vercel.app](https://waltahh.vercel.app)

## Stack

| Layer | Tool |
|-------|------|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3 |
| Hosting | Vercel (SSR) |
| Content | Astro Content Collections (`src/content/blog`) |
| CMS | Pages CMS (`.pages.yml`) |

## Structure

```
src/
├── components/     # UI (Header, blog list, search, etc.)
├── content/blog/   # Markdown posts (single source of truth)
├── layouts/        # Page shell
├── lib/            # Blog helpers
├── pages/          # Routes
└── scripts/        # Small client enhancements (search)
```

## Development

```bash
npm install
npm run dev
npm run build
```

### Environment

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | Canonical URL for SEO, RSS, and sitemap |

## Content

- Posts live in `src/content/blog` as Markdown with YAML frontmatter.
- Schema is defined in `src/content.config.ts`.
- Edit content via [Pages CMS](https://app.pagescms.org) — `/admin` redirects to the configured Pages CMS project.

## Deployment

Deployed to Vercel with server-side rendering for dynamic routes (home search, RSS, sitemap). Blog posts are loaded from the content collection at build/runtime.

## License

MIT
